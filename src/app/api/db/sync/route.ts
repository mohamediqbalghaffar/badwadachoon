import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { receivedData, sentData, isFirstChunk } = data;
    
    // Handle legacy single-request sync (if no isFirstChunk is provided, assume it's a full replacement)
    const shouldClear = isFirstChunk === undefined ? true : isFirstChunk;

    // We only use transaction if we are clearing the database, otherwise we just insert the chunk
    if (shouldClear) {
      await prisma.$transaction(async (tx) => {
        // Clear existing records
        await tx.receivedLetter.deleteMany();
        await tx.sentLetter.deleteMany();
      });
    }

    // Insert new received letters
    if (receivedData && receivedData.length > 0) {
      await prisma.receivedLetter.createMany({
        data: receivedData.map((d: any) => ({
          id: parseInt(d.id),
          subject: d.subject || "نەزانراو",
          department: d.department || "نەزانراو",
          departments: d.departments || [],
          dept1: d.dept1 || null,
          dept2: d.dept2 || null,
          dept3: d.dept3 || null,
          refCode: d.refCode || "-",
          letterType: d.letterType || "گشتی",
          sentDate: d.sentDate ? new Date(d.sentDate) : null,
          responseDate: d.responseDate ? new Date(d.responseDate) : null,
          processingTime: d.processingTime !== undefined ? d.processingTime : null,
          slaTime: d.slaTime || "-",
        })),
        skipDuplicates: true,
      });
    }

    // Insert new sent letters
    if (sentData && sentData.length > 0) {
      await prisma.sentLetter.createMany({
        data: sentData.map((d: any) => ({
          id: parseInt(d.id),
          subject: d.subject || "نەزانراو",
          department: d.department || "نەزانراو",
          departments: d.departments || [],
          dept1: d.dept1 || null,
          dept2: d.dept2 || null,
          dept3: d.dept3 || null,
          refCode: d.refCode || "-",
          letterType: d.letterType || "گشتی",
          sentDate: d.sentDate ? new Date(d.sentDate) : null,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to sync database:', error);
    return NextResponse.json({ error: 'Failed to sync database', details: error.message }, { status: 500 });
  }
}
