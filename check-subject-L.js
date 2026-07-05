
const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:\\Users\\PC\\Desktop\\خشتەی زانیارییەکان بۆ داتابەیس.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
console.log("Subjects for letterType = نامەی گشتی and their L codes:");
if (sheet) {
  for (let i = 2; i <= 20; i++) {
    const lType = sheet["G"+i]?.v; // G is "جۆری نامە"
    const lCode = sheet["L"+i]?.v; // L is "کۆد"
    const lSubj = sheet["B"+i]?.v; // B is "بابەت"
    if (lType === "نامەی گشتی") {
      console.log(`Subj: ${lSubj} => Code: ${lCode}`);
    }
  }
}

