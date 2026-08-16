import { NextResponse } from 'next/server';
import { getExcelFilesStatus, syncAllFromExcel, syncAllToExcel, EXCEL_DIR } from '@/lib/excel-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = getExcelFilesStatus();
    const totalRows = files.reduce((acc, f) => acc + f.rowCount, 0);
    return NextResponse.json({
      excelDir: EXCEL_DIR,
      totalFiles: files.length,
      totalRows,
      files,
    });
  } catch (error: any) {
    console.error('Failed to get Excel status:', error);
    return NextResponse.json({ error: 'Failed to get Excel status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const direction = body.direction || 'to-excel'; // 'from-excel' or 'to-excel'

    if (direction === 'from-excel') {
      const counts = await syncAllFromExcel();
      return NextResponse.json({
        success: true,
        message: 'Imported all records from Desktop Excel files into database successfully',
        counts,
      });
    } else {
      const counts = await syncAllToExcel();
      return NextResponse.json({
        success: true,
        message: 'Saved all database records to Desktop Excel files successfully',
        counts,
      });
    }
  } catch (error: any) {
    console.error('Failed to sync Excel:', error);
    return NextResponse.json({ error: error?.message || 'Sync failed' }, { status: 500 });
  }
}
