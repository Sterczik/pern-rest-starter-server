import { Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import { Todo } from '../entity/Todo';

export async function getAll(req: Request, res: Response) {
  const userId = req.user;

  const todos = await getRepository(Todo).find({
    where: { user: userId }
  });

  res.status(HTTPStatus.OK).json(todos);
}

export async function getOne(req: Request, res: Response) {
  const userId = req.user;

  const todo = await getRepository(Todo).findOne({
    relations: ["user"],
    where: { id: req.params.id } 
  });

  if (todo) {
    if (todo.user.id === userId) {
      res.status(HTTPStatus.OK).json(todo);
    } else {
      res.status(HTTPStatus.UNAUTHORIZED).json(HTTPStatus.UNAUTHORIZED);
    }
  } else {
    res.status(HTTPStatus.NOT_FOUND).json(HTTPStatus.NOT_FOUND);
  }
}

export async function create(req: Request, res: Response) {
  const userId = req.user;

  const todo = await getRepository(Todo).create({
    ...req.body,
    user: userId
  });
  
  await getRepository(Todo).save(todo);
  res.status(HTTPStatus.OK).json(todo);
}

export async function edit(req: Request, res: Response) {
  const userId = req.user;

  const todo = await getRepository(Todo).findOne({
    relations: ["user"],
    where: { id: req.params.id }
  });

  if (todo) {
    if (todo.user.id === userId) {
      todo.name = req.body.name;
      await getRepository(Todo).save(todo);
      res.status(HTTPStatus.OK).json(todo);
    } else {
      res.status(HTTPStatus.UNAUTHORIZED).json(HTTPStatus.UNAUTHORIZED);
    }
  } else {
    res.status(HTTPStatus.NOT_FOUND).json(HTTPStatus.NOT_FOUND);
  }
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
      res.status(HTTPStatus.OK).json(HTTPStatus.OK);
    } else {
      res.status(HTTPStatus.UNAUTHORIZED).json(HTTPStatus.UNAUTHORIZED);
    }
  } else {
    res.status(HTTPStatus.NOT_FOUND).json(HTTPStatus.NOT_FOUND);
  }
}
