import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { User } from '../entity/User';
import { filteredBody } from '../utils/filterBody';
import { jwtSecret, gmailUser, gmailPassword } from '../../config/variables';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword
  }
})

export async function create(req: Request, res: Response, next: NextFunction) {
  const body = filteredBody(req.body, ['email', 'name', 'password']);
  try {
    const user = await getRepository(User).create(body);
    const errors = await validate("registerValidationSchema", user);
    if (errors.length > 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json(errors);
    }
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
          html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
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
