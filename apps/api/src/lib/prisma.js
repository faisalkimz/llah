import { PrismaClient } from '@prisma/client';
const prisma = globalThis.__llahPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__llahPrisma = prisma;
export default prisma;
export { prisma };
