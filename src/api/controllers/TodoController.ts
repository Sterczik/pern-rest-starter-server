import { validate } from 'class-validator';
import { Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import { Todo } from '../entity/Todo';
import { filteredBody } from '../utils/filterBody';

export async function getAll(req: Request, res: Response) {
  const userId = req.user;

  const todos = await getRepository(Todo).find({
    where: { user: userId }
  });
  return res.status(HTTPStatus.OK).json(todos);
}

export async function getOne(req: Request, res: Response) {
  const userId = req.user;

  const todo = await getRepository(Todo).findOne({
    relations: ["user"],
    where: { id: req.params.id } 
  });

  if (todo) {
    if (todo.user.id === userId) {
      return res.status(HTTPStatus.OK).json({
        ...todo,
        user: todo.user.id
      });
    }
    return res.status(HTTPStatus.UNAUTHORIZED).json(HTTPStatus.UNAUTHORIZED);
  }
  return res.status(HTTPStatus.NOT_FOUND).json(HTTPStatus.NOT_FOUND);
}

export async function create(req: Request, res: Response) {
  const userId = req.user;

  const body = filteredBody(req.body, ['name']);
  const errors = await validate("todoValidationSchema", body);
  if (errors.length > 0) {
    return res.status(HTTPStatus.BAD_REQUEST).json(errors);
  }

  const todo = await getRepository(Todo).create({
    ...req.body,
    user: userId
  });

  await getRepository(Todo).save(todo);
  return res.status(HTTPStatus.OK).json(todo);
}

export async function edit(req: Request, res: Response) {
  const userId = req.user;

  const body = filteredBody(req.body, ['name']);
  const errors = await validate("todoValidationSchema", body);
  if (errors.length > 0) {
    return res.status(HTTPStatus.BAD_REQUEST).json(errors);
  }

  const todo = await getRepository(Todo).findOne({
    relations: ["user"],
    where: { id: req.params.id }
  });

  if (todo) {
    if (todo.user.id === userId) {
      todo.name = req.body.name;
      await getRepository(Todo).save(todo);
      return res.status(HTTPStatus.OK).json({
        ...todo,
        user: todo.user.id
      });
    }
    return res.status(HTTPStatus.UNAUTHORIZED).json(HTTPStatus.UNAUTHORIZED);
  } 
  return res.status(HTTPStatus.NOT_FOUND).json(HTTPStatus.NOT_FOUND);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user;

  const todo = await getRepository(Todo).findOne({
    relations: ["user"],
    where: { id: req.params.id }
  });

  if (todo) {
    if (todo.user.id === userId) {
      await getRepository(Todo).delete(req.params.id);
      return res.status(HTTPStatus.OK).json({
        ...todo,
        user: todo.user.id
      });
    } 
    return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "You have no permissions to manage this Todo." });
  } 
  return res.status(HTTPStatus.NOT_FOUND).json({ message: "Not found." });
}

export async function switchStatus(req: Request, res: Response) {
  const userId = req.user;

  const todo = await getRepository(Todo).findOne({
    relations: ["user"],
    where: { id: req.params.id }
  });

  if (todo) {
    if (todo.user.id === userId) {
      todo.isDone = !todo.isDone;
      await getRepository(Todo).save(todo);
      return res.status(HTTPStatus.OK).json({
        ...todo,
        user: todo.user.id
      });
    } 
    return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "You have no permissions to manage this Todo." });
  } 
  return res.status(HTTPStatus.NOT_FOUND).json({ message: "Not found." });
}
