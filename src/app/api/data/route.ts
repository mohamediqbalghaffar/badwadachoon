import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();
    const dataBlob = blobs.find((b) => b.pathname === 'latest_data.xlsx');
    
    if (!dataBlob) {
      return NextResponse.json({ error: 'No database file found', url: null }, { status: 404 });
    }

    return NextResponse.json({ url: dataBlob.downloadUrl || dataBlob.url });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json({ error: 'Failed to fetch database', url: null }, { status: 500 });
  }
}
