import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { getAllFiles, getFileById } from '../controllers/fileController.js';

const router = express.Router();

router.get('/', verifyFirebaseToken, getAllFiles);
router.get('/:fileId', verifyFirebaseToken, getFileById);

export default router;
