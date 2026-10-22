require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { csrfProtection } = require('./middleware/csrf');
const prisma = require('./lib/prisma');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const marketplaceRoutes = require('./routes/marketplace');
const reservationRoutes = require('./routes/reservations');
const matchingRoutes = require('./routes/matching');
const notificationRoutes = require('./routes/notifications');
const impactRoutes = require('./routes/impact');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');

const app = express();

app.set('trust proxy', 1);

// --- Security headers ---
app.use(helmet({
  contentSecurityPolicy: false, // we manage CSP inline if needed
  crossOriginEmbedderPolicy: false,
}));

// --- CORS (restricted) ---
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

// --- Static assets & uploads ---
app.use('/uploads', express.static(require('path').join(__dirname, '../public/uploads')));
app.use(express.static(require('path').join(__dirname, '../public')));

// --- Session store (PostgreSQL) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(session({
  store: new pgSession({ pool, tableName: 'sessions', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  name: process.env.SESSION_COOKIE_NAME || 'sirkula_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    sameSite: process.env.SESSION_COOKIE_SAMESITE || 'Lax',
    maxAge: Number(process.env.SESSION_COOKIE_MAX_AGE) || 86400000,
    path: '/',
  },
}));

// --- CSRF token cookie (double-submit) ---
// cookie-parser must run before the CSRF middleware so `req.cookies` is populated.
app.use(cookieParser());
app.use(csrfProtection);

// --- API routes (versioned) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/matching', matchingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/impact', impactRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportRoutes);

// --- Health check ---
app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(503).json({ success: false, status: 'degraded', db: 'disconnected' });
  }
});

// --- 404 ---
app.use(notFound);

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
