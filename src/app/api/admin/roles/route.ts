import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const roles = await prisma.rolePermission.findMany();
    return NextResponse.json({ roles });
  } catch (error: any) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, permissions } = await request.json();

    if (!role || !permissions) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Admin role must always have all permissions to prevent lockout
    let finalPermissions = permissions;
    if (role === 'admin') {
      finalPermissions = '["data:edit", "data:upload", "users:manage", "roles:manage", "db:fetch"]';
    }

    const updated = await prisma.rolePermission.upsert({
      where: { role },
      update: { permissions: finalPermissions },
      create: { role, permissions: finalPermissions },
    });

    return NextResponse.json({ success: true, role: updated });
  } catch (error: any) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
