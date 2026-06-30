import { NextResponse } from 'next/server';

// This is a temporary Mock API to simulate fetching the last 10 days of Odoo Approval Requests
// Once Odoo XML-RPC is configured, this will connect to the real Odoo instance.
export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate some mock data based on the user's screenshot
    const today = new Date();
    const mockData = Array.from({ length: 8 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 5)); // Last 5 days
      
      const isCandidate = Math.random() > 0.5;
      
      return {
        id: `odoo-${index}`,
        odooDate: date.toISOString(),
        approvalSubject: isCandidate ? `HR/Candidate/000${index + 1}` : `GL/046${50 + index}`,
        subject: isCandidate ? 'داواکاری کاندیدکردن' : 'وەڵامی نووسراوی سەردانیکردنی ئۆفیسی شارەزوور',
        requestOwner: isCandidate ? 'سامی گشتی / محمد اقبال غفار' : 'سامی گشتی / ان احمد محمد'
      };
    });

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    console.error("Error fetching from Odoo:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch from Odoo" }, { status: 500 });
  }
}
