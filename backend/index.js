import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Welcome to the PDF Chatbot API');
});

app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;
