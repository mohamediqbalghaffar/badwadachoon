import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const letters = await prisma.receivedLetter.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(letters);
  } catch (error: any) {
    console.error('Failed to fetch received letters:', error);
    return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if ID already exists
    let maxId = 0;
    if (!data.id) {
      const max = await prisma.receivedLetter.aggregate({
        _max: { id: true }
      });
      maxId = max._max.id || 0;
      data.id = maxId + 1;
    }

    const letter = await prisma.receivedLetter.create({
      data: {
        id: data.id,
        subject: data.subject || "نەزانراو",
        department: data.department || "نەزانراو",
        departments: data.departments || [],
        dept1: data.dept1 || null,
        dept2: data.dept2 || null,
        dept3: data.dept3 || null,
        refCode: data.refCode || "-",
        letterType: data.letterType || "گشتی",
        sentDate: data.sentDate ? new Date(data.sentDate) : null,
        responseDate: data.responseDate ? new Date(data.responseDate) : null,
        processingTime: data.processingTime !== undefined ? data.processingTime : null,
        slaTime: data.slaTime || "-",
      }
    });

    return NextResponse.json(letter);
  } catch (error: any) {
    console.error('Failed to create received letter:', error);
    return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    const letter = await prisma.receivedLetter.update({
      where: { id: parseInt(data.id) },
      data: {
        subject: data.subject,
        department: data.department,
        departments: data.departments,
        dept1: data.dept1,
        dept2: data.dept2,
        dept3: data.dept3,
        refCode: data.refCode,
        letterType: data.letterType,
        sentDate: data.sentDate ? new Date(data.sentDate) : null,
        responseDate: data.responseDate ? new Date(data.responseDate) : null,
        processingTime: data.processingTime !== undefined ? data.processingTime : null,
        slaTime: data.slaTime,
      }
    });

    return NextResponse.json(letter);
  } catch (error: any) {
    console.error('Failed to update received letter:', error);
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

    await prisma.receivedLetter.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete received letter:', error);
    return NextResponse.json({ error: 'Failed to delete letter' }, { status: 500 });
  }
}
