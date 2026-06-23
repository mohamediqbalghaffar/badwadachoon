import * as XLSX from "xlsx";
import { format, parse } from "date-fns";

export interface DashboardData {
  id: string | number;
  subject: string;
  department: string;
  departments: string[];
  dept1?: string;
  dept2?: string;
  dept3?: string;
  refCode: string;
  letterType: string;
  sentDate: string | null;
  responseDate: string | null;
  processingTime: number | null;
  slaTime: string;
  _raw?: any;
}

export interface SentLetterData {
  id: string | number;
  subject: string;
  department: string;
  departments: string[];
  dept1?: string;
  dept2?: string;
  dept3?: string;
  refCode: string;
  letterType: string;
  sentDate: string | null;
  _raw?: any;
}

export interface IncomingLetterData {
  id: string | number;
  subject: string;
  sender?: string;
  department: string;
  departments: string[];
  dept1?: string;
  dept2?: string;
  dept3?: string;
  refCode: string;
  letterType: string;
  sentDate: string | null;
  _raw?: any;
}

export interface ParseResult {
  receivedData: DashboardData[];
  sentData: SentLetterData[];
  incomingData: IncomingLetterData[];
}

const normalizeHeader = (str: string): string => {
  return str
    .replace(/[\s\u200B-\u200D\uFEFF]/g, "") // remove all whitespace and zero-width chars
    .replace(/[\u064A\u0649\u06CE\u06CC]/g, "ی") // normalize all Ye variants
    .replace(/[\u0647\u0629\u06D5\u06C0]/g, "ە") // normalize Heh/Teh Marbuta/Kurdish Ae/Heh with Yeh above
    .replace(/ڕ/g, "ر") // normalize Rha to Ra for looser matching
    .replace(/ڵ/g, "ل") // normalize Lla to La for looser matching
    .replace(/ێ/g, "ی"); // normalize E to Ye for looser matching
};

// Map Kurdish headers to English keys for Sheet 1 (Received Letters)
const ReceivedHeaderMap: Record<string, keyof DashboardData> = {
  "#": "id",
  "بابەت": "subject",
  "لایەنی پەیوەندیدار 1": "dept1",
  "لایەنی پەیوەندیدار 2": "dept2",
  "لایەنی پەیوەندیدار 3": "dept3",
  "جۆر": "refCode",
  "جۆری نامە": "letterType",
  "ڕۆژی ناردن": "sentDate",
  "ڕۆژی وەڵام": "responseDate",
  "تێبینی": "processingTime",
  "تیپیبنی": "processingTime", // Handle typo in Column H
  "کاتی تێچوو بۆ وەڵام": "processingTime",
  "کاتی تێچوو بەپێی ڕێنمایی": "slaTime",
};

// Map Kurdish headers to English keys for Sheet 2 (Sent Letters)
const SentHeaderMap: Record<string, keyof SentLetterData> = {
  "#": "id",
  "بابەت": "subject",
  "لایەنی پەیوەندیدار 1": "dept1",
  "لایەنی پەیوەندیدار 2": "dept2",
  "لایەنی پەیوەندیدار 3": "dept3",
  "جۆر": "refCode",
  "جۆری نامە": "letterType",
  "ڕۆژی ناردن": "sentDate",
};

// Map Kurdish headers to English keys for Sheet 3 (Incoming Letters)
const IncomingHeaderMap: Record<string, keyof IncomingLetterData> = {
  "#": "id",
  "بابەت": "subject",
  "هاتووە لە": "sender",
  "لایەنی پەیوەندیدار": "dept1",
  "لایەنی پەیوەندیدار 1": "dept1",
  "لایەنی پەیوەندیدار 2": "dept2",
  "لایەنی پەیوەندیدار 3": "dept3",
  "جۆر": "refCode",
  "جۆری نامە": "letterType",
  "ڕۆژی ناردن": "sentDate",
};

// Known sheet names (with normalized matching)
const RECEIVED_SHEET_NAMES = [
  "وەڵامی نووسراوە نێردراوەکان",
  "وەڵامەکان",
  "هاتوو"
];
const SENT_SHEET_NAMES = [
  "سەرجەم نووسراوە ڕەوانەکراوەکان",
  "سەرجەم ڕەوانەکراوەکان",
  "نووسراوە ڕەوانەکراوەکان",
  "ڕەوانەکراوەکان",
  "دەرچوو"
];
const INCOMING_SHEET_NAMES = [
  "سەرجەم نووسراوە هاتووەکان",
  "سەرجەم هاتووەکان",
  "نووسراوە هاتووەکان"
];

const findSheetByName = (workbook: XLSX.WorkBook, targetNames: string[]): XLSX.WorkSheet | null => {
  for (const sheetName of workbook.SheetNames) {
    const normSheet = normalizeHeader(sheetName);
    for (const target of targetNames) {
      const normTarget = normalizeHeader(target);
      if (normSheet === normTarget) {
        return workbook.Sheets[sheetName];
      }
      // Also try substring match
      if (normSheet.includes(normTarget) || normTarget.includes(normSheet)) {
        return workbook.Sheets[sheetName];
      }
    }
  }
  return null;
};

const parseDate = (value: any): string | null => {
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd');
  } else if (typeof value === 'number') {
    const jsDate = new Date((value - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(jsDate.getTime())) {
      return format(jsDate, 'yyyy-MM-dd');
    }
  }
  return null;
};

const mapRow = <T extends Record<string, any>>(
  row: any,
  headerMap: Record<string, string>,
  dateFields: string[],
  intFields: string[]
): Partial<T> => {
  const item: Record<string, any> = {};

  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key.trim();
    const normKey = normalizeHeader(cleanKey);

    // 1. Try exact match first
    let matchedKey = Object.keys(headerMap).find(k => normalizeHeader(k) === normKey);

    // 2. Try substring match (sorted by length descending to match longer headers first)
    if (!matchedKey) {
      const sortedKeys = Object.keys(headerMap).sort((a, b) => b.length - a.length);
      matchedKey = sortedKeys.find(k => {
        const normMapKey = normalizeHeader(k);

        // Explicitly avoid matching "تیپیبنی 2", "تێبینی 2" or "کاتی تێچوو بۆ وەڵام 2" for processingTime
        if ((k === "تێبینی" || k === "تیپیبنی" || k === "کاتی تێچوو بۆ وەڵام") && normKey.includes("2")) {
          return false;
        }

        return normKey.includes(normMapKey);
      });
    }

    if (matchedKey) {
      const mappedKey = headerMap[matchedKey];
      let finalValue = value;

      // Handle dates
      if (dateFields.includes(mappedKey)) {
        finalValue = parseDate(value);
      }
      // Handle integers
      else if (intFields.includes(mappedKey)) {
        finalValue = typeof value === 'number' ? Math.round(value) : parseInt(String(value), 10);
        if (isNaN(finalValue as number)) finalValue = null;
      }
      // Handle strings
      else if (typeof value === 'string') {
        finalValue = value.trim();
      }

      item[mappedKey] = finalValue;
    }
  }

  item['_raw'] = row;

  return item as Partial<T>;
};

const parseReceivedSheet = (worksheet: XLSX.WorkSheet): DashboardData[] => {
  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  return rawJson.map((row: any, index: number) => {
    const item = mapRow<DashboardData>(
      row,
      ReceivedHeaderMap,
      ['sentDate', 'responseDate'],
      ['processingTime']
    );

    const depts = [item.dept1, item.dept2, item.dept3].filter(Boolean) as string[];

    return {
      id: item.id || index + 1,
      subject: item.subject || "نەزانراو",
      department: depts.length > 0 ? depts.join(", ") : "نەزانراو",
      departments: depts,
      refCode: item.refCode || "-",
      letterType: item.letterType || "گشتی",
      sentDate: item.sentDate || null,
      responseDate: item.responseDate || null,
      processingTime: item.processingTime ?? null,
      slaTime: item.slaTime || "-",
    } as DashboardData;
  });
};

const parseSentSheet = (worksheet: XLSX.WorkSheet): SentLetterData[] => {
  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  return rawJson.map((row: any, index: number) => {
    const item = mapRow<SentLetterData>(
      row,
      SentHeaderMap,
      ['sentDate'],
      []
    );

    const depts = [item.dept1, item.dept2, item.dept3].filter(Boolean) as string[];

    return {
      id: item.id || index + 1,
      subject: item.subject || "نەزانراو",
      department: depts.length > 0 ? depts.join(", ") : "نەزانراو",
      departments: depts,
      refCode: item.refCode || "-",
      letterType: item.letterType || "گشتی",
      sentDate: item.sentDate || null,
    } as SentLetterData;
  });
};

const parseIncomingSheet = (worksheet: XLSX.WorkSheet): IncomingLetterData[] => {
  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  return rawJson.map((row: any, index: number) => {
    const item = mapRow<IncomingLetterData>(
      row,
      IncomingHeaderMap,
      ['sentDate'],
      []
    );

    const depts = [item.dept1, item.dept2, item.dept3].filter(Boolean) as string[];

    return {
      id: item.id || index + 1,
      subject: item.subject || "نەزانراو",
      sender: item.sender || "نەزانراو",
      department: depts.length > 0 ? depts.join(", ") : "نەزانراو",
      departments: depts,
      refCode: item.refCode || "-",
      letterType: item.letterType || "گشتی",
      sentDate: item.sentDate || null,
    } as IncomingLetterData;
  });
};

export const parseFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        // --- Parse Sheet 1 (Received Letters) ---
        let receivedSheet = findSheetByName(workbook, RECEIVED_SHEET_NAMES);
        if (!receivedSheet) {
          // Fallback to first sheet
          receivedSheet = workbook.Sheets[workbook.SheetNames[0]];
        }
        const receivedData = receivedSheet ? parseReceivedSheet(receivedSheet) : [];

        // --- Parse Sheet 2 (Sent Letters) ---
        let sentSheet = findSheetByName(workbook, SENT_SHEET_NAMES);
        if (!sentSheet && workbook.SheetNames.length >= 2) {
          sentSheet = workbook.Sheets[workbook.SheetNames[1]];
        }
        const sentData = sentSheet ? parseSentSheet(sentSheet) : [];

        // --- Parse Sheet 3 (Incoming Letters) ---
        let incomingSheet = findSheetByName(workbook, INCOMING_SHEET_NAMES);
        if (!incomingSheet && workbook.SheetNames.length >= 3) {
          incomingSheet = workbook.Sheets[workbook.SheetNames[2]];
        }
        const incomingData = incomingSheet ? parseIncomingSheet(incomingSheet) : [];

        resolve({ receivedData, sentData, incomingData });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
