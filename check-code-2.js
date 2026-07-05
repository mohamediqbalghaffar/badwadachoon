
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = "وەڵامی نووسراوە نێردراوەکان";
const sheet = workbook.Sheets[sheetName];
console.log("Unique Column L values (کۆد بۆ خشتەی D):");
if (sheet) {
  const vals = new Set();
  for (let i = 2; i <= 500; i++) {
    const v = sheet["L"+i]?.v;
    if (v !== undefined) vals.add(v);
  }
  console.log(Array.from(vals));
}

