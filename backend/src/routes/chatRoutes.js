import express from 'express';
import { handleChat, handleFileSummaryAndQuestions, getChatMessages } from '../controllers/chatController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyFirebaseToken, handleChat);
router.get('/file-info/:fileId', verifyFirebaseToken, handleFileSummaryAndQuestions);
router.get('/messages/:fileId', verifyFirebaseToken, getChatMessages);

export default router;
