export interface ProductMapping {
  code: string;
  brand: string;
  model: string; // SKU symbol / model designation
  updatedAt?: string;
}

export interface RawExcelRecord {
  rowIndex: number;
  rawCode: string;
  rawGs: any;
  cleanedCode: string;
  parsedGs: number;
  allColumns?: Record<string, any>;
}

export interface ProcessedRecord {
  id: string;
  rowIndex: number;
  code: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  brand: string;     // Marka produktu
  model: string;     // Symbol SKU / Model
  gs: number;        // Wartość całkowita GS (int)
  description?: string; // Zawartość kolumny D (opis produktu) z pliku
  source: 'mapped' | 'manual';
}

export interface UnmappedItem {
  key: string;
  code: string;
  count: number;
  sampleRows: number[];
  sampleGs: number;
  brand: string;
  model: string;
  description?: string; // Zawartość kolumny D (opis produktu) z pliku
  saveToDatabase: boolean;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetId: string;
  sheetName: string;
  autoSaveMappings: boolean;
}

export interface ProcessingResult {
  records: ProcessedRecord[];
  totalRows: number;
  unmappedItems: UnmappedItem[];
  ignoredEmptyRows: number;
}
