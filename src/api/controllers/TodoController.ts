import { Request, Response } from 'express';
import * as HTTPStatus from 'http-status';
import { getRepository } from 'typeorm';
import { Todo } from '../entity/Todo';

export async function getAll(req: Request, res: Response) {
  const todos = await getRepository(Todo).find();
  res.status(HTTPStatus.OK).json(todos);
}

export async function getOne(req: Request, res: Response) {
  const todo = await getRepository(Todo).findOne({ where: { id: req.params.id } });
  res.status(HTTPStatus.OK).json(todo);
}

export async function create(req: Request, res: Response) {
  const todo = await getRepository(Todo).create(req.body);
  await getRepository(Todo).save(todo);
  res.status(HTTPStatus.OK).json(todo);
}

export async function edit(req: Request, res: Response) {
  const todo = await getRepository(Todo).findOne({ where: { id: req.params.id } });
  todo.name = req.body.name;
  await getRepository(Todo).save(todo);
  res.status(HTTPStatus.OK).json(todo);
}

export async function remove(req: Request, res: Response) {
  await getRepository(Todo).delete(req.params.id);
  res.status(HTTPStatus.OK).json(HTTPStatus.OK);
}
