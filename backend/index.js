import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import connectDB from './src/config/db.js';


const setUpApp = () => {
  dotenv.config();
  connectDB();
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(cors());
  app.use(express.json());


  app.get('/', (req, res) => {
    res.send('Welcome to the PDF Chatbot API');
  });

  app.use('/api/users', userRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/files', fileRoutes);

  // app.listen(PORT, () => {
  //   console.log(`Server running on http://localhost:${PORT}`);
  // });
  return app;
}

export default setUpApp;