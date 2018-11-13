// import { validate } from 'class-validator';
import * as Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { filteredBody } from '../utils/filterBody';

export const validation = {
  create: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(6)
        .max(30)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)
        .required(),
      name: Joi.string()
        .min(3)
        .max(30)
        .required(),
    },
  },
  login: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{6,30}$/)
        .required(),
    },
  },
};

export async function create(req: Request, res: Response, next: NextFunction) {
  const body = filteredBody(req.body, ['email', 'name', 'password']);
  try {
    const user = await getRepository(User).create(body);
    await getRepository(User).save(user);
    return res.status(HTTPStatus.CREATED).json(user.toAuthJSON());
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    return next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  res.status(HTTPStatus.OK).json(req.user.toAuthJSON());

  return next();
}