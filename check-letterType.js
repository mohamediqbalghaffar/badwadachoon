
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
console.log("Sheet 1 letterType vs L (code):");
if (sheet) {
  const map = new Map();
  for (let i = 2; i <= 500; i++) {
    const lType = sheet["G"+i]?.v; // G is "جۆری نامە"
    const lCode = sheet["L"+i]?.v; // L is "کۆد"
    if (lType && lCode) {
      if (!map.has(lType)) map.set(lType, new Set());
      map.get(lType).add(lCode);
    }
  }
  for (const [k, v] of map.entries()) {
    console.log(k, "=>", Array.from(v));
  }
}

