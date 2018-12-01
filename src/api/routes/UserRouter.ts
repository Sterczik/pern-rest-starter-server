import * as express from 'express';
import * as UserController from '../controllers/UserController';
import { authLocal } from '../services/auth';

const router = express.Router();

router.post('/signup', UserController.create);
router.post('/login', UserController.loginValidation, authLocal, UserController.login);
router.get('/confirmation/:token', UserController.confirmRegister);

export default router;