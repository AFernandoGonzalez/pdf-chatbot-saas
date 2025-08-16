import express from 'express';
import multer from 'multer';
import { handleUpload, handleImageUpload } from '../controllers/uploadController.js';
import {verifyFirebaseToken} from '../middleware/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-pdf', upload.single('file'), verifyFirebaseToken, handleUpload);
router.post('/upload-img', upload.single('file'), verifyFirebaseToken, handleImageUpload);

export default router;
