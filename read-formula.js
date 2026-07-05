
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = "وەڵامی نووسراوە نێردراوەکان";
const sheet = workbook.Sheets[sheetName];
if (!sheet) {
  console.log("Sheet not found!");
} else {
  // Column M is index 12 (A=0, B=1, ... M=12)
  // Let us read M2, M3, M4 to see the formula
  for (let i = 2; i <= 5; i++) {
    const cell = sheet["M" + i];
    if (cell) {
      console.log(`M${i}: value=`, cell.v, ` formula=`, cell.f);
    }
  }
}

