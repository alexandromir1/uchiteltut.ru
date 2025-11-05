import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle Prisma Client connection errors
prisma.$on('error', (e) => {
  console.error('Prisma Client Error:', e);
});

