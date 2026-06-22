import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cutoff = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes

    const activeUploaders = await prisma.activeSession.findMany({
      where: {
        lastActive: { gte: cutoff },
        hasData: true,
      },
      select: {
        userId: true,
        name: true,
        role: true,
        activeView: true,
        lastActive: true,
      },
      orderBy: {
        lastActive: 'desc',
      },
    });

    const userEmails = activeUploaders.map(s => s.userId);
    const users = await prisma.userAccount.findMany({
      where: { email: { in: userEmails } },
      select: { email: true, image: true }
    });

    const activeWithImages = activeUploaders.map(session => {
      const u = users.find(u => u.email === session.userId);
      return {
        ...session,
        image: u?.image || null
      };
    });

    return NextResponse.json({ sessions: activeWithImages });
  } catch (error: any) {
    console.error('Fetch sessions-with-data error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
