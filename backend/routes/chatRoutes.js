import express from 'express';
import { handleChat, handleFileSummaryAndQuestions } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChat);
// router.get('/summary/:fileId', handleSummary);
router.get('/file-info/:fileId', handleFileSummaryAndQuestions); // <- 🆕



export default router;
