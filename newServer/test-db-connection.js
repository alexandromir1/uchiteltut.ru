import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    const count = await prisma.job.count();
    console.log('✅ Jobs count:', count);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();




