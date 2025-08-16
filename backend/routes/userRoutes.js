import express from 'express';
import { getOrCreateUser, updateUser } from '../controllers/userController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', verifyFirebaseToken, getOrCreateUser);
router.put('/me', verifyFirebaseToken, updateUser);

export default router;
