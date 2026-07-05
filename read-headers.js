
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = "وەڵامی نووسراوە نێردراوەکان";
const sheet = workbook.Sheets[sheetName];
if (sheet) {
  for (let c = 9; c <= 12; c++) {
    const colStr = String.fromCharCode(65 + c);
    const cell = sheet[colStr + "1"];
    console.log(`${colStr}1: `, cell ? cell.v : "empty");
  }
}

