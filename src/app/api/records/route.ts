import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sheet, id, data } = body;
    // action: 'add' | 'edit' | 'delete'
    // sheet: 'received' | 'sent'

    const { blobs } = await list();
    const dataBlob = blobs.find((b) => b.pathname === 'latest_data.xlsx');
    
    if (!dataBlob) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    // 1. Download current excel file
    const response = await fetch(dataBlob.downloadUrl || dataBlob.url);
    const arrayBuffer = await response.arrayBuffer();
    
    // 2. Read with XLSX
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Map sheet logic
    const sheetName = sheet === 'sent' ? workbook.SheetNames[1] : workbook.SheetNames[0];
    if (!sheetName) return NextResponse.json({ error: 'Sheet not found' }, { status: 400 });
    
    const worksheet = workbook.Sheets[sheetName];
    // Convert to JSON
    let rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: null });
    
    // 3. Process action
    if (action === 'delete') {
      rows = rows.filter(row => row['#'] != id);
    } else if (action === 'edit') {
      rows = rows.map(row => {
        if (row['#'] == id) {
          return { ...row, ...data };
        }
        return row;
      });
    } else if (action === 'add') {
      const maxId = rows.reduce((max, row) => Math.max(max, parseInt(row['#'] || '0')), 0);
      data['#'] = maxId + 1;
      rows.push(data);
    }

    // 4. Update worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(rows);
    workbook.Sheets[sheetName] = newWorksheet;

    // 5. Save back to buffer
    const outBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // 6. Upload to blob (Try public, fallback to private)
    let blob;
    try {
      blob = await put('latest_data.xlsx', outBuffer, {
        access: 'public',
        addRandomSuffix: false
      });
    } catch (putError: any) {
      if (putError.message?.includes('private store')) {
        blob = await put('latest_data.xlsx', outBuffer, {
          access: 'private',
          addRandomSuffix: false
        });
      } else {
        throw putError;
      }
    }

    return NextResponse.json({ success: true, blob });
  } catch (error: any) {
    console.error("Records update error:", error);
    return NextResponse.json({ error: 'Failed to update records', details: error.message }, { status: 500 });
  }
}
