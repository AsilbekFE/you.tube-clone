import { Router } from 'express';
import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import fileRouter from './file.router.js';
import { downloadFile } from '../controller/controller.js';

const router = Router();

// Auth routes (frontend /register va /login so'rovlarini to'g'ridan-to'g'ri yuboradi)
router.use('/', authRouter);
router.use('/auth', authRouter);

// Users routes
router.use('/users', userRouter);

// Files routes
router.use('/files', fileRouter);

// Direct download route
router.get('/download/:fileId', downloadFile);

export default router;
