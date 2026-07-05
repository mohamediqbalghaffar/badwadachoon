
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
console.log("Sheet 1 unique refCode (column F, جۆر):");
if (sheet) {
  const vals = new Set();
  for (let i = 2; i <= 500; i++) {
    const v = sheet["F"+i]?.v;
    if (v !== undefined) vals.add(v);
  }
  console.log(Array.from(vals));
}

