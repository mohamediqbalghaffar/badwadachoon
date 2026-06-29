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
    const { data, sentData, incomingData } = body;

    if (!data || !sentData || !incomingData) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await prisma.sessionData.upsert({
      where: { userId },
      update: {
        data: JSON.stringify(data),
        sentData: JSON.stringify(sentData),
        incomingData: JSON.stringify(incomingData),
        updatedAt: new Date(),
      },
      create: {
        userId,
        data: JSON.stringify(data),
        sentData: JSON.stringify(sentData),
        incomingData: JSON.stringify(incomingData),
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
      return NextResponse.json({ data: [], sentData: [], incomingData: [] });
    }

    return NextResponse.json({
      data: JSON.parse(sessionData.data),
      sentData: JSON.parse(sessionData.sentData),
      incomingData: sessionData.incomingData ? JSON.parse(sessionData.incomingData) : [],
    });
  } catch (error: any) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
