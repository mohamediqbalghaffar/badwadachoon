import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Always overwrite the same file name so it acts as our single database
    const blob = await put('latest_data.xlsx', file, {
      access: 'public',
      addRandomSuffix: false // Overwrite existing
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}
