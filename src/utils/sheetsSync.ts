import * as XLSX from 'xlsx';
import { ProcessedRecord, GoogleSheetsConfig } from '../types';

export { getGoogleAppsScriptHtmlTemplate } from './standaloneHtml';

export const DEFAULT_SHEET_NAME = 'Form Responses 1';

export async function appendToGoogleSheets(
  records: ProcessedRecord[],
  config: GoogleSheetsConfig
): Promise<{ success: boolean; message: string; rowsAdded: number }> {
  if (!config.webAppUrl || !config.webAppUrl.trim()) {
    throw new Error('Brak adresu URL aplikacji Google Apps Script (Web App). Wprowadź go w ustawieniach integracji.');
  }

  const targetSheet = (config.sheetName && config.sheetName.trim()) || DEFAULT_SHEET_NAME;

  // Prepared row format: [timestamp, marka, model, gs]
  const rowsPayload = records.map(r => [
    r.timestamp,
    r.brand,
    r.model,
    r.gs,
  ]);

  try {
    const response = await fetch(config.webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Avoids CORS preflight issues with Google Apps Script
      },
      body: JSON.stringify({
        action: 'appendRows',
        sheetName: targetSheet,
        spreadsheetId: config.spreadsheetId || '',
        headers: ['timestamp', 'marka', 'model', 'gs'],
        rows: rowsPayload,
      }),
    });

    let responseText = '';
    try {
      responseText = await response.text();
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Pomyślnie dodano ${records.length} wierszy na końcu tabeli w zakładce "${targetSheet}"!`,
      rowsAdded: records.length,
    };
  } catch (err: any) {
    console.error('Google Sheets sync error:', err);
    throw new Error(`Błąd połączenia z Google Apps Script: ${err.message || 'Sprawdź adres Web App URL oraz uprawnienia'}`);
  }
}

export function copyToClipboardForGoogleSheets(records: ProcessedRecord[]): boolean {
  // Format as tab-separated values (TSV) - pastes directly into Google Sheets
  const header = ['timestamp\tmarka\tmodel\tgs'];
  const dataLines = records.map(r => `${r.timestamp}\t${r.brand}\t${r.model}\t${r.gs}`);
  const tsv = [...header, ...dataLines].join('\n');

  try {
    navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

export function downloadAsExcel(records: ProcessedRecord[], filename: string = 'dane_do_google_sheets.xlsx'): void {
  const wb = XLSX.utils.book_new();
  const data = records.map(r => ({
    timestamp: r.timestamp,
    marka: r.brand,
    model: r.model,
    gs: r.gs,
  }));

  const ws = XLSX.utils.json_to_sheet(data, {
    header: ['timestamp', 'marka', 'model', 'gs'],
  });

  ws['!cols'] = [
    { wch: 22 }, // timestamp
    { wch: 18 }, // marka
    { wch: 28 }, // model
    { wch: 10 }, // gs
  ];

  XLSX.utils.book_append_sheet(wb, ws, DEFAULT_SHEET_NAME);
  XLSX.writeFile(wb, filename);
}

export function downloadAsCsv(records: ProcessedRecord[], filename: string = 'dane_do_google_sheets.csv'): void {
  const header = 'timestamp;marka;model;gs\n';
  const rows = records.map(r => `"${r.timestamp}";"${r.brand}";"${r.model}";${r.gs}`).join('\n');
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * ============================================================================
 * GS FORM UPDATER - Google Apps Script
 * ============================================================================
 * Automatyczny zapis wierszy na końcu zakładki "Form Responses 1"
 * oraz możliwość uruchomienia aplikacji bezpośrednio w Google Sheets.
 *
 * INSTRUKCJA WDROŻENIA:
 * 1. Otwórz swój arkusz w Google Sheets.
 * 2. W menu u góry wybierz: Rozszerzenia -> Apps Script.
 * 3. Skasuj dotychczasowy kod i wklej ten cały plik (Ctrl+A, Ctrl+V).
 * 4. Kliknij niebieski przycisk "Wdróż" (Deploy) w prawym górnym rogu -> "Nowe wdrożenie" (New deployment).
 * 5. Wybierz typ: "Aplikacja internetowa" (Web app).
 * 6. Ustawienia:
 *    - Opis: GS Form Updater Webhook
 *    - Wykonaj jako: "Ja (twoje konto)" (Execute as: Me)
 *    - Kto ma dostęp: "Każdy" (Who has access: Anyone)
 * 7. Kliknij "Wdróż" i zezwól na uprawnienia (kliknij "Zaawansowane" -> "Przejdź do...").
 * 8. Skopiuj adres "Adres URL aplikacji internetowej" (kończy się na /exec)
 *    i wklej go w aplikacji w zakładce "Google Sheets".
 *
 * OPCJA DODATKOWA:
 * Po odświeżeniu Arkusza Google pojawi się nowe menu "⚙️ GS Form Updater",
 * skąd możesz otworzyć aplikację bezpośrednio w arkuszu (okno modalne lub pasek boczny)!
 */

// Zmień poniższy adres na adres swojej wdrożonej aplikacji webowej, jeśli chcesz osadzić ją w menu arkusza:
var APP_URL = "https://ais-pre-coq2xqf34pgy4qc5c3a6hv-217249792322.europe-west2.run.app";

/**
 * 1. Odbieranie danych z aplikacji (POST) i dopisanie na końcu "Form Responses 1"
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Domyślna zakładka docelowa: "Form Responses 1"
    var targetSheetName = data.sheetName || "Form Responses 1";
    var sheet = ss.getSheetByName(targetSheetName);
    
    // Jeśli zakładka nie istnieje, utwórz ją z nagłówkami
    if (!sheet) {
      sheet = ss.insertSheet(targetSheetName);
      sheet.appendRow(["timestamp", "marka", "model", "gs"]);
    }
    
    // Jeśli arkusz jest pusty, dodaj nagłówek
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["timestamp", "marka", "model", "gs"]);
    }
    
    var rows = data.records || data.rows || [];
    if (rows && rows.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rows.length, 4).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sheet: targetSheetName,
      appendedCount: rows.length,
      lastRow: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 2. Punkt wejścia GET (obsługuje bezpośredni plik index.html lub widok iframe)
 */
function doGet(e) {
  try {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('GS Form Updater')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    // Fallback jeśli plik index.html nie został jeszcze dodany w projekcie Apps Script
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<title>GS Form Updater</title>' +
      '<style>body{margin:0;padding:0;height:100vh;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style>' +
      '</head><body><iframe src="' + APP_URL + '" allow="clipboard-read; clipboard-write"></iframe></body></html>';
    return HtmlService.createHtmlOutput(html)
      .setTitle('GS Form Updater')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * 3. Bezpośrednie wywołanie zapisu z pliku index.html (google.script.run)
 */
function saveRecordsToSheets(rows, targetSheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = targetSheetName || "Form Responses 1";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["timestamp", "marka", "model", "gs"]);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "marka", "model", "gs"]);
  }
  
  if (rows && rows.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, 4).setValues(rows);
  }
  
  return {
    status: "success",
    appendedCount: rows.length,
    lastRow: sheet.getLastRow(),
    sheet: sheetName
  };
}

/**
 * 4. Odczyt i zapis słownika mapowań w Apps Script (PropertiesService)
 */
function getStoredMappings() {
  var props = PropertiesService.getUserProperties();
  var val = props.getProperty('GS_PRODUCT_MAPPINGS');
  return val ? JSON.parse(val) : {};
}

function saveStoredMappings(newMappings) {
  var props = PropertiesService.getUserProperties();
  props.setProperty('GS_PRODUCT_MAPPINGS', JSON.stringify(newMappings));
  return true;
}

/**
 * 5. Menu w Google Sheets: uruchomienie aplikacji bez wychodzenia z arkusza!
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ GS Form Updater')
    .addItem('🚀 Otwórz aplikację (Okno dialogowe)', 'openAppDialog')
    .addItem('📌 Otwórz aplikację (Pasek boczny)', 'openAppSidebar')
    .addSeparator()
    .addItem('🔍 Sprawdź stan zakładki "Form Responses 1"', 'checkTargetSheet')
    .addToUi();
}

/**
 * Otwiera aplikację w oknie modalnym wewnątrz Google Sheets
 */
function openAppDialog() {
  var html;
  try {
    html = HtmlService.createHtmlOutputFromFile('index');
  } catch (e) {
    html = HtmlService.createHtmlOutput(
      '<iframe src="' + APP_URL + '" style="width:100%; height:98%; border:none;" allow="clipboard-read; clipboard-write"></iframe>'
    );
  }
  html.setWidth(1150).setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, 'GS Form Updater - Przetwarzanie Excel');
}

/**
 * Otwiera aplikację w prawym pasku bocznym Google Sheets
 */
function openAppSidebar() {
  var html;
  try {
    html = HtmlService.createHtmlOutputFromFile('index');
  } catch (e) {
    html = HtmlService.createHtmlOutput(
      '<iframe src="' + APP_URL + '" style="width:100%; height:98%; border:none;" allow="clipboard-read; clipboard-write"></iframe>'
    );
  }
  html.setTitle('GS Form Updater');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Szybkie sprawdzenie czy zakładka Form Responses 1 istnieje i ile ma wierszy
 */
function checkTargetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Form Responses 1");
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Zakładka "Form Responses 1" jeszcze nie istnieje.\\nZostanie automatycznie utworzona z odpowiednimi nagłówkami przy pierwszym zapisie danych.');
  } else {
    SpreadsheetApp.getUi().alert('Zakładka "Form Responses 1" jest gotowa.\\nAktualna liczba zajętych wierszy: ' + sheet.getLastRow());
  }
}
`;
}

export function getPythonScriptTemplate(): string {
  return `"""
Skrypt Python: Przetwarzanie pliku Excel i zapis do zakładki Form Responses 1
Wymagania: pip install openpyxl gspread oauth2client
"""

import datetime
from openpyxl import load_workbook

# Słownik mapowania kodów (kod -> marka, model)
MAPPINGS = {
    "SAM-S24-128": {"brand": "Samsung", "model": "Galaxy S24 128GB"},
    "SAM-S24U-256": {"brand": "Samsung", "model": "Galaxy S24 Ultra 256GB"},
    "APL-IP16-128": {"brand": "Apple", "model": "iPhone 16 128GB"},
    "APL-IP16P-256": {"brand": "Apple", "model": "iPhone 16 Pro 256GB"},
    "XIA-RN13-8": {"brand": "Xiaomi", "model": "Redmi Note 13 Pro 8/256"},
    "SNY-WH1000-B": {"brand": "Sony", "model": "WH-1000XM5 Black"}
}

def clean_gs_value(raw_val):
    """Konwertuje wartość GS na liczbę całkowitą dodatnią (int)."""
    if raw_val is None or raw_val == "":
        return 0
    if isinstance(raw_val, (int, float)):
        return abs(round(raw_val))
    # Czyszczenie tekstu walutowego i spacji
    cleaned = str(raw_val).replace("zł", "").replace("PLN", "").replace(" ", "").replace(",", ".")
    import re
    m = re.search(r'\\d+(\\.\\d+)?', cleaned)
    if m:
        return abs(round(float(m.group(0))))
    return 0

def process_excel_file(filepath):
    wb = load_workbook(filepath, data_only=True)
    sheet = wb.active
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    processed_rows = []

    # Iteracja po wierszach od wiersza 2 (pomijamy nagłówek)
    for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        raw_code = str(row[0]).strip() if len(row) > 0 and row[0] is not None else ""
        raw_gs = row[9] if len(row) > 9 else 0  # Kolumna J to indeks 9 (premia GS)

        if not raw_code and (raw_gs is None or raw_gs == ""):
            continue

        gs_int = clean_gs_value(raw_gs)
        code_upper = raw_code.upper()

        if code_upper in MAPPINGS:
            info = MAPPINGS[code_upper]
            processed_rows.append([timestamp, info["brand"], info["model"], gs_int])
        else:
            # Nieznany kod - formularz/zapytanie o brakujące dane
            print(f"Brak mapowania w wierszu {row_idx}: Kod='{raw_code}', GS={gs_int}")
            brand = input(f"Podaj markę dla kodu '{raw_code}': ") or "Nieznana marka"
            model = input(f"Podaj model SKU dla kodu '{raw_code}': ") or "Nieznany model"
            
            if raw_code:
                MAPPINGS[code_upper] = {"brand": brand, "model": model}
                
            processed_rows.append([timestamp, brand, model, gs_int])

    print(f"\\nPrzetworzono {len(processed_rows)} wierszy.")
    print("Podgląd wygenerowanej tabeli:")
    for r in processed_rows[:5]:
        print(r)

    # Zapis do Google Sheets do zakładki "Form Responses 1":
    # import gspread
    # gc = gspread.service_account(filename='credentials.json')
    # sh = gc.open("Nazwa Twojego Arkusza").worksheet("Form Responses 1")
    # sh.append_rows(processed_rows) # dopisuje wiersze na końcu tabeli
    return processed_rows

if __name__ == "__main__":
    import sys
    file_to_run = sys.argv[1] if len(sys.argv) > 1 else "dane.xlsx"
    process_excel_file(file_to_run)
`;
}
