const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const dbPath = path.resolve(__dirname, 'dev.db');
const fileUrl = `file:${dbPath.replace(/\\/g, '/')}`;
const libsql = createClient({ url: fileUrl });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const csvDir = 'C:\\Users\\PC\\Desktop\\badwadachoon db files\\db csv files';
const jsonDir = 'C:\\Users\\PC\\Desktop\\badwadachoon db files\\db json files';

// Helper to parse standard CSV with multi-line and quoted field support
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && !row[0].trim()) continue; // skip empty line
    const item = {};
    for (let c = 0; c < headers.length; c++) {
      const val = row[c] !== undefined ? row[c] : '';
      item[headers[c]] = val === '' ? null : val;
    }
    data.push(item);
  }

  return data;
}

async function importAll() {
  console.log('=== Starting full DB update from CSV/JSON files ===');

  // 1. ReceivedLetter
  console.log('\nImporting ReceivedLetter...');
  let receivedData = [];
  const receivedCsvPath = path.join(csvDir, 'ReceivedLetter.csv');
  if (fs.existsSync(receivedCsvPath)) {
    const csvContent = fs.readFileSync(receivedCsvPath, 'utf8');
    receivedData = parseCSV(csvContent);
  } else {
    const jsonPath = path.join(jsonDir, 'ReceivedLetter.json');
    receivedData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  await prisma.receivedLetter.deleteMany({});
  for (const item of receivedData) {
    let depts = '[]';
    if (item.departments) {
      if (typeof item.departments === 'string' && item.departments.startsWith('[')) {
        depts = item.departments;
      } else if (Array.isArray(item.departments)) {
        depts = JSON.stringify(item.departments);
      } else {
        depts = JSON.stringify([item.departments]);
      }
    } else if (item.department) {
      depts = JSON.stringify([item.department]);
    }

    await prisma.receivedLetter.create({
      data: {
        id: parseInt(item.id),
        subject: item.subject || 'نەزانراو',
        department: item.department || 'نەزانراو',
        departments: depts,
        dept1: item.dept1 || null,
        dept2: item.dept2 || null,
        dept3: item.dept3 || null,
        refCode: item.refCode || '-',
        letterType: item.letterType || 'نامەی گشتی',
        sentDate: item.sentDate ? new Date(item.sentDate) : null,
        responseDate: item.responseDate ? new Date(item.responseDate) : null,
        processingTime: item.processingTime !== null && item.processingTime !== undefined && item.processingTime !== '' ? parseInt(item.processingTime) : null,
        slaTime: item.slaTime || '-',
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      }
    });
  }
  console.log(`✓ Imported ${receivedData.length} ReceivedLetter records`);

  // 2. SentLetter
  console.log('\nImporting SentLetter...');
  let sentData = [];
  const sentCsvPath = path.join(csvDir, 'SentLetter.csv');
  if (fs.existsSync(sentCsvPath)) {
    const csvContent = fs.readFileSync(sentCsvPath, 'utf8');
    sentData = parseCSV(csvContent);
  } else {
    const jsonPath = path.join(jsonDir, 'SentLetter.json');
    sentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  await prisma.sentLetter.deleteMany({});
  for (const item of sentData) {
    let depts = '[]';
    if (item.departments) {
      if (typeof item.departments === 'string' && item.departments.startsWith('[')) {
        depts = item.departments;
      } else if (Array.isArray(item.departments)) {
        depts = JSON.stringify(item.departments);
      } else {
        depts = JSON.stringify([item.departments]);
      }
    } else if (item.department) {
      depts = JSON.stringify([item.department]);
    }

    await prisma.sentLetter.create({
      data: {
        id: parseInt(item.id),
        subject: item.subject || 'نەزانراو',
        department: item.department || 'نەزانراو',
        departments: depts,
        dept1: item.dept1 || null,
        dept2: item.dept2 || null,
        dept3: item.dept3 || null,
        refCode: item.refCode || '-',
        letterType: item.letterType || 'نامەی گشتی',
        sentDate: item.sentDate ? new Date(item.sentDate) : null,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      }
    });
  }
  console.log(`✓ Imported ${sentData.length} SentLetter records`);

  // 3. IncomingLetter
  console.log('\nImporting IncomingLetter...');
  let incomingData = [];
  const incomingCsvPath = path.join(csvDir, 'IncomingLetter.csv');
  if (fs.existsSync(incomingCsvPath)) {
    const csvContent = fs.readFileSync(incomingCsvPath, 'utf8');
    incomingData = parseCSV(csvContent);
  } else {
    const jsonPath = path.join(jsonDir, 'IncomingLetter.json');
    incomingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  await prisma.incomingLetter.deleteMany({});
  for (const item of incomingData) {
    let depts = '[]';
    if (item.departments) {
      if (typeof item.departments === 'string' && item.departments.startsWith('[')) {
        depts = item.departments;
      } else if (Array.isArray(item.departments)) {
        depts = JSON.stringify(item.departments);
      } else {
        depts = JSON.stringify([item.departments]);
      }
    } else if (item.department) {
      depts = JSON.stringify([item.department]);
    }

    await prisma.incomingLetter.create({
      data: {
        id: parseInt(item.id),
        subject: item.subject || 'نەزانراو',
        sender: item.sender || null,
        department: item.department || 'نەزانراو',
        departments: depts,
        dept1: item.dept1 || null,
        dept2: item.dept2 || null,
        dept3: item.dept3 || null,
        refCode: item.refCode || '-',
        letterType: item.letterType || 'نامەی گشتی',
        sentDate: item.sentDate ? new Date(item.sentDate) : null,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      }
    });
  }
  console.log(`✓ Imported ${incomingData.length} IncomingLetter records`);

  // 4. UserAccount
  console.log('\nImporting UserAccount...');
  const userCsvPath = path.join(csvDir, 'UserAccount.csv');
  let users = [];
  if (fs.existsSync(userCsvPath)) {
    users = parseCSV(fs.readFileSync(userCsvPath, 'utf8'));
  }

  // Ensure default admin emails are in users list
  const defaultAdmins = [
    { email: 'moham_iqbal99@gmail.com', name: 'Mohamed Iqbal', role: 'admin', status: 'active' },
    { email: 'mohammed.iqbal@halabjagroup.com', name: 'Mohammed Iqbal', role: 'admin', status: 'active' },
    { email: 'admin@badwadachoon.local', name: 'Admin', role: 'admin', status: 'active' },
  ];

  for (const da of defaultAdmins) {
    if (!users.find(u => u.email === da.email)) {
      users.push(da);
    }
  }

  for (const u of users) {
    if (!u.email) continue;
    await prisma.userAccount.upsert({
      where: { email: u.email },
      update: {
        name: u.name || u.email.split('@')[0],
        role: u.role || 'user',
        status: u.status || 'active',
        authCode: u.authCode || 'ABC123',
      },
      create: {
        id: u.id || undefined,
        email: u.email,
        name: u.name || u.email.split('@')[0],
        role: u.role || 'user',
        status: u.status || 'active',
        authCode: u.authCode || 'ABC123',
      }
    });
  }
  console.log(`✓ Configured ${users.length} UserAccount records`);

  // 5. RolePermission
  console.log('\nImporting RolePermission...');
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
  }
  console.log(`✓ Configured ${defaultRoles.length} RolePermission records`);

  // 6. ActiveSession & SessionData
  console.log('\nConfiguring ActiveSession and SessionData for live views...');
  const allReceived = await prisma.receivedLetter.findMany({ orderBy: { id: 'asc' } });
  const allSent = await prisma.sentLetter.findMany({ orderBy: { id: 'asc' } });
  const allIncoming = await prisma.incomingLetter.findMany({ orderBy: { id: 'asc' } });

  const sessionUserIds = [
    'mohammed.iqbal@halabjagroup.com',
    'moham_iqbal99@gmail.com',
    'admin@badwadachoon.local',
    'local-admin',
  ];

  for (const userId of sessionUserIds) {
    await prisma.activeSession.upsert({
      where: { userId },
      update: {
        name: 'Mohammed Iqbal',
        role: 'admin',
        activeView: 'presentation',
        lastActive: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // far future so it always shows as active
        hasData: true,
      },
      create: {
        userId,
        name: 'Mohammed Iqbal',
        role: 'admin',
        activeView: 'presentation',
        lastActive: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        hasData: true,
      }
    });

    await prisma.sessionData.upsert({
      where: { userId },
      update: {
        data: JSON.stringify(allReceived),
        sentData: JSON.stringify(allSent),
        incomingData: JSON.stringify(allIncoming),
        updatedAt: new Date(),
      },
      create: {
        userId,
        data: JSON.stringify(allReceived),
        sentData: JSON.stringify(allSent),
        incomingData: JSON.stringify(allIncoming),
      }
    });
  }
  console.log(`✓ ActiveSession and SessionData primed with all 3,560 items for ${sessionUserIds.length} users`);

  console.log('\n=== Database update complete! ===');
}

importAll()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
