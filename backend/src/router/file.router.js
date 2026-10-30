import { Router } from 'express';
import {
    getFiles,
    getMyFiles,
    uploadFile,
    updateFile,
    deleteFile,
    downloadFile
} from '../controller/controller.js';
import { authGuard } from '../guard/auth.guard.js';

const fileRouter = Router();

fileRouter.get('/', getFiles);
fileRouter.get('/my', authGuard, getMyFiles);
fileRouter.post('/', authGuard, uploadFile);
fileRouter.put('/', authGuard, updateFile);
fileRouter.delete('/', authGuard, deleteFile);
fileRouter.get('/download/:fileId', downloadFile);

export default fileRouter;
