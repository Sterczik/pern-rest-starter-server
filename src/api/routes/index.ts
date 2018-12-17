import * as express from 'express';
import userRoutes from './UserRouter';
import todoRoutes from './TodoRouter';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/todos', todoRoutes);

export default router;
