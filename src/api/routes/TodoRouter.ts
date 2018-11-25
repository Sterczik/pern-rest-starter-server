import * as express from 'express';
import { authJwt } from '../services/auth';
import * as TodoController from '../controllers/TodoController';

const router = express.Router();

router.get('/', authJwt, TodoController.getAll);
router.get('/:id', authJwt, TodoController.getOne);
router.post('/', authJwt, TodoController.create);
router.put('/:id', authJwt, TodoController.edit);
router.delete('/:id', authJwt, TodoController.remove);
router.put('/:id/status', authJwt, TodoController.switchStatus);

export default router;