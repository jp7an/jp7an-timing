import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (_req: Request, res: Response) => {
  res.json({ 
    message: 'API is working!',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});
