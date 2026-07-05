
const XLSX = require("xlsx");
const wb = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const ws = wb.Sheets["وەڵامی نووسراوە نێردراوەکان"];
console.log(ws["M2"]);
console.log(ws["M3"]);
console.log(ws["M4"]);

