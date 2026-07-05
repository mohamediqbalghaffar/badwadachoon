
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = "وەڵامی نووسراوە نێردراوەکان";
const sheet = workbook.Sheets[sheetName];
if (sheet) {
  for (let i = 2; i <= 5; i++) {
    console.log(`Row ${i}: J=`, sheet["J"+i]?.v, ` L=`, sheet["L"+i]?.v, ` M=`, sheet["M"+i]?.v, ` M(f)=`, sheet["M"+i]?.f);
  }
}

