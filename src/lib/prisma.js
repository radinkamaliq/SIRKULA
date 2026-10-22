const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

/**
 * Prisma client singleton. Reuses a single client instance across hot reloads
 * in development to avoid exhausting the database connection pool.
 */
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
