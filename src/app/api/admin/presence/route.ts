import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sessions active within the last 30 seconds
    const activeSessions = await prisma.activeSession.findMany({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 1000),
        },
      },
      orderBy: {
        lastActive: 'desc',
      },
    });

    // Cleanup very old sessions (older than 10 minutes)
    await prisma.activeSession.deleteMany({
      where: {
        lastActive: {
          lt: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({ activeSessions });
  } catch (error: any) {
    console.error('Fetch presence error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
