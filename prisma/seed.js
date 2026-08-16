const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.resolve(__dirname, 'dev.db');
const fileUrl = `file:${dbPath.replace(/\\/g, '/')}`;
const libsql = createClient({ url: fileUrl });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('Seeding SQLite database at:', dbPath);

  const adminUsers = [
    { email: 'moham_iqbal99@gmail.com', name: 'Mohamed Iqbal', role: 'admin', status: 'active' },
    { email: 'mohammed.iqbal@halabjagroup.com', name: 'Mohammed Iqbal', role: 'admin', status: 'active' },
    { email: 'admin@badwadachoon.local', name: 'Admin', role: 'admin', status: 'active' },
  ];

  for (const u of adminUsers) {
    await prisma.userAccount.upsert({
      where: { email: u.email },
      update: { role: u.role, status: u.status, name: u.name },
      create: u
    });
    console.log(`User created/updated: ${u.email}`);
  }

  const defaultRoles = [
    { role: 'admin', permissions: JSON.stringify(['data:edit', 'data:upload', 'users:manage', 'roles:manage', 'db:fetch', 'view:presentation', 'view:analytics']) },
    { role: 'user', permissions: JSON.stringify(['data:edit', 'db:fetch', 'view:presentation', 'view:analytics']) },
    { role: 'viewer', permissions: JSON.stringify([]) },
    { role: 'guest', permissions: JSON.stringify(['db:fetch']) },
  ];

  for (const r of defaultRoles) {
    await prisma.rolePermission.upsert({
      where: { role: r.role },
      update: { permissions: r.permissions },
      create: r
    });
    console.log(`Role permissions created/updated: ${r.role}`);
  }

  console.log('Seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
