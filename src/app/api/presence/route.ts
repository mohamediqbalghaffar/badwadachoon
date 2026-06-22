import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { activeView, viewerId, hasData } = body;

    let userId = session?.user?.email;
    let name = session?.user?.name || 'بەکارهێنەری نەناسراو';
    let role = (session?.user as any)?.role || 'viewer';

    if (!userId && viewerId) {
      userId = viewerId;
      name = 'بینەر (کاتی)';
    }

    if (!userId) {
      return NextResponse.json({ error: 'No identifier provided' }, { status: 400 });
    }

    await prisma.activeSession.upsert({
      where: { userId },
      update: {
        activeView: activeView || 'unknown',
        lastActive: new Date(),
        name,
        role,
        hasData: hasData || false,
      },
      create: {
        userId,
        name,
        role,
        activeView: activeView || 'unknown',
        hasData: hasData || false,
      },
    });

    if (hasData === false) {
      await prisma.sessionData.deleteMany({
        where: { userId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Presence update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
