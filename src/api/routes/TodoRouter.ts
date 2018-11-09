import * as express from 'express';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Todo } from '../entity/Todo';
import { authJwt } from '../services/auth';
// import TodoController from '../controllers/TodoController';

const router = express.Router();

router.get('/', authJwt, async (req: Request, res: Response) => {
  const todos = await getRepository(Todo).find();
  res.send(todos);
});

router.get('/:id', authJwt, async (req: Request, res: Response) => {
  const todo = await getRepository(Todo).findOne({ where: { id: req.params.id } });
  res.send(todo);
});

router.post('/', authJwt, async (req: Request, res: Response) => {
  const todo = await getRepository(Todo).create(req.body);
  await getRepository(Todo).save(todo);
  res.send(todo);
});

router.put('/:id', authJwt, async (req: Request, res: Response) => {
  const todo = await getRepository(Todo).findOne({ where: { id: req.params.id } });
  todo.name = req.body.name;
  await getRepository(Todo).save(todo);
  res.sendStatus(200);
});

router.delete('/:id', authJwt, async (req: Request, res: Response) => {
  await getRepository(Todo).delete(req.params.id);
  res.sendStatus(200);
});

export default router;