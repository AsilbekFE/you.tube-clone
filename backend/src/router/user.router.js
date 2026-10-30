import { Router } from 'express';
import { getUsers } from '../controller/controller.js';

const userRouter = Router();

userRouter.get('/', getUsers);

export default userRouter;
