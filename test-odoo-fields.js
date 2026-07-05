
const url = "https://erp.halabjagroup.com";
const db = "HalabjaGroup";
const username = "mohammed.iqbal@halabjagroup.com";
const password = "8118d3d4560146aed84264cf83f083bcce3583f3";

async function testOdoo() {
  const authRes = await fetch(`${url}/jsonrpc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "authenticate", args: [db, username, password, {}] }, id: 1 }) });
  const uid = (await authRes.json()).result;

  const searchRes = await fetch(`${url}/jsonrpc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "object", method: "execute_kw", args: [ db, uid, password, "approval.request", "search_read", [[["id", "=", 59357]]], { limit: 1 } ] }, id: 2 }) });
  
  const data = await searchRes.json();
  console.log(JSON.stringify(data, null, 2));
}

testOdoo();

