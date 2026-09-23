import { PrismaClient } from '@prisma/client';
export const prisma = globalThis.__llahPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__llahPrisma = prisma;
