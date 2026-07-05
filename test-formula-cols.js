
const XLSX = require("xlsx");
const wb = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const ws = wb.Sheets["وەڵامی نووسراوە نێردراوەکان"];
console.log("J1:", ws["J1"] ? ws["J1"].v : "null");
console.log("L1:", ws["L1"] ? ws["L1"].v : "null");

