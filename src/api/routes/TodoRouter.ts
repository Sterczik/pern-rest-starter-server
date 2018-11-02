import * as express from 'express';
import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Todo } from '../entity/Todo';
// import TodoController from '../controllers/TodoController';

// const todoRepository = getRepository(Todo);

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const todos = await getConnection().getRepository(Todo).find();
  res.send(todos);
});

// router.get('/:id', async (req: Request, res: Response) => {
//   const todo = await todoRepository.findOne({ where: { id: req.params.id } });
//   res.send(todo);
// });

router.post('/', async (req: Request, res: Response) => {
  const todo = await getConnection().getRepository(Todo).create(req.body);
  await await getConnection().getRepository(Todo).save(todo);
  res.send(todo);
});

// router.put('/:id', async (req: Request, res: Response) => {
//   const todo = await todoRepository.findOne({ where: { id: req.params.id } });
//   todo.name = req.body.name;
//   await todoRepository.save(todo);
//   res.sendStatus(200);
// });

// router.delete('/:id', async (req: Request, res: Response) => {
//   await todoRepository.delete(req.params.id);
//   res.sendStatus(200);
// });

export default router;