import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { globalErrorHandler } from './middleware/error.middleware';
import { AppError } from './utils/errors';

const app = express();

// Base Middlewares
const clientOrigins = [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: clientOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Register API Routes
app.use('/api/v1', apiRoutes);

// Wildcard API Route Error
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling Middleware
app.use(globalErrorHandler);

export default app;
