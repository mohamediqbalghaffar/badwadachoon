import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Try public access first, fallback to private if the store is configured as private
    let blob;
    try {
      blob = await put('latest_data.xlsx', file, {
        access: 'public',
        addRandomSuffix: false // Overwrite existing
      });
    } catch (putError: any) {
      if (putError.message?.includes('private store')) {
        blob = await put('latest_data.xlsx', file, {
          access: 'private',
          addRandomSuffix: false
        });
      } else {
        throw putError;
      }
    }

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Failed to upload', details: error.message }, { status: 500 });
  }
}
