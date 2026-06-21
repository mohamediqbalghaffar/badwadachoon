import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export async function GET() {
  try {
    const received = await prisma.receivedLetter.findMany({ orderBy: { id: 'asc' } });
    const sent = await prisma.sentLetter.findMany({ orderBy: { id: 'asc' } });

    // Format received letters for excel (matching the exact template design)
    const formattedReceived = received.map(r => ({
      "#": r.id,
      "بابەت": r.subject,
      "لایەنی پەیوەندیدار 1": r.dept1 || "",
      "لایەنی پەیوەندیدار 2": r.dept2 || "",
      "لایەنی پەیوەندیدار 3": r.dept3 || "",
      "جۆر": r.refCode,
      "جۆری نامە": r.letterType,
      "ڕۆژی ناردن": r.sentDate || "",
      "ڕۆژی وەڵام": r.responseDate || "",
      "تێبینی": r.processingTime !== null ? r.processingTime : "",
      "کاتی تێچوو بە کۆد بۆ خشتەی تێبینی2": "",
      "hollidays": "",
      "کاتی تێچوو بەپێی ڕێنمایی": r.slaTime || "",
    }));

    // Format sent letters for excel
    const formattedSent = sent.map(s => ({
      "#": s.id,
      "بابەت": s.subject,
      "لایەنی پەیوەندیدار 1": s.dept1 || "",
      "لایەنی پەیوەندیدار 2": s.dept2 || "",
      "لایەنی پەیوەندیدار 3": s.dept3 || "",
      "جۆر": s.refCode,
      "جۆری نامە": s.letterType,
      "ڕۆژی ناردن": s.sentDate || "",
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    const wsReceived = XLSX.utils.json_to_sheet(formattedReceived);
    XLSX.utils.book_append_sheet(workbook, wsReceived, "وەڵامی نووسراوە نێردراوەکان");

    const wsSent = XLSX.utils.json_to_sheet(formattedSent);
    XLSX.utils.book_append_sheet(workbook, wsSent, "سەرجەم نووسراوە ڕەوانەکراوەکان");

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', cellDates: true });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="database_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });
  } catch (error: any) {
    console.error('Failed to export database:', error);
    return NextResponse.json({ error: 'Failed to export database' }, { status: 500 });
  }
}
