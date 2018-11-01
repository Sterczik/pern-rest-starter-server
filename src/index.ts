import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { Request, Response } from 'express';
import { createConnection, getRepository } from "typeorm";
import app from './config/express';
import { env, port } from './config/variables';

import { Todo } from './api/entity/Todo';

createConnection()
  .then(() => {
    const todoRepository = getRepository(Todo);

    app.get('/todos', async (req: Request, res: Response) => {
      const todos = await todoRepository.find();
      res.send(todos);
    });
    
    app.get('/todos/:id', async (req: Request, res: Response) => {
      const todo = await todoRepository.findOne({ where: { id: req.params.id } });
      res.send(todo);
    });
    
    app.post('/todos', async (req: Request, res: Response) => {
      const todo = todoRepository.create(req.body);
      await todoRepository.save(todo);
      res.send(todo);
    });

    app.put('/todos/:id', async (req: Request, res: Response) => {
      const todo = await todoRepository.findOne({ where: { id: req.params.id } });
      todo.name = req.body.name;
      await todoRepository.save(todo);
      res.sendStatus(200);
    });

    app.delete('/todos/:id', async (req: Request, res: Response) => {
      await todoRepository.delete(req.params.id);
      res.sendStatus(200);
    });
  })
  .catch(err => console.log(err));

app.listen(port, () => console.info(`Server started: Port ${port}, Env ${env}`));
