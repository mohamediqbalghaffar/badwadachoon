import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { receivedData, sentData, incomingData } = await request.json();

    await prisma.$transaction(async (tx) => {
      // 1. Wipe current tables
      await tx.receivedLetter.deleteMany({});
      await tx.sentLetter.deleteMany({});
      await tx.incomingLetter.deleteMany({});

      // 2. Re-insert all rows, skipping string IDs (like "new-123") to let DB auto-increment them
      if (receivedData && receivedData.length > 0) {
        await tx.receivedLetter.createMany({
          data: receivedData.map((d: any) => ({
            id: typeof d.id === 'string' && d.id.startsWith('new-') ? undefined : parseInt(d.id) || undefined,
            subject: d.subject || "نەزانراو",
            department: d.department || "نەزانراو",
            departments: JSON.stringify(d.departments || []),
            dept1: d.dept1 || null,
            dept2: d.dept2 || null,
            dept3: d.dept3 || null,
            refCode: d.refCode || "-",
            letterType: d.letterType || "گشتی",
            sentDate: d.sentDate && !isNaN(new Date(d.sentDate).getTime()) ? new Date(d.sentDate) : null,
            responseDate: d.responseDate && !isNaN(new Date(d.responseDate).getTime()) ? new Date(d.responseDate) : null,
            processingTime: d.processingTime !== undefined && d.processingTime !== null && d.processingTime !== "" ? parseInt(d.processingTime) : null,
            slaTime: d.slaTime || "-",
          })),
        });
      }

      if (sentData && sentData.length > 0) {
        await tx.sentLetter.createMany({
          data: sentData.map((d: any) => ({
            id: typeof d.id === 'string' && d.id.startsWith('new-') ? undefined : parseInt(d.id) || undefined,
            subject: d.subject || "نەزانراو",
            department: d.department || "نەزانراو",
            departments: JSON.stringify(d.departments || []),
            dept1: d.dept1 || null,
            dept2: d.dept2 || null,
            dept3: d.dept3 || null,
            refCode: d.refCode || "-",
            letterType: d.letterType || "گشتی",
            sentDate: d.sentDate && !isNaN(new Date(d.sentDate).getTime()) ? new Date(d.sentDate) : null,
          })),
        });
      }

      if (incomingData && incomingData.length > 0) {
        await tx.incomingLetter.createMany({
          data: incomingData.map((d: any) => ({
            id: typeof d.id === 'string' && d.id.startsWith('new-') ? undefined : parseInt(d.id) || undefined,
            subject: d.subject || "نەزانراو",
            sender: d.sender || "نەزانراو",
            department: d.department || "نەزانراو",
            departments: JSON.stringify(d.departments || []),
            dept1: d.dept1 || null,
            dept2: d.dept2 || null,
            dept3: d.dept3 || null,
            refCode: d.refCode || "-",
            letterType: d.letterType || "گشتی",
            sentDate: d.sentDate && !isNaN(new Date(d.sentDate).getTime()) ? new Date(d.sentDate) : null,
          })),
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Batch update successful' });
  } catch (error: any) {
    console.error('Batch update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}
