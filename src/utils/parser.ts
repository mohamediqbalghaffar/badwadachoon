import * as XLSX from "xlsx";
import { format, parse } from "date-fns";

export interface DashboardData {
  id: string | number;
  subject: string;
  department: string;
  refCode: string;
  letterType: string;
  sentDate: string | null;
  responseDate: string | null;
  processingTime: number | null;
  slaTime: string;
}

// Map Kurdish headers to English keys
const HeaderMap: Record<string, keyof DashboardData> = {
  "#": "id",
  "بابەت": "subject",
  "لایەنی پەیوەندیدار": "department",
  "جۆر": "refCode",
  "جۆری نامە": "letterType",
  "ڕۆژی ناردن": "sentDate",
  "ڕۆژی وەڵام": "responseDate",
  "تێبینی": "processingTime",
  "کاتی تێچوو بەپێی ڕێنمایی": "slaTime",
};

export const parseFile = async (file: File): Promise<DashboardData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays first to find headers
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        
        const parsedData: DashboardData[] = rawJson.map((row: any, index: number) => {
          const item: Partial<DashboardData> = {};
          
          for (const [key, value] of Object.entries(row)) {
            // Check if key matches exactly or is a substring in our map
            // Note: In excel, headers might have spaces
            const matchedKey = Object.keys(HeaderMap).find(k => key.trim().includes(k));
            
            if (matchedKey) {
              const mappedKey = HeaderMap[matchedKey];
              let finalValue = value;
              
              // Handle dates correctly if they are parsed as Date objects
              if (finalValue instanceof Date) {
                finalValue = format(finalValue, 'yyyy-MM-dd');
              } else if (typeof finalValue === 'number' && (mappedKey === 'sentDate' || mappedKey === 'responseDate')) {
                 // Convert Excel serial date to JS Date
                 const jsDate = new Date((finalValue - (25567 + 2)) * 86400 * 1000);
                 if (!isNaN(jsDate.getTime())) {
                   finalValue = format(jsDate, 'yyyy-MM-dd');
                 } else {
                   finalValue = null;
                 }
              }
              
              // Handle processing time
              if (mappedKey === 'processingTime' && finalValue !== null) {
                finalValue = parseInt(finalValue as string, 10);
                if (isNaN(finalValue)) finalValue = null;
              }

              item[mappedKey] = finalValue as any;
            }
          }

          // Provide fallbacks
          return {
            id: item.id || index + 1,
            subject: item.subject || "نەزانراو",
            department: item.department || "نەزانراو",
            refCode: item.refCode || "-",
            letterType: item.letterType || "گشتی",
            sentDate: item.sentDate || null,
            responseDate: item.responseDate || null,
            processingTime: item.processingTime ?? null,
            slaTime: item.slaTime || "-",
          } as DashboardData;
        });

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};
