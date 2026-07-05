
const url = "https://erp.halabjagroup.com";
const db = "HalabjaGroup";
const username = "mohammed.iqbal@halabjagroup.com";
const password = "Mohammed99@"; // Or API Key: 8118d3d4560146aed84264cf83f083bcce3583f3

async function testOdoo() {
  try {
    // 1. Authenticate to get uid
    const authPayload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "authenticate",
        args: [db, username, "8118d3d4560146aed84264cf83f083bcce3583f3", {}]
      },
      id: 1
    };

    console.log("Authenticating...");
    const authRes = await fetch(`${url}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authPayload)
    });
    const authData = await authRes.json();
    console.log("Auth Result:", JSON.stringify(authData).substring(0, 200));

    if (!authData.result) {
        console.error("Authentication failed. Check credentials.");
        return;
    }
    const uid = authData.result;
    console.log("Authenticated! UID:", uid);

    // 2. Search & Read Approval Requests
    // The model for Approval Requests is usually "approval.request"
    const searchPayload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          db,
          uid,
          "8118d3d4560146aed84264cf83f083bcce3583f3",
          "approval.request",
          "search_read",
          [[]], // Empty domain for now
          {
            limit: 5,
            fields: ["name", "date", "request_owner_id", "category_id"],
            order: "id desc" // Get newest
          }
        ]
      },
      id: 2
    };

    console.log("Fetching approvals...");
    const searchRes = await fetch(`${url}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchPayload)
    });
    const searchData = await searchRes.json();
    console.log("Fetch Result:", JSON.stringify(searchData, null, 2));

  } catch (e) {
    console.error("Error:", e);
  }
}

testOdoo();

