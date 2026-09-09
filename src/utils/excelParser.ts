import * as XLSX from 'xlsx';
import { ProductMapping, ProcessedRecord, UnmappedItem } from '../types';

export function formatTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function parseIntegerGs(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  
  // If it's already a number
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.abs(Math.round(val));
  }

  // If it's an object with a value property (SheetJS cell object)
  if (typeof val === 'object') {
    if (val.v !== undefined && val.v !== null) {
      return parseIntegerGs(val.v);
    }
    if (val.w !== undefined && val.w !== null) {
      return parseIntegerGs(val.w);
    }
  }

  // Convert to string and clean all whitespace, non-breaking spaces
  let str = String(val)
    .replace(/[\s\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]+/g, ' ')
    .trim();

  // Remove currency signs & common currency words
  str = str.replace(/zł|pln|eur|usd|\$|€/gi, '').trim();

  // Remove spaces (used often as thousand separators e.g. "1 500,00")
  str = str.replace(/\s+/g, '');

  // Handle commas and dots:
  // e.g. "1.250,50" -> "1250.50" or "240,50" -> "240.50"
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }

  // Extract first floating-point number found in string
  const match = str.match(/[-+]?\d+(\.\d+)?/);
  if (!match) return 0;

  const parsed = parseFloat(match[0]);
  if (isNaN(parsed)) return 0;

  // Ensure positive integer
  return Math.abs(Math.round(parsed));
}

export interface SheetColumnInfo {
  index: number;
  letter: string; // e.g. "A", "J"
  header: string;
  sampleValues: (string | number)[];
  hasNumbers: boolean;
}

export function getColumnLetter(colIndex: number): string {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function inspectSheetColumns(worksheet: XLSX.WorkSheet, maxCols: number = 26): SheetColumnInfo[] {
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) return [];

  // Determine maximum column count
  let actualMaxCols = 0;
  for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
    if (rawRows[r] && rawRows[r].length > actualMaxCols) {
      actualMaxCols = rawRows[r].length;
    }
  }
  // At least 11 columns to ensure Column J (index 9) is visible
  actualMaxCols = Math.max(actualMaxCols, 11, maxCols);

  const firstRow = rawRows[0] || [];
  const columns: SheetColumnInfo[] = [];

  for (let c = 0; c < actualMaxCols; c++) {
    const letter = getColumnLetter(c);
    const headerVal = firstRow[c] !== undefined ? String(firstRow[c]).trim() : '';
    
    // Gather sample values from rows 1..5
    const sampleVals: (string | number)[] = [];
    let hasNumbers = false;

    for (let r = 1; r < Math.min(rawRows.length, 6); r++) {
      let val = rawRows[r]?.[c];
      if (val === undefined || val === null || val === '') {
        // Also check raw cell directly
        const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
        if (cell) val = cell.v !== undefined ? cell.v : cell.w;
      }

      if (val !== undefined && val !== null && val !== '') {
        const parsedNum = parseIntegerGs(val);
        if (parsedNum > 0) hasNumbers = true;
        sampleVals.push(typeof val === 'number' ? val : String(val));
      }
    }

    columns.push({
      index: c,
      letter,
      header: headerVal,
      sampleValues: sampleVals,
      hasNumbers,
    });
  }

  return columns;
}

export interface ParseExcelOptions {
  sheetName?: string;
  codeColIndex?: number; // default 0 (col A)
  gsColIndex?: number;   // default 9 (col J)
  descColIndex?: number; // default 3 (col D - opis produktu)
  hasHeader?: boolean;
}

export function extractExcelData(
  workbook: XLSX.WorkBook,
  mappings: Record<string, ProductMapping>,
  options: ParseExcelOptions = {}
): {
  records: ProcessedRecord[];
  unmappedItems: UnmappedItem[];
  sheetNames: string[];
  selectedSheet: string;
  totalParsedRows: number;
  emptyRowsSkipped: number;
  usedCodeCol: number;
  usedGsCol: number;
  usedDescCol: number;
} {
  const sheetNames = workbook.SheetNames;
  const selectedSheet = options.sheetName && sheetNames.includes(options.sheetName)
    ? options.sheetName
    : sheetNames[0];

  const worksheet = workbook.Sheets[selectedSheet];
  if (!worksheet) {
    throw new Error('Wybrany arkusz nie został znaleziony');
  }

  // Convert worksheet to array of arrays
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    return {
      records: [],
      unmappedItems: [],
      sheetNames,
      selectedSheet,
      totalParsedRows: 0,
      emptyRowsSkipped: 0,
      usedCodeCol: options.codeColIndex ?? 0,
      usedGsCol: options.gsColIndex ?? 9,
      usedDescCol: options.descColIndex ?? 3,
    };
  }

  // Column A is index 0 by default; Column J is index 9 by default; Column D is index 3 by default
  let codeCol = options.codeColIndex !== undefined ? options.codeColIndex : 0;
  let gsCol = options.gsColIndex !== undefined ? options.gsColIndex : 9;
  let descCol = options.descColIndex !== undefined ? options.descColIndex : 3;
  let startRow = 0;

  const firstRow = rawRows[0] || [];
  const firstRowStrings = firstRow.map((c) => String(c || '').toLowerCase().trim());

  // If user did NOT explicitly specify gsColIndex, check if Column J (9) has data or if another column has specific "premia gs" header
  if (options.gsColIndex === undefined) {
    const specificGsHeaderIdx = firstRowStrings.findIndex((s) =>
      s === 'gs' || s === 'premia gs' || s === 'premia_gs' || s.startsWith('premia gs')
    );
    if (specificGsHeaderIdx !== -1) {
      gsCol = specificGsHeaderIdx;
    } else {
      gsCol = 9; // Col J default
    }
  }

  // If user did NOT explicitly specify codeColIndex
  if (options.codeColIndex === undefined) {
    const specificCodeHeaderIdx = firstRowStrings.findIndex((s) =>
      s === 'kod' || s === 'code' || s === 'kod produktu' || s === 'sku'
    );
    if (specificCodeHeaderIdx !== -1) {
      codeCol = specificCodeHeaderIdx;
    } else {
      codeCol = 0; // Col A default
    }
  }

  // If user did NOT explicitly specify descColIndex, check if Column D (3) has header or look for "opis"/"nazwa"/"produkt"
  if (options.descColIndex === undefined) {
    const specificDescHeaderIdx = firstRowStrings.findIndex((s) =>
      s.includes('opis') || s.includes('nazwa') || s.includes('towar') || s.includes('produkt') || s.includes('description')
    );
    if (specificDescHeaderIdx !== -1) {
      descCol = specificDescHeaderIdx;
    } else {
      descCol = 3; // Col D default
    }
  }

  // Detect header row
  if (options.hasHeader !== false) {
    const colAHeader = firstRowStrings[codeCol] || '';
    const colJHeader = firstRowStrings[gsCol] || '';
    const looksLikeHeader =
      colAHeader.includes('kod') ||
      colAHeader.includes('sku') ||
      colAHeader.includes('code') ||
      colAHeader.includes('model') ||
      colJHeader.includes('gs') ||
      colJHeader.includes('premia') ||
      isNaN(Number(firstRow[codeCol])) && isNaN(Number(firstRow[gsCol]));

    if (looksLikeHeader || options.hasHeader === true) {
      startRow = 1;
    }
  }

  const records: ProcessedRecord[] = [];
  const unmappedMap = new Map<string, UnmappedItem>();
  let emptyRowsSkipped = 0;
  const currentTimestamp = formatTimestamp();

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) {
      emptyRowsSkipped++;
      continue;
    }

    // Read raw code: check row array first, fallback to direct worksheet cell
    let rawCodeVal = row[codeCol] !== undefined && row[codeCol] !== null ? String(row[codeCol]).trim() : '';
    if (!rawCodeVal) {
      const cellCode = worksheet[XLSX.utils.encode_cell({ r, c: codeCol })];
      if (cellCode) {
        rawCodeVal = cellCode.v !== undefined ? String(cellCode.v).trim() : (cellCode.w ? String(cellCode.w).trim() : '');
      }
    }

    // Read raw description (Column D by default)
    let rawDescVal = row[descCol] !== undefined && row[descCol] !== null ? String(row[descCol]).trim() : '';
    if (!rawDescVal) {
      const cellDesc = worksheet[XLSX.utils.encode_cell({ r, c: descCol })];
      if (cellDesc) {
        rawDescVal = cellDesc.v !== undefined ? String(cellDesc.v).trim() : (cellDesc.w ? String(cellDesc.w).trim() : '');
      }
    }

    // Read raw GS: check row array first, fallback to direct worksheet cell
    let rawGsVal = row[gsCol];
    if (rawGsVal === undefined || rawGsVal === null || rawGsVal === '') {
      const cellGs = worksheet[XLSX.utils.encode_cell({ r, c: gsCol })];
      if (cellGs) {
        rawGsVal = cellGs.v !== undefined ? cellGs.v : cellGs.w;
      }
    }

    // If both code and GS are completely empty, skip empty row
    if (!rawCodeVal && (rawGsVal === undefined || rawGsVal === null || rawGsVal === '') && !rawDescVal) {
      emptyRowsSkipped++;
      continue;
    }

    const parsedGs = parseIntegerGs(rawGsVal);
    const normalizedCode = rawCodeVal.toUpperCase();
    const mapping = mappings[normalizedCode];

    if (mapping) {
      records.push({
        id: `rec-${r}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        rowIndex: r + 1, // 1-based row index in file
        code: rawCodeVal,
        timestamp: currentTimestamp,
        brand: mapping.brand,
        model: mapping.model,
        gs: parsedGs,
        description: rawDescVal,
        source: 'mapped',
      });
    } else {
      // Unmapped or empty code
      const unmappedKey = normalizedCode || `__EMPTY_CODE_ROW_${r + 1}__`;
      if (!unmappedMap.has(unmappedKey)) {
        unmappedMap.set(unmappedKey, {
          key: unmappedKey,
          code: rawCodeVal,
          count: 1,
          sampleRows: [r + 1],
          sampleGs: parsedGs,
          brand: '',
          model: '',
          description: rawDescVal,
          saveToDatabase: true,
        });
      } else {
        const item = unmappedMap.get(unmappedKey)!;
        item.count++;
        item.sampleRows.push(r + 1);
        if (!item.description && rawDescVal) {
          item.description = rawDescVal;
        }
        if (item.sampleGs === 0 && parsedGs > 0) {
          item.sampleGs = parsedGs;
        }
      }

      records.push({
        id: `rec-${r}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        rowIndex: r + 1,
        code: rawCodeVal,
        timestamp: currentTimestamp,
        brand: '',
        model: '',
        gs: parsedGs,
        description: rawDescVal,
        source: 'manual',
      });
    }
  }

  return {
    records,
    unmappedItems: Array.from(unmappedMap.values()),
    sheetNames,
    selectedSheet,
    totalParsedRows: records.length,
    emptyRowsSkipped,
    usedCodeCol: codeCol,
    usedGsCol: gsCol,
    usedDescCol: descCol,
  };
}

export function generateSampleExcelFile(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Create columns: A=Kod, B=Numer seryjny, C=Data, D=Opis (Kolumna D), E..I=other, J=Premia GS
  const headers: string[] = [
    'Kod',             // Col A (0)
    'Numer seryjny',   // Col B (1)
    'Data operacji',   // Col C (2)
    'Opis produktu',   // Col D (3) - Opis z pliku wejściowego!
    'Salon',           // Col E (4)
    'Kategoria',       // Col F (5)
    'Ilość',           // Col G (6)
    'Cena netto',      // Col H (7)
    'Prowizja bazowa', // Col I (8)
    'Premia GS',       // Col J (9) - Ważna kolumna!
    'Komentarz',       // Col K (10)
  ];

  const sampleRows: any[][] = [
    headers,
    ['SAM-S24-128', 'SN992144', '2026-09-01', 'Smartfon Samsung Galaxy S24 128GB Czarny', 'Warszawa Centrum', 'Smartfony', 1, 3599.00, 150, 240, 'Wypłacona'],
    ['APL-IP16P-256', 'SN441299', '2026-09-02', 'Smartfon Apple iPhone 16 Pro 256GB Tytan', 'Kraków Bonarka', 'Smartfony', 1, 6499.00, 200, 350, 'Standard'],
    ['XIA-RN13-8', 'SN882103', '2026-09-03', 'Smartfon Xiaomi Redmi Note 13 8/256GB', 'Gdańsk Forum', 'Smartfony', 2, 1299.00, 80, 120, 'Promocja'],
    ['KOD-NIEZNANY-99', 'SN110294', '2026-09-04', 'Smartfon Motorola Edge 50 Pro 12/512GB Black', 'Warszawa Centrum', 'Smartfony', 1, 2899.00, 100, 180, 'Wymaga weryfikacji'],
    ['SNY-WH1000-B', 'SN772911', '2026-09-05', 'Słuchawki Sony WH-1000XM5 ANC Czarne', 'Wrocław Magnolia', 'Audio', 1, 1499.00, 50, 95, 'Akcesoria'],
    ['', 'SN999999', '2026-09-06', 'Smartfon Asus ROG Phone 8 16/512GB Phantom', 'Poznań Plaza', 'Inne', 1, 1999.00, 70, 110, 'Brak kodu w pliku'],
    ['SAM-S24U-256', 'SN334102', '2026-09-07', 'Smartfon Samsung Galaxy S24 Ultra 256GB Szary', 'Kraków Bonarka', 'Smartfony', 1, 5999.00, 250, 420, 'Premium'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleRows);

  ws['!cols'] = [
    { wch: 18 }, // A Kod
    { wch: 14 }, // B
    { wch: 14 }, // C
    { wch: 18 }, // D
    { wch: 20 }, // E
    { wch: 14 }, // F
    { wch: 8 },  // G
    { wch: 12 }, // H
    { wch: 15 }, // I
    { wch: 14 }, // J Premia GS
    { wch: 20 }, // K
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Raport Sprzedaży');

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
}
