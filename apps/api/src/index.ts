import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import eventsRouter from './routes/events';
import classesRouter from './routes/classes';
import participantsRouter from './routes/participants';
import passagesRouter from './routes/passages';
import resultsRouter from './routes/results';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/events', eventsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/passages', passagesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/admin', adminRouter);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-event', (eventSlug: string) => {
    socket.join(`event-${eventSlug}`);
    console.log(`Client ${socket.id} joined event: ${eventSlug}`);
  });

  socket.on('leave-event', (eventSlug: string) => {
    socket.leave(`event-${eventSlug}`);
    console.log(`Client ${socket.id} left event: ${eventSlug}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };

// Start server
server.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});
