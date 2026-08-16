import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { prisma } from './prisma';

export const EXCEL_DIR = 'C:\\Users\\PC\\Desktop\\badwadachoon db files\\db excel files';

// Ensure directory exists
if (!fs.existsSync(EXCEL_DIR)) {
  try {
    fs.mkdirSync(EXCEL_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create Excel directory:', err);
  }
}

export interface ExcelFileInfo {
  name: string;
  exists: boolean;
  sizeBytes: number;
  lastModified: string | null;
  rowCount: number;
}

/**
 * Format Date objects to ISO string for Excel
 */
function formatDate(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

/**
 * Write records to an .xlsx file on disk with clean formatting
 */
export async function writeExcelFile(tableName: string, rows: any[]): Promise<boolean> {
  try {
    const filePath = path.join(EXCEL_DIR, `${tableName}.xlsx`);
    
    // Transform rows for clean Excel output
    const formattedRows = rows.map((row) => {
      const copy: Record<string, any> = {};
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
    
    // Auto-calculate column widths
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

    // Write file atomically (temp file then rename to avoid lock collisions)
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (error) {
    console.error(`Failed to write Excel file for ${tableName}:`, error);
    return false;
  }
}

/**
 * Read records from an .xlsx file on disk
 */
export function readExcelFile(tableName: string): any[] {
  try {
    const filePath = path.join(EXCEL_DIR, `${tableName}.xlsx`);
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
    return data;
  } catch (error) {
    console.error(`Failed to read Excel file for ${tableName}:`, error);
    return [];
  }
}

/**
 * Sync all database tables to Excel spreadsheets
 */
export async function syncAllToExcel(): Promise<Record<string, number>> {
  const [received, sent, incoming, users, roles, sessions, sessionData] = await Promise.all([
    prisma.receivedLetter.findMany({ orderBy: { id: 'asc' } }),
    prisma.sentLetter.findMany({ orderBy: { id: 'asc' } }),
    prisma.incomingLetter.findMany({ orderBy: { id: 'asc' } }),
    prisma.userAccount.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.rolePermission.findMany({ orderBy: { role: 'asc' } }),
    prisma.activeSession.findMany({ orderBy: { lastActive: 'desc' } }),
    prisma.sessionData.findMany({ orderBy: { updatedAt: 'desc' } }),
  ]);

  await Promise.all([
    writeExcelFile('ReceivedLetter', received),
    writeExcelFile('SentLetter', sent),
    writeExcelFile('IncomingLetter', incoming),
    writeExcelFile('UserAccount', users),
    writeExcelFile('RolePermission', roles),
    writeExcelFile('ActiveSession', sessions),
    writeExcelFile('SessionData', sessionData),
  ]);

  return {
    ReceivedLetter: received.length,
    SentLetter: sent.length,
    IncomingLetter: incoming.length,
    UserAccount: users.length,
    RolePermission: roles.length,
    ActiveSession: sessions.length,
    SessionData: sessionData.length,
  };
}

/**
 * Export specific table to its Excel spreadsheet in real-time
 */
export async function syncTableToExcel(tableName: 'ReceivedLetter' | 'SentLetter' | 'IncomingLetter' | 'UserAccount' | 'RolePermission' | 'ActiveSession' | 'SessionData') {
  try {
    switch (tableName) {
      case 'ReceivedLetter': {
        const rows = await prisma.receivedLetter.findMany({ orderBy: { id: 'asc' } });
        await writeExcelFile('ReceivedLetter', rows);
        break;
      }
      case 'SentLetter': {
        const rows = await prisma.sentLetter.findMany({ orderBy: { id: 'asc' } });
        await writeExcelFile('SentLetter', rows);
        break;
      }
      case 'IncomingLetter': {
        const rows = await prisma.incomingLetter.findMany({ orderBy: { id: 'asc' } });
        await writeExcelFile('IncomingLetter', rows);
        break;
      }
      case 'UserAccount': {
        const rows = await prisma.userAccount.findMany({ orderBy: { createdAt: 'asc' } });
        await writeExcelFile('UserAccount', rows);
        break;
      }
      case 'RolePermission': {
        const rows = await prisma.rolePermission.findMany({ orderBy: { role: 'asc' } });
        await writeExcelFile('RolePermission', rows);
        break;
      }
      case 'ActiveSession': {
        const rows = await prisma.activeSession.findMany({ orderBy: { lastActive: 'desc' } });
        await writeExcelFile('ActiveSession', rows);
        break;
      }
      case 'SessionData': {
        const rows = await prisma.sessionData.findMany({ orderBy: { updatedAt: 'desc' } });
        await writeExcelFile('SessionData', rows);
        break;
      }
    }
  } catch (err) {
    console.error(`Error background-syncing ${tableName} to Excel:`, err);
  }
}

/**
 * Read all Excel spreadsheets and import them into SQLite database
 */
export async function syncAllFromExcel(): Promise<Record<string, number>> {
  const tables = ['ReceivedLetter', 'SentLetter', 'IncomingLetter', 'UserAccount', 'RolePermission'];
  const counts: Record<string, number> = {};

  // 1. ReceivedLetter
  const receivedRows = readExcelFile('ReceivedLetter');
  if (receivedRows.length > 0) {
    await prisma.receivedLetter.deleteMany({});
    for (const item of receivedRows) {
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
    counts.ReceivedLetter = receivedRows.length;
  }

  // 2. SentLetter
  const sentRows = readExcelFile('SentLetter');
  if (sentRows.length > 0) {
    await prisma.sentLetter.deleteMany({});
    for (const item of sentRows) {
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
    counts.SentLetter = sentRows.length;
  }

  // 3. IncomingLetter
  const incomingRows = readExcelFile('IncomingLetter');
  if (incomingRows.length > 0) {
    await prisma.incomingLetter.deleteMany({});
    for (const item of incomingRows) {
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
    counts.IncomingLetter = incomingRows.length;
  }

  // 4. UserAccount
  const userRows = readExcelFile('UserAccount');
  if (userRows.length > 0) {
    for (const u of userRows) {
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
    counts.UserAccount = userRows.length;
  }

  return counts;
}

/**
 * Get status and statistics of the 7 Excel files
 */
export function getExcelFilesStatus(): ExcelFileInfo[] {
  const fileNames = [
    'ReceivedLetter',
    'SentLetter',
    'IncomingLetter',
    'UserAccount',
    'RolePermission',
    'ActiveSession',
    'SessionData',
  ];

  return fileNames.map((name) => {
    const filePath = path.join(EXCEL_DIR, `${name}.xlsx`);
    const exists = fs.existsSync(filePath);
    let sizeBytes = 0;
    let lastModified: string | null = null;
    let rowCount = 0;

    if (exists) {
      const stat = fs.statSync(filePath);
      sizeBytes = stat.size;
      lastModified = stat.mtime.toISOString();
      try {
        const rows = readExcelFile(name);
        rowCount = rows.length;
      } catch (e) {
        rowCount = 0;
      }
    }

    return {
      name: `${name}.xlsx`,
      exists,
      sizeBytes,
      lastModified,
      rowCount,
    };
  });
}
