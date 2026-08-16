import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncTableToExcel } from '@/lib/excel-db';
import fallbackIncoming from '@/data/IncomingLetter.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const letters = await prisma.incomingLetter.findMany({
      orderBy: { id: 'asc' }
    });

    if (letters.length === 0) {
      // Auto-seed in background for Vercel serverless instances
      (async () => {
        try {
          await prisma.incomingLetter.createMany({
            data: fallbackIncoming.map((item: any) => ({
              id: item.id,
              subject: item.subject || 'نەزانراو',
              sender: item.sender || null,
              department: item.department || 'نەزانراو',
              departments: JSON.stringify(Array.isArray(item.departments) ? item.departments : [item.department]),
              dept1: item.dept1 || null,
              dept2: item.dept2 || null,
              dept3: item.dept3 || null,
              refCode: item.refCode || '-',
              letterType: item.letterType || 'نامەی گشتی',
              sentDate: item.sentDate ? new Date(item.sentDate) : null,
            })),
          });
        } catch (e) {
          // ignore background seed conflict
        }
      })();

      return NextResponse.json(fallbackIncoming);
    }

    const mapped = letters.map(l => {
      let depts: string[] = [];
      try {
        depts = typeof l.departments === 'string' ? JSON.parse(l.departments) : (l.departments || []);
      } catch (e) {
        depts = l.department ? [l.department] : [];
      }
      return { ...l, departments: depts };
    });
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Failed to fetch incoming letters, returning fallback data:', error);
    return NextResponse.json(fallbackIncoming);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if ID already exists
    let maxId = 0;
    if (!data.id) {
      const max = await prisma.incomingLetter.aggregate({
        _max: { id: true }
      });
      maxId = max._max.id || 0;
      data.id = maxId + 1;
    }

    const letter = await prisma.incomingLetter.create({
      data: {
        id: data.id,
        subject: data.subject || "نەزانراو",
        sender: data.sender || "نەزانراو",
        department: data.department || "نەزانراو",
        departments: JSON.stringify(data.departments || []),
        dept1: data.dept1 || null,
        dept2: data.dept2 || null,
        dept3: data.dept3 || null,
        refCode: data.refCode || "-",
        letterType: data.letterType || "گشتی",
        sentDate: data.sentDate ? new Date(data.sentDate) : null,
      }
    });

    // Sync to Desktop Excel
    syncTableToExcel('IncomingLetter').catch(console.error);

    return NextResponse.json(letter);
  } catch (error: any) {
    console.error('Failed to create incoming letter:', error);
    return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    const letter = await prisma.incomingLetter.update({
      where: { id: parseInt(data.id) },
      data: {
        subject: data.subject,
        sender: data.sender,
        department: data.department,
        departments: JSON.stringify(data.departments || []),
        dept1: data.dept1,
        dept2: data.dept2,
        dept3: data.dept3,
        refCode: data.refCode,
        letterType: data.letterType,
        sentDate: data.sentDate ? new Date(data.sentDate) : null,
      }
    });

    // Sync to Desktop Excel
    syncTableToExcel('IncomingLetter').catch(console.error);

    return NextResponse.json(letter);
  } catch (error: any) {
    console.error('Failed to update incoming letter:', error);
    return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.incomingLetter.delete({
      where: { id: parseInt(id) }
    });

    // Sync to Desktop Excel
    syncTableToExcel('IncomingLetter').catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete incoming letter:', error);
    return NextResponse.json({ error: 'Failed to delete letter' }, { status: 500 });
  }
}

