import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  if (process.env.TURSO_DATABASE_URL) {
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  } else {
    const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    const fileUrl = `file:${dbPath.replace(/\\/g, '/')}`;
    const libsql = createClient({
      url: fileUrl,
    });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };


