import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import path from 'path';
import fs from 'fs';

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
    let dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    
    // On Vercel or AWS Lambda, /var/task is read-only.
    // Copy the database file to /tmp if running in serverless environment.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const tmpDbPath = path.join('/tmp', 'dev.db');
      try {
        if (!fs.existsSync(tmpDbPath)) {
          if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, tmpDbPath);
          } else {
            // Check root dev.db
            const rootDb = path.resolve(process.cwd(), 'dev.db');
            if (fs.existsSync(rootDb)) {
              fs.copyFileSync(rootDb, tmpDbPath);
            }
          }
        }
        dbPath = tmpDbPath;
      } catch (e) {
        console.error('Error copying db to /tmp on Vercel:', e);
      }
    }

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



