import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { filteredBody } from '../utils/filterBody';

export async function create(req: Request, res: Response, next: NextFunction) {
  const body = filteredBody(req.body, ['email', 'name', 'password']);
  try {
    const user = await getRepository(User).create(body);
    const errors = await validate("registerValidationSchema", user);
    if (errors.length > 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json(errors);
    }
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

export async function loginValidation(req: Request, res: Response, next: NextFunction) {
  const body = filteredBody(req.body, ['email', 'password']);
  const errors = await validate("loginValidationSchema", body);
  
  if (errors.length > 0) {
    return res.status(HTTPStatus.BAD_REQUEST).json(errors);
  }
  return next();
}
