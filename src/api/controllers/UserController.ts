import * as crypto from 'crypto';
import { validate, Validator } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import transporter from '../services/email';
import { User } from '../entity/User';
import { filteredBody } from '../utils/filterBody';
import { jwtSecret } from '../../config/variables';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = filteredBody(req.body, ['email', 'name', 'password']);
    const errors = await validate("registerValidationSchema", body);
    if (errors.length > 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json(errors);
    }
    const validator = new Validator();
    const passwordErrors = await validator.equals(req.body.password, req.body.passwordConfirm);
    if (!passwordErrors) {
      return res.status(HTTPStatus.BAD_REQUEST).json({ errors: 'Passwords does not match' });
    }
    
    const user = await getRepository(User).create(body);
    await getRepository(User).save(user);

    jwt.sign(
      {
        id: user.id
      },
      jwtSecret,
      {
        expiresIn: '1d'
      },
      (err, emailToken) => {
        const url = `http://localhost:3000/api/users/confirmation/${emailToken}`;

        transporter.sendMail({
          to: user.email,
          subject: 'Confirm Email',
          html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`
        })
      }
    )

    return res.status(HTTPStatus.CREATED).json({ success: true });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    return next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  res.status(HTTPStatus.OK).json(req.user.toAuthJSON());
  return next();
}

export async function loginValidation(req: Request, res: Response, next: NextFunction) {
  const body = filteredBody(req.body, ['email', 'password']);
  const errors = await validate("loginValidationSchema", body);
  
  if (errors.length > 0) {
    return res.status(HTTPStatus.BAD_REQUEST).json(errors);
  }
  return next();
}

export async function confirmRegister(req: Request, res: Response) {
  try {
    const token:any = jwt.verify(req.params.token, jwtSecret);
    const userToConfirm = await getRepository(User).findOne({
      where: { id: token.id }
    });
    userToConfirm.confirmed = true;
    await getRepository(User).save(userToConfirm);
  } catch (e) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(e);
  }

  return res.redirect('http://localhost:8080/login');
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.user;
    const body = filteredBody(req.body, ['newPassword']);
    const errors = await validate("changePasswordValidationSchema", body);

    const user = await getRepository(User).findOne({
      where: { id: userId }
    });

    if (!user.authenticateUser(req.body.oldPassword)) {
      return res.status(HTTPStatus.BAD_REQUEST).json({ error: "You passed wrong old password." });
    }

    if (errors.length > 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json(errors);
    }

    const validator = new Validator();
    const passwordErrors = await validator.equals(req.body.newPassword, req.body.newPasswordConfirm);
    if (!passwordErrors) {
      return res.status(HTTPStatus.BAD_REQUEST).json({ errors: 'Passwords does not match' });
    }

    await user.changePassword(body.newPassword);
    await getRepository(User).save(user);
    return res.status(HTTPStatus.OK).json(user);
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const body = filteredBody(req.body, ['email']);
    const errors = await validate("forgotPasswordValidationSchema", body);

    if (errors.length > 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json(errors);
    }

    const user = await getRepository(User).findOne({
      where: { email: req.body.email }
    });

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    await getRepository(User).save(user);

    const url = `http://localhost:8080/reset-password?token=${token}`;

    transporter.sendMail({
      to: user.email,
      subject: 'Link to Reset Password',
      html: `Please click this link to reset your password: <a href="${url}">${url}</a>`
    }, (err, response) => {
      if (err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      }
      return res.status(HTTPStatus.OK).json({ response });
    })

    return res.status(HTTPStatus.OK).json();
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const body = filteredBody(req.body, ['newPassword']);
    const errors = await validate("resetPasswordValidationSchema", body);

    if (errors.length > 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json(errors);
    }

    const validator = new Validator();
    const passwordErrors = await validator.equals(req.body.newPassword, req.body.newPasswordConfirm);
    if (!passwordErrors) {
      return res.status(HTTPStatus.BAD_REQUEST).json({ errors: 'Passwords does not match' });
    }

    const userToReset = await getRepository(User).findOne({
      where: { resetPasswordToken: req.query.token }
    });
    userToReset.resetPasswordToken = null;

    await userToReset.changePassword(req.body.newPassword);
    await getRepository(User).save(userToReset);

    return res.status(HTTPStatus.OK).json({ message: 'You successfully changed password!' });
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
  }
}
