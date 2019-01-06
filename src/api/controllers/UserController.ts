import * as crypto from 'crypto';
import { validate, Validator } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import transporter from '../services/email';
import { User } from '../entity/User';
import { filteredBody } from '../utils/filterBody';
import { jwtSecret, serverUrl, clientUrl } from '../../config/variables';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if user already exists
    const userExists = await getRepository(User).findOne({
      where: { email: req.body.email }
    });
    if (userExists) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'email',
            message: 'This email already exists'
          }
        });
    }

    // Check validation
    const body = filteredBody(req.body, ['email', 'name', 'password', 'passwordConfirm']);
    const errors = await validate("registerValidationSchema", body);
    if (errors.length > 0) {
      return res.status(HTTPStatus.OK).json({
        success: false,
        errors: {
          message: 'Something went wrong.'
        }
      });
    }

    // Check password confirmation
    const validator = new Validator();
    const passwordErrors = await validator.equals(req.body.password, req.body.passwordConfirm);
    if (!passwordErrors) {
      return res.status(HTTPStatus.OK).json({
        success: false,
        errors: {
          type: 'passwordConfirm',
          message: 'Passwords do not match'
        }
      });
    }
    
    // Create user object and save
    const user = await getRepository(User).create(body);
    await getRepository(User).save(user);

    // Sign JWT and send email
    jwt.sign(
      {
        id: user.id
      },
      jwtSecret,
      {
        expiresIn: '1d'
      },
      (err, emailToken) => {
        const url = `${serverUrl}/api/users/confirmation/${emailToken}`;

        transporter.sendMail({
          to: user.email,
          subject: 'Confirm Email',
          html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`
        })
      }
    )

    return res.status(HTTPStatus.CREATED)
      .json({
        success: true,
        message: 'You successfully registered.'
      });

  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    return next(e);
  }
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
  return res.redirect(`${clientUrl}/login`);
}

export async function login(req: Request, res: Response, next: NextFunction) {
  res.status(HTTPStatus.OK)
    .json({
      user: req.user.toAuthJSON(),
      success: true
    });
  return next();
}
export async function loginValidation(req: Request, res: Response, next: NextFunction) {
  // Check if user already exists
  const userExists = await getRepository(User).findOne({
    where: { email: req.body.email }
  });
  if (!userExists) {
    return res.status(HTTPStatus.OK)
      .json({
        success: false,
        errors: {
          type: 'email',
          message: 'There is no account with such email.'
        }
      });
  }

  // Check validation
  const body = filteredBody(req.body, ['email', 'password']);
  const errors = await validate("loginValidationSchema", body);
  if (errors.length > 0) {
    return res.status(HTTPStatus.OK).json({
      success: false,
      errors: {
        message: 'Something went wrong'
      }
    });
  }

  if (!userExists.authenticateUser(req.body.password)) {
    return res.status(HTTPStatus.OK)
      .json({
        success: false,
        errors: {
          type: 'password',
          message: 'Invalid password'
        }
      });
  }

  return next();
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.user;
    const body = filteredBody(req.body, ['oldPassword', 'newPassword', 'newPasswordConfirm']);
    const errors = await validate("changePasswordValidationSchema", body);

    const user = await getRepository(User).findOne({
      where: { id: userId }
    });

    if (!user.authenticateUser(req.body.oldPassword)) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'oldPassword',
            message: 'You passed wrong old password.'
          }
        });
    }

    if (errors.length > 0) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            message: 'Something went wrong'
          }
        });
    }

    const validator = new Validator();

    const passwordErrors = await validator.equals(req.body.newPassword, req.body.newPasswordConfirm);
    if (!passwordErrors) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'newPasswordConfirm',
            message: 'Passwords do not match.'
          }
        });
    }

    const samePasswords = await validator.equals(req.body.oldPassword, req.body.newPassword);
    if (samePasswords) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'oldPassword',
            message: 'New password matches old password.'
          }
        });
    }

    // Change password and save
    await user.changePassword(body.newPassword);
    await getRepository(User).save(user);

    return res.status(HTTPStatus.OK)
      .json({
        success: true,
        message: 'You successfully changed your password.'
      });
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    // Check if user already exists
    const userExists = await getRepository(User).findOne({
      where: { email: req.body.email }
    });
    if (!userExists) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'email',
            message: 'An account with this email does not exist'
          }
        });
    }

    const body = filteredBody(req.body, ['email']);
    const errors = await validate("forgotPasswordValidationSchema", body);
    if (errors.length > 0) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'email',
            message: 'Wrong email.'
          }
        });
    }

    const user = await getRepository(User).findOne({
      where: { email: req.body.email }
    });

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    await getRepository(User).save(user);

    const url = `${clientUrl}/reset-password?token=${token}`;

    transporter.sendMail({
      to: user.email,
      subject: 'Link to Reset Password',
      html: `Please click this link to reset your password: <a href="${url}">${url}</a>`
    }, (err, response) => {
      if (err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      }
      return res.status(HTTPStatus.OK)
        .json({
          success: true,
          message: 'Message is now sent to your email'
        });
    });
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
  }
}
export async function resetPassword(req: Request, res: Response) {
  try {
    const body = filteredBody(req.body, ['newPassword', 'newPasswordConfirm']);
    const errors = await validate("resetPasswordValidationSchema", body);

    if (errors.length > 0) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            message: 'Something went wrong.'
          }
        });
    }

    const validator = new Validator();
    const passwordErrors = await validator.equals(req.body.newPassword, req.body.newPasswordConfirm);
    if (!passwordErrors) {
      return res.status(HTTPStatus.OK)
        .json({
          success: false,
          errors: {
            type: 'newPasswordConfirm',
            message: 'Passwords do not match'
          }
        });
    }

    const userToReset = await getRepository(User).findOne({
      where: { resetPasswordToken: req.query.token }
    });
    userToReset.resetPasswordToken = null;

    await userToReset.changePassword(req.body.newPassword);
    await getRepository(User).save(userToReset);

    return res.status(HTTPStatus.OK)
      .json({
        success: true,
        message: 'You successfully changed your password. Log in with new credencials.'
      });
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
  }
}
