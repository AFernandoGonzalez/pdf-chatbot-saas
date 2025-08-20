import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB with logs
connectDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// Basic API routes
app.get('/', (req, res) => res.send('Welcome to the PDF Chatbot API'));
app.get('/api', (req, res) => res.send('Welcome to the PDF Chatbot API'));

// App routes
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// **Bind to Render's dynamic PORT**
const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ PORT is not defined. Render will provide a dynamic port via process.env.PORT');
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🔗 Public URL should now be reachable at your Render subdomain');
});

export default app;
