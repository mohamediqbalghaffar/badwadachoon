import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, sentData } = body;

    if (!data || !sentData) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await prisma.sessionData.upsert({
      where: { userId },
      update: {
        data,
        sentData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        data,
        sentData,
      },
    });

    await prisma.activeSession.update({
      where: { userId },
      data: { hasData: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Data upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const sessionData = await prisma.sessionData.findUnique({
      where: { userId },
    });

    if (!sessionData) {
      return NextResponse.json({ data: [], sentData: [] });
    }

    return NextResponse.json({
      data: sessionData.data,
      sentData: sessionData.sentData,
    });
  } catch (error: any) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
