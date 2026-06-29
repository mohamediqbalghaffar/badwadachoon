import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    const sql = `
      CREATE TABLE IF NOT EXISTS "ReceivedLetter" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "subject" TEXT NOT NULL,
          "department" TEXT NOT NULL,
          "departments" TEXT NOT NULL DEFAULT '[]',
          "dept1" TEXT,
          "dept2" TEXT,
          "dept3" TEXT,
          "refCode" TEXT NOT NULL,
          "letterType" TEXT NOT NULL,
          "sentDate" DATETIME,
          "responseDate" DATETIME,
          "processingTime" INTEGER,
          "slaTime" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "SentLetter" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "subject" TEXT NOT NULL,
          "department" TEXT NOT NULL,
          "departments" TEXT NOT NULL DEFAULT '[]',
          "dept1" TEXT,
          "dept2" TEXT,
          "dept3" TEXT,
          "refCode" TEXT NOT NULL,
          "letterType" TEXT NOT NULL,
          "sentDate" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "IncomingLetter" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "subject" TEXT NOT NULL,
          "sender" TEXT,
          "department" TEXT NOT NULL,
          "departments" TEXT NOT NULL DEFAULT '[]',
          "dept1" TEXT,
          "dept2" TEXT,
          "dept3" TEXT,
          "refCode" TEXT NOT NULL,
          "letterType" TEXT NOT NULL,
          "sentDate" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "UserAccount" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "image" TEXT,
          "role" TEXT NOT NULL DEFAULT 'user',
          "status" TEXT NOT NULL DEFAULT 'pending',
          "authCode" TEXT,
          "odooUrl" TEXT,
          "odooDb" TEXT,
          "odooUsername" TEXT,
          "odooApiKey" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UserAccount_email_key" ON "UserAccount"("email");

      CREATE TABLE IF NOT EXISTS "ActiveSession" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "activeView" TEXT NOT NULL,
          "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "hasData" BOOLEAN NOT NULL DEFAULT 0
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "ActiveSession_userId_key" ON "ActiveSession"("userId");

      CREATE TABLE IF NOT EXISTS "SessionData" (
          "userId" TEXT NOT NULL PRIMARY KEY,
          "data" TEXT NOT NULL,
          "sentData" TEXT NOT NULL,
          "incomingData" TEXT DEFAULT '[]',
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "SessionData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ActiveSession" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "RolePermission" (
          "role" TEXT NOT NULL PRIMARY KEY,
          "permissions" TEXT NOT NULL,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      INSERT OR IGNORE INTO "RolePermission" ("role", "permissions") VALUES 
      ('admin', '["data:edit", "data:upload", "users:manage", "roles:manage", "db:fetch"]'),
      ('user', '["data:edit", "db:fetch"]'),
      ('viewer', '[]'),
      ('guest', '["db:fetch"]');
    `;

    await libsql.executeMultiple(sql);

    return NextResponse.json({ success: true, message: "Turso database initialized successfully!" });
  } catch (error: any) {
    console.error('Failed to init DB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
