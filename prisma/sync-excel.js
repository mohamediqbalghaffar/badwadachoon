const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const dbPath = path.resolve(__dirname, 'dev.db');
const fileUrl = `file:${dbPath.replace(/\\/g, '/')}`;
const libsql = createClient({ url: fileUrl });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const EXCEL_DIR = 'C:\\Users\\PC\\Desktop\\badwadachoon db files\\db excel files';

if (!fs.existsSync(EXCEL_DIR)) {
  fs.mkdirSync(EXCEL_DIR, { recursive: true });
}

function writeExcelFile(tableName, rows) {
  try {
    const filePath = path.join(EXCEL_DIR, `${tableName}.xlsx`);
    const formattedRows = rows.map((row) => {
      const copy = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined) {
          copy[key] = '';
        } else if (value instanceof Date) {
          copy[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          const str = JSON.stringify(value);
          copy[key] = str.length > 32000 ? str.substring(0, 32000) : str;
        } else if (typeof value === 'object') {
          const str = JSON.stringify(value);
          copy[key] = str.length > 32000 ? str.substring(0, 32000) : str;
        } else {
          const str = String(value);
          copy[key] = str.length > 32000 ? str.substring(0, 32000) : str;
        }
      }
      return copy;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedRows);
    if (formattedRows.length > 0) {
      const colWidths = Object.keys(formattedRows[0]).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...formattedRows.slice(0, 50).map((r) => String(r[key] || '').length)
        );
        return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
      });
      worksheet['!cols'] = colWidths;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Written ${rows.length} rows to ${tableName}.xlsx`);
    return true;
  } catch (error) {
    console.error(`Failed to write Excel file for ${tableName}:`, error);
    return false;
  }
}

async function run() {
  console.log('=== Syncing SQLite database to Desktop Excel files ===\n');

  const [received, sent, incoming, users, roles, sessions, sessionData] = await Promise.all([
    prisma.receivedLetter.findMany({ orderBy: { id: 'asc' } }),
    prisma.sentLetter.findMany({ orderBy: { id: 'asc' } }),
    prisma.incomingLetter.findMany({ orderBy: { id: 'asc' } }),
    prisma.userAccount.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.rolePermission.findMany({ orderBy: { role: 'asc' } }),
    prisma.activeSession.findMany({ orderBy: { lastActive: 'desc' } }),
    prisma.sessionData.findMany({ orderBy: { updatedAt: 'desc' } }),
  ]);

  writeExcelFile('ReceivedLetter', received);
  writeExcelFile('SentLetter', sent);
  writeExcelFile('IncomingLetter', incoming);
  writeExcelFile('UserAccount', users);
  writeExcelFile('RolePermission', roles);
  writeExcelFile('ActiveSession', sessions);
  writeExcelFile('SessionData', sessionData);

  console.log('\n=== All Excel files written successfully to: ===');
  console.log(EXCEL_DIR);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
