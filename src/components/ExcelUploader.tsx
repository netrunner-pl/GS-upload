import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, ArrowRight, Download, Info, CheckCircle2, Sliders } from 'lucide-react';
import { generateSampleExcelFile, inspectSheetColumns, SheetColumnInfo, parseIntegerGs, getColumnLetter } from '../utils/excelParser';

interface ExcelUploaderProps {
  onWorkbookLoaded: (
    workbook: XLSX.WorkBook,
    fileName: string,
    sheetName: string,
    codeColIndex?: number,
    gsColIndex?: number,
    hasHeader?: boolean,
    descColIndex?: number
  ) => void;
  isLoading?: boolean;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onWorkbookLoaded,
  isLoading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [columns, setColumns] = useState<SheetColumnInfo[]>([]);
  const [codeColIndex, setCodeColIndex] = useState<number>(0); // Default Col A (0)
  const [descColIndex, setDescColIndex] = useState<number>(3); // Default Col D (3)
  const [gsColIndex, setGsColIndex] = useState<number>(9);     // Default Col J (9)
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true);
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Obsługiwane są wyłącznie pliki Excel (.xlsx, .xls) lub CSV.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });

      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        setError('Plik nie zawiera żadnych arkuszy.');
        return;
      }

      setWorkbook(wb);
      setSelectedFile(file);
      setSheetNames(wb.SheetNames);
      const firstSheet = wb.SheetNames[0];
      setSelectedSheet(firstSheet);
      setupSheetInfo(wb, firstSheet);
    } catch (err: any) {
      console.error('Błąd odczytu pliku Excel:', err);
      setError('Nie udało się odczytać pliku Excel. Sprawdź format pliku.');
    }
  };

  const setupSheetInfo = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    // Inspect columns
    const cols = inspectSheetColumns(ws);
    setColumns(cols);

    // Read preview rows
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
    setPreviewRows(raw.slice(0, 7));

    // Determine initial selected columns:
    // Kolumna A (0) for code
    setCodeColIndex(0);

    // Kolumna D (3) for description
    let targetDesc = 3;
    const specificDescCol = cols.find(
      (c) =>
        c.header.toLowerCase().includes('opis') ||
        c.header.toLowerCase().includes('nazwa') ||
        c.header.toLowerCase().includes('towar')
    );
    if (specificDescCol) {
      targetDesc = specificDescCol.index;
    }
    setDescColIndex(targetDesc);

    // For GS: check if Col J (9) has numbers or if there is a column explicitly named "GS" or "Premia GS"
    let targetGs = 9; // Default Column J
    const specificGsCol = cols.find(
      (c) =>
        c.header.toLowerCase() === 'gs' ||
        c.header.toLowerCase().includes('premia gs') ||
        c.header.toLowerCase().startsWith('gs')
    );
    if (specificGsCol) {
      targetGs = specificGsCol.index;
    } else {
      targetGs = 9; // Col J default
    }
    setGsColIndex(targetGs);
  };

  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    if (workbook) {
      setupSheetInfo(workbook, sheetName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleProcessClick = () => {
    if (workbook && selectedFile && selectedSheet) {
      onWorkbookLoaded(
        workbook,
        selectedFile.name,
        selectedSheet,
        codeColIndex,
        gsColIndex,
        hasHeaderRow,
        descColIndex
      );
    }
  };

  const handleDownloadSample = () => {
    const bytes = generateSampleExcelFile();
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'przykladowy_raport_sprzedazy.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Inspect current chosen GS column sample values
  const selectedGsColumnInfo = columns.find((c) => c.index === gsColIndex);
  const sampleGsValues = previewRows
    .slice(hasHeaderRow ? 1 : 0, 6)
    .map((row) => {
      const val = row[gsColIndex];
      return parseIntegerGs(val);
    });
  const hasPositiveGs = sampleGsValues.some((v) => v > 0);

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-sm text-stone-700">
            <h3 className="font-semibold text-stone-900 text-base">
              Zasady przetwarzania pliku Excel
            </h3>
            <p>
              Program pobiera z pliku kluczowe kolumny i formatuje dane do zapisu w Google Sheets:
            </p>
            <ul className="list-disc pl-5 space-y-1 pt-1 text-stone-600">
              <li>
                <strong className="text-stone-900">Kolumna A (Kod):</strong> Zamieniana w pamięci aplikacji na <span className="font-medium text-emerald-800">markę produktu</span> oraz <span className="font-medium text-emerald-800">symbol SKU (model)</span>. W razie braku kodu lub mapowania pojawi się formularz do ręcznego uzupełnienia.
              </li>
              <li>
                <strong className="text-stone-900">Kolumna J (Premia GS):</strong> Odczytywana i zaokrąglana do <span className="font-medium text-emerald-800">dodatniej liczby całkowitej (int)</span>.
              </li>
              <li>
                <strong className="text-stone-900">Zapis do Google Sheets:</strong> Nowo dodane wiersze na końcu tabelki w zakładce <strong className="text-emerald-800 font-mono">Form Responses 1</strong>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div
        id="excel-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-emerald-600 bg-emerald-50/50'
            : selectedFile
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-stone-300 hover:border-stone-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              selectedFile ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {selectedFile ? (
              <FileSpreadsheet className="w-7 h-7" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          {selectedFile ? (
            <div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-base font-semibold text-stone-900">
                  {selectedFile.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Kliknij lub upuść inny plik, aby go zmienić
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-medium text-stone-900">
                Przeciągnij i upuść plik Excel tutaj
              </p>
              <p className="text-sm text-stone-500 mt-1">
                lub kliknij, aby wybrać plik (.xlsx, .xls) z dysku
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              id="btn-sample-download-inline"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSample();
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pobierz przykładowy wzorzec pliku Excel (Kolumna A + J)</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sheet selection, Column Confirmation and Preview */}
      {selectedFile && workbook && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-5 shadow-xs">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-stone-700">Arkusz źródłowy:</span>
              <select
                id="select-excel-sheet"
                value={selectedSheet}
                onChange={handleSheetChange}
                className="text-sm rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {sheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeaderRow}
                onChange={(e) => setHasHeaderRow(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-stone-300"
              />
              <span>Pierwszy wiersz to nagłówek (pomiń wiersz 1)</span>
            </label>
          </div>

          {/* Interactive Column Mapper / Verifier */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-stone-900">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Weryfikacja kolumn wejściowych (A = Kod, D = Opis, J = Premia GS)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Code Column Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Kolumna z Kodem produktu:
                </label>
                <select
                  id="select-col-code"
                  value={codeColIndex}
                  onChange={(e) => setCodeColIndex(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {columns.map((c) => (
                    <option key={c.index} value={c.index}>
                      Kolumna {c.letter} (indeks {c.index}): {c.header ? `"${c.header}"` : '(brak nazwy)'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500">
                  Domyślnie: <strong>Kolumna A</strong> (zamieniana na markę i model SKU).
                </p>
              </div>

              {/* Description Column Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Kolumna z Opisem produktu:
                </label>
                <select
                  id="select-col-desc"
                  value={descColIndex}
                  onChange={(e) => setDescColIndex(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {columns.map((c) => (
                    <option key={c.index} value={c.index}>
                      Kolumna {c.letter} (indeks {c.index}): {c.header ? `"${c.header}"` : '(brak nazwy)'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500">
                  Domyślnie: <strong>Kolumna D</strong> (wyświetlana w formularzu brakujących kodów).
                </p>
              </div>

              {/* GS Column Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Kolumna z Premią GS:
                </label>
                <select
                  id="select-col-gs"
                  value={gsColIndex}
                  onChange={(e) => setGsColIndex(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {columns.map((c) => (
                    <option key={c.index} value={c.index}>
                      Kolumna {c.letter} (indeks {c.index}): {c.header ? `"${c.header}"` : '(brak nazwy)'}
                      {c.hasNumbers ? ' ✦ zawiera liczby' : ''}
                    </option>
                  ))}
                </select>

                {/* GS Status & Sample Values Preview */}
                <div className="pt-1">
                  {hasPositiveGs ? (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>
                        Wartości GS:{' '}
                        <strong>
                          {sampleGsValues.filter((v) => v > 0).slice(0, 3).join(', ')}
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        Wiersze w Kol. {getColumnLetter(gsColIndex)} mają wartość 0 lub są puste.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table Preview snippet */}
          <div>
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Podgląd wierszy z pliku:
            </div>
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-600">
                    <th className="p-2 border-r border-stone-200 w-12 font-mono">#</th>
                    <th className="p-2 border-r border-stone-200 bg-emerald-50 text-emerald-900 font-semibold">
                      Kol. {getColumnLetter(codeColIndex)} (Kod)
                    </th>
                    <th className="p-2 border-r border-stone-200 bg-stone-50 text-stone-800 font-semibold">
                      Kol. {getColumnLetter(descColIndex)} (Opis)
                    </th>
                    <th className="p-2 border-r border-stone-200 bg-emerald-50 text-emerald-900 font-semibold">
                      Kol. {getColumnLetter(gsColIndex)} (Premia GS)
                    </th>
                    <th className="p-2 text-stone-500 font-medium">
                      Przeliczona Premia GS (całkowita)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {previewRows.map((row, rIdx) => {
                    const isHeader = hasHeaderRow && rIdx === 0;
                    const rawCode = row[codeColIndex];
                    const rawDesc = row[descColIndex];
                    const rawGs = row[gsColIndex];
                    const parsedInt = isHeader ? '-' : parseIntegerGs(rawGs);

                    return (
                      <tr
                        key={rIdx}
                        className={isHeader ? 'bg-stone-100/80 font-semibold text-stone-500' : 'hover:bg-stone-50'}
                      >
                        <td className="p-2 border-r border-stone-200 text-stone-400 font-mono">
                          {isHeader ? 'Nagłówek' : rIdx + 1}
                        </td>
                        <td className="p-2 border-r border-stone-200 font-mono font-medium text-stone-900">
                          {rawCode !== undefined && rawCode !== '' ? String(rawCode) : '(puste)'}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-stone-700 max-w-xs truncate">
                          {rawDesc !== undefined && rawDesc !== '' ? String(rawDesc) : '(brak)'}
                        </td>
                        <td className="p-2 border-r border-stone-200 font-mono text-stone-800">
                          {rawGs !== undefined && rawGs !== '' ? String(rawGs) : '(puste)'}
                        </td>
                        <td className="p-2 font-mono font-bold text-emerald-900">
                          {isHeader ? '-' : parsedInt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-process-excel"
              onClick={handleProcessClick}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span>Przetwórz plik i wygeneruj tabelę</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
