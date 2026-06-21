import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { receivedData, sentData, clearFirst } = data;

    // Fast-path for clearing database (avoiding long transactions)
    if (clearFirst && (!receivedData || receivedData.length === 0) && (!sentData || sentData.length === 0)) {
      await prisma.receivedLetter.deleteMany({});
      await prisma.sentLetter.deleteMany({});
      return NextResponse.json({ success: true, message: 'Database cleared' });
    }

    await prisma.$transaction(async (tx) => {
      // Clear existing records if requested alongside data insertion
      if (clearFirst) {
        await tx.receivedLetter.deleteMany({});
        await tx.sentLetter.deleteMany({});
      }

      // Insert new received letters
      if (receivedData && receivedData.length > 0) {
        await tx.receivedLetter.createMany({
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
        await tx.sentLetter.createMany({
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
    }, {
      maxWait: 10000,
      timeout: 20000,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to sync database:', error);
    return NextResponse.json({ error: 'Failed to sync database', details: error.message }, { status: 500 });
  }
}
