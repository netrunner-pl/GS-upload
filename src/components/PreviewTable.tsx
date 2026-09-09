import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Search,
  Trash2,
  Edit2,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Sliders,
  Check,
  Sparkles,
  RotateCcw,
  UploadCloud
} from 'lucide-react';
import { ProcessedRecord, GoogleSheetsConfig } from '../types';
import { copyToClipboardForGoogleSheets, downloadAsExcel, downloadAsCsv, appendToGoogleSheets } from '../utils/sheetsSync';

interface PreviewTableProps {
  records: ProcessedRecord[];
  onUpdateRecords: (records: ProcessedRecord[]) => void;
  onReset: () => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsSettings: () => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  records,
  onUpdateRecords,
  onReset,
  sheetsConfig,
  onOpenSheetsSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isSavingToSheets, setIsSavingToSheets] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [savedRowCount, setSavedRowCount] = useState<number>(0);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ brand: string; model: string; gs: number }>({
    brand: '',
    model: '',
    gs: 0,
  });

  // Calculate statistics
  const totalRows = records.length;
  const totalGs = records.reduce((sum, r) => sum + (r.gs || 0), 0);
  const avgGs = totalRows > 0 ? Math.round(totalGs / totalRows) : 0;
  const zeroGsCount = records.filter((r) => !r.gs || r.gs === 0).length;
  const uniqueBrands = new Set(records.map((r) => r.brand)).size;
  const targetSheetName = sheetsConfig.sheetName || 'Form Responses 1';

  // Filter records
  const filteredRecords = records.filter(
    (r) =>
      r.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.timestamp.includes(searchTerm)
  );

  const handleCopyTsv = () => {
    const success = copyToClipboardForGoogleSheets(records);
    if (success) {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  const handleStartEdit = (rec: ProcessedRecord) => {
    setEditingRowId(rec.id);
    setEditForm({ brand: rec.brand, model: rec.model, gs: rec.gs });
  };

  const handleSaveEdit = (id: string) => {
    onUpdateRecords(
      records.map((r) =>
        r.id === id
          ? {
              ...r,
              brand: editForm.brand.trim() || r.brand,
              model: editForm.model.trim() || r.model,
              gs: Math.round(editForm.gs) || 0,
            }
          : r
      )
    );
    setEditingRowId(null);
    setIsAlreadySaved(false);
  };

  const handleDeleteRow = (id: string) => {
    onUpdateRecords(records.filter((r) => r.id !== id));
    setIsAlreadySaved(false);
  };

  const handleAcceptAndSave = async () => {
    if (isAlreadySaved) return;

    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    // If no Web App URL configured, alert user and offer options
    if (!sheetsConfig.webAppUrl || !sheetsConfig.webAppUrl.trim()) {
      setSaveErrorMessage(
        'Brak skonfigurowanego adresu Web App Google Apps Script. Przejdź do zakładki "Google Sheets", aby wkleić swój URL, lub użyj opcji "Kopiuj dla Google Sheets" do natychmiastowego wklejenia wierszy (Ctrl+V).'
      );
      return;
    }

    setIsSavingToSheets(true);
    try {
      const res = await appendToGoogleSheets(records, sheetsConfig);
      setIsAlreadySaved(true);
      setSavedRowCount(res.rowsAdded);
      setSaveSuccessMessage(
        `Sukces! Zaakceptowano i dopisano ${res.rowsAdded} wierszy na końcu tabeli w zakładce "${targetSheetName}".`
      );
    } catch (err: any) {
      setSaveErrorMessage(err.message || 'Wystąpił błąd podczas wysyłania danych do Google Sheets.');
    } finally {
      setIsSavingToSheets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Tabela gotowa do akceptacji
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                Cel: Zakładka "{targetSheetName}"
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Wygenerowano: {records[0]?.timestamp || new Date().toLocaleString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1.5">
              Podgląd i akceptacja danych
            </h2>
            <p className="text-sm text-stone-600 mt-0.5">
              Sprawdź poniższą tabelę (timestamp, marka, model SKU, premia GS). Po zaakceptowaniu dane zostaną dopisane na końcu tabeli w arkuszu Google.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5">
              <span className="text-xs text-stone-500 block">Liczba wierszy</span>
              <span className="text-lg font-bold text-stone-900 font-mono">{totalRows}</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3.5 py-2.5">
              <span className="text-xs text-emerald-700 block font-medium">Suma premii GS</span>
              <span className="text-lg font-bold text-emerald-900 font-mono">{totalGs}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5">
              <span className="text-xs text-stone-500 block">Średnia GS / wiersz</span>
              <span className="text-lg font-bold text-stone-900 font-mono">{avgGs}</span>
            </div>
            {zeroGsCount > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                <span className="text-xs text-amber-700 block font-medium">Wiersze z GS = 0</span>
                <span className="text-lg font-bold text-amber-900 font-mono">{zeroGsCount}</span>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5">
                <span className="text-xs text-stone-500 block">Unikalne marki</span>
                <span className="text-lg font-bold text-stone-900 font-mono">{uniqueBrands}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save feedback banners */}
      {isAlreadySaved && (
        <div
          id="banner-save-success"
          className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-emerald-950 shadow-sm animate-in fade-in duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-emerald-950">
                    Dane zostały pomyślnie dodane do Google Sheets!
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                    Zapis zakończony
                  </span>
                </div>
                <p className="text-sm text-emerald-900/90 leading-relaxed">
                  Dopisano <strong>{savedRowCount || records.length} wierszy</strong> na końcu tabelki w zakładce{' '}
                  <strong className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-950">
                    {targetSheetName}
                  </strong>
                  . Przycisk dodawania został wyłączony, aby zapobiec przypadkowemu podwójnemu przesłaniu danych.
                </p>
                <div className="text-xs text-emerald-800 flex items-center space-x-3 pt-0.5">
                  <span>Godzina zapisu: <strong>{new Date().toLocaleTimeString()}</strong></span>
                  <span>•</span>
                  <span>Lokalizacja: <strong>Koniec tabelki w "{targetSheetName}"</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 pt-1 sm:pt-0">
              <button
                type="button"
                id="btn-upload-another-file"
                onClick={onReset}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Wgraj kolejny plik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccessMessage && !isAlreadySaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start space-x-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Zapisano pomyślnie!</strong>
            <span>{saveSuccessMessage}</span>
          </div>
        </div>
      )}

      {saveErrorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start space-x-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Wymagana konfiguracja Google Sheets:</strong>
            <p className="mt-0.5">{saveErrorMessage}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenSheetsSettings}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors"
              >
                Przejdź do konfiguracji Google Sheets
              </button>
              <button
                type="button"
                onClick={handleCopyTsv}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 transition-colors"
              >
                Kopiuj do schowka i wklej w arkuszu (Ctrl+V)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Toolbar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              id="input-search-records"
              type="text"
              placeholder="Filtruj wg marki, modelu lub kodu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-copy-tsv"
              onClick={handleCopyTsv}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-colors shadow-xs"
              title="Kopiuje całą tabelę w formacie zgodnym z Google Sheets (wystarczy wcisnąć Ctrl+V w arkuszu)"
            >
              <Copy className="w-4 h-4 text-stone-500" />
              <span>{copiedNotification ? 'Skopiowano!' : 'Kopiuj dla Google Sheets'}</span>
            </button>

            <button
              id="btn-download-excel"
              onClick={() => downloadAsExcel(records)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-colors shadow-xs"
              title="Pobierz wynik jako plik Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Pobierz .xlsx</span>
            </button>

            <button
              id="btn-download-csv"
              onClick={() => downloadAsCsv(records)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-colors shadow-xs"
              title="Pobierz wynik jako plik CSV"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>CSV</span>
            </button>

            <button
              id="btn-reset-workflow"
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs sm:text-sm font-medium transition-colors"
              title="Wgraj inny plik"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Wgraj inny plik</span>
            </button>
          </div>
        </div>

        {/* Table itself */}
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 font-mono">#</th>
                <th className="py-3 px-3">Timestamp (Data i czas)</th>
                <th className="py-3 px-3">Marka produktu</th>
                <th className="py-3 px-3">Model (symbol SKU)</th>
                <th className="py-3 px-3 text-right">Wartość GS (int)</th>
                <th className="py-3 px-3">Kod wejściowy</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right w-20">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 text-sm">
                    Brak wierszy spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => {
                  const isEditing = editingRowId === rec.id;
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        isEditing ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-xs text-stone-400">
                        {index + 1}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-xs text-stone-800 whitespace-nowrap">
                        {rec.timestamp}
                      </td>

                      {/* Brand */}
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.brand}
                            onChange={(e) =>
                              setEditForm({ ...editForm, brand: e.target.value })
                            }
                            className="text-xs px-2 py-1 rounded border border-stone-300 w-full"
                          />
                        ) : (
                          <span className="font-semibold text-stone-900">{rec.brand}</span>
                        )}
                      </td>

                      {/* Model SKU */}
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.model}
                            onChange={(e) =>
                              setEditForm({ ...editForm, model: e.target.value })
                            }
                            className="text-xs px-2 py-1 rounded border border-stone-300 w-full"
                          />
                        ) : (
                          <span className="text-stone-800">{rec.model}</span>
                        )}
                      </td>

                      {/* GS (Integer) */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.gs}
                            onChange={(e) =>
                              setEditForm({ ...editForm, gs: Number(e.target.value) })
                            }
                            className="text-xs px-2 py-1 rounded border border-stone-300 w-20 text-right"
                          />
                        ) : rec.gs === 0 ? (
                          <span
                            className="inline-flex items-center text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-semibold"
                            title="Wartość GS wynosi 0. Możesz kliknąć ikonę ołówka, aby ręcznie wpisać wartość."
                          >
                            0 (sprawdź)
                          </span>
                        ) : (
                          <span>{rec.gs}</span>
                        )}
                      </td>

                      {/* Input Code */}
                      <td className="py-2.5 px-3 font-mono text-xs text-stone-500">
                        {rec.code || <span className="text-rose-400 italic">(brak kodu)</span>}
                      </td>

                      {/* Source tag */}
                      <td className="py-2.5 px-3 text-center">
                        {rec.source === 'mapped' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Zmapowano
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Ręcznie
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(rec.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-800"
                            title="Zapisz zmiany w wierszu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(rec)}
                            className="p-1 text-stone-400 hover:text-stone-700"
                            title="Edytuj ten wiersz"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRow(rec.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                          title="Usuń ten wiersz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Primary Acceptance Bar */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-stone-500">
            {isAlreadySaved ? (
              <span className="text-emerald-700 font-medium inline-flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline shrink-0" />
                <span>Wiersze zostały pomyślnie dopisane na końcu zakładki <strong>"{targetSheetName}"</strong>. Przycisk wyłączono, aby zapobiec duplikatom.</span>
              </span>
            ) : (
              <span>Dane zostaną dodane jako nowe wiersze na końcu tabelki w zakładce <strong className="text-stone-800">"{targetSheetName}"</strong>.</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isAlreadySaved && (
              <button
                type="button"
                id="btn-bottom-upload-next"
                onClick={onReset}
                className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Wgraj kolejny plik</span>
              </button>
            )}

            <button
              id="btn-accept-and-save-sheets"
              onClick={handleAcceptAndSave}
              disabled={isSavingToSheets || isAlreadySaved || records.length === 0}
              className={`inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all ${
                isAlreadySaved
                  ? 'bg-stone-100 text-stone-500 border border-stone-300 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
              }`}
            >
              {isSavingToSheets ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Zapisywanie w Google Sheets...</span>
                </>
              ) : isAlreadySaved ? (
                <>
                  <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                  <span>Dane dodane ({records.length} wierszy) — przycisk wyłączony</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Zaakceptuj i dopisz do "{targetSheetName}" ({records.length} wierszy)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
