import express from 'express';
import multer from 'multer';
import { handleUpload, handleImageUpload } from '../controllers/uploadController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-pdf', upload.single('file'), handleUpload);
router.post('/upload-img', upload.single('file'), handleImageUpload);

export default router;
