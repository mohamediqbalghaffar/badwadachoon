import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const image = formData.get('image') as File | null;

    const dataToUpdate: { name?: string; image?: string } = {};

    if (name) {
      dataToUpdate.name = name;
    }

    if (image && image.size > 0) {
      // Upload to Vercel Blob
      const blob = await put(`profiles/${session.user.email}-${Date.now()}-${image.name}`, image, {
        access: 'public',
      });
      dataToUpdate.image = blob.url;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const updatedUser = await prisma.userAccount.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        name: updatedUser.name,
        image: updatedUser.image,
      } 
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
