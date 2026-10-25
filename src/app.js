require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

// --- Security headers ---
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
}));

// --- Body parsing ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// --- Static assets ---
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// --- Health check (no database) ---
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, status: 'ok', mode: 'demo-localstorage', db: 'disabled' });
});

// --- Demo mode info ---
app.get('/api/v1/demo-info', (_req, res) => {
  res.json({
    success: true,
    mode: 'demo',
    message: 'SIRKULA is running in demo mode. Data is stored in browser localStorage. Not for production use.',
    demoAccounts: [
      { email: 'seller@demo.sirkula', role: 'SELLER', note: 'Login as seller to manage inventory' },
      { email: 'receiver@demo.sirkula', role: 'RECEIVER', note: 'Login as receiver to browse and reserve food' },
      { email: 'admin@demo.sirkula', role: 'ADMIN', note: 'Login as admin for platform oversight' },
    ],
  });
});

// --- 404 ---
app.use(notFound);

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
