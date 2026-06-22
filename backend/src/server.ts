import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import prisma from './utils/db';
import { authenticate } from './middleware/auth';
import * as authController from './controllers/auth.controller';
import * as collegeController from './controllers/college.controller';
import * as compareController from './controllers/compare.controller';
import * as userController from './controllers/user.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ success: true, status: 'UP', message: 'Server and Database are online.' });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({ success: false, status: 'DOWN', error: 'Database ping failed' });
  }
});

// Auth Routes
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/refresh', authController.refresh);
app.post('/api/auth/logout', authenticate, authController.logout);

// User Profile Routes
app.get('/api/users/me', authenticate, userController.getProfile);
app.put('/api/users/me', authenticate, userController.updateProfile);

// College Discovery Routes
app.get('/api/colleges', collegeController.getColleges);
app.get('/api/colleges/suggest', collegeController.getCollegeSuggestions);
app.get('/api/colleges/filters', collegeController.getFilters);
app.get('/api/colleges/:id', collegeController.getCollegeDetail);

// Reviews Routes
app.post('/api/colleges/:id/reviews', authenticate, collegeController.submitReview);
app.post('/api/colleges/:id/reviews/:rid/helpful', authenticate, collegeController.markReviewHelpful);

// College Comparison Routes
app.get('/api/compare', compareController.getComparison);
app.post('/api/saved-comparisons', authenticate, compareController.saveComparison);
app.get('/api/saved-comparisons', authenticate, compareController.getSavedComparisons);
app.delete('/api/saved-comparisons/:id', authenticate, compareController.deleteSavedComparison);

// Bookmarks Routes
app.get('/api/saved-colleges', authenticate, userController.getSavedColleges);
app.post('/api/saved-colleges', authenticate, userController.saveCollege);
app.delete('/api/saved-colleges/:id', authenticate, userController.deleteSavedCollege);

// Global Error Handler
const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: err.message || 'An unexpected internal error occurred' }
  });
};
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 College Discovery API Server running on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
