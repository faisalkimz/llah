import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Try to connect
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! User count: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Database test complete!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
