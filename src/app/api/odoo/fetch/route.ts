import { NextResponse } from 'next/server';

const ODOO_URL = process.env.ODOO_URL || "https://erp.halabjagroup.com";
const ODOO_DB = process.env.ODOO_DB || "HalabjaGroup";
const ODOO_USER = process.env.ODOO_USER || "mohammed.iqbal@halabjagroup.com";
// Using the API Key in place of the password
const ODOO_PASS = process.env.ODOO_PASS || "060cd9028edeae314568e577869cded5aeb7fb20";

export async function GET() {
  try {
    // 1. Authenticate to get the UID
    const authPayload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "authenticate",
        args: [ODOO_DB, ODOO_USER, ODOO_PASS, {}]
      },
      id: 1
    };

    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authPayload)
    });
    const authData = await authRes.json();

    if (!authData.result) {
      console.error("Odoo Authentication Failed:", authData);
      return NextResponse.json({ success: false, error: "Failed to authenticate with Odoo API" }, { status: 401 });
    }

    const uid = authData.result;

    // 2. Fetch the last 10 days of Approval Requests
    const date10DaysAgo = new Date();
    date10DaysAgo.setDate(date10DaysAgo.getDate() - 10);
    const dateStr = date10DaysAgo.toISOString().split("T")[0];

    const searchPayload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_DB,
          uid,
          ODOO_PASS,
          "approval.request",
          "search_read",
          [[["date", ">=", dateStr]]], // Only last 10 days
          { 
            limit: 500, // Increased limit to capture all requests in 10 days
            fields: ["name", "date", "approval_subject", "request_owner_id"],
            order: "id desc"
          }
        ]
      },
      id: 2
    };

    const searchRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchPayload)
    });
    
    const searchData = await searchRes.json();

    if (searchData.error) {
      console.error("Odoo Fetch Error:", searchData.error);
      return NextResponse.json({ success: false, error: "Failed to read data from Odoo" }, { status: 500 });
    }

    // 3. Format the data for our React component
    const formattedData = searchData.result.map((item: any) => ({
      id: `odoo-${item.id}`,
      odooDate: item.date,
      approvalSubject: item.name,
      subject: item.approval_subject || "بێ بابەت",
      requestOwner: Array.isArray(item.request_owner_id) ? item.request_owner_id[1] : item.request_owner_id
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching from Odoo:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch from Odoo" }, { status: 500 });
  }
}
