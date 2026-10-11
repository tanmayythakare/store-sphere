import dotenv from 'dotenv';
dotenv.config({ override: true });

import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL?.startsWith('postgresql://')
  ? process.env.DATABASE_URL
  : 'postgresql://postgres:postgres@localhost:5432/storedb?schema=public';

process.env.DATABASE_URL = databaseUrl;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
