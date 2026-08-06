import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { DurableStore } from './config/durableStore.js';
import logRoutes from './routes/logRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Trust Proxy for Cloudflare / Reverse Proxies / Tunnels
app.set('trust proxy', 1);

// Initialize Durable JSON Database
DurableStore.init();

// Security Middleware: Helmet HTTP Headers Hardening
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting Middleware: General API Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes.',
  },
});

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Apply Rate Limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve uploaded static files
const uploadBaseDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadBaseDir, {
  maxAge: '7d',
  etag: true,
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/clients', clientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Aura Fitness OS',
    usersCount: DurableStore.getUsers().length,
    logsCount: DurableStore.getLogs().length,
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build if available
let clientDistPath = path.join(process.cwd(), 'client', 'dist');
if (!fs.existsSync(clientDistPath)) {
  clientDistPath = path.join(process.cwd(), '..', 'client', 'dist');
}
if (!fs.existsSync(clientDistPath)) {
  clientDistPath = path.resolve(__dirname, '../../client/dist');
}

console.log(`📦 Serving client PWA bundle from: ${clientDistPath} (exists: ${fs.existsSync(clientDistPath)})`);

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Secure Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Aura Fitness Server running on port ${PORT}`);
});

export default app;
