
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = "وەڵامی نووسراوە نێردراوەکان";
const sheet = workbook.Sheets[sheetName];
console.log("Column L code values:");
if (sheet) {
  for (let i = 2; i <= 20; i++) {
    console.log(`Row ${i}: J (time)=`, sheet["J"+i]?.v, ` L (code)=`, sheet["L"+i]?.v);
  }
}

