import React, { useState } from 'react';
import { Cloud, Check, ExternalLink, Key, FileSpreadsheet, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { GoogleSheetsConfig } from '../types';
import { appendToGoogleSheets } from '../utils/sheetsSync';

interface GoogleSheetsSettingsProps {
  config: GoogleSheetsConfig;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  onGoToCodeTab: () => void;
}

export const GoogleSheetsSettings: React.FC<GoogleSheetsSettingsProps> = ({
  config,
  onSaveConfig,
  onGoToCodeTab,
}) => {
  const [formData, setFormData] = useState<GoogleSheetsConfig>(config);
  const [isSaved, setIsSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!formData.webAppUrl || !formData.webAppUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Podaj adres URL aplikacji Google Apps Script przed rozpoczęciem testu.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Test sending 1 sample row
      const testSample = [
        {
          id: 'test-row',
          rowIndex: 1,
          code: 'TEST-CODE',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          brand: 'TEST MARKA',
          model: 'TEST MODEL',
          gs: 100,
          source: 'mapped' as const,
        },
      ];

      const res = await appendToGoogleSheets(testSample, formData);
      setTestResult({
        success: true,
        message: `Połączenie udane! Arkusz Google odebrał dane testowe (${res.message}).`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Błąd testu połączenia: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-start space-x-3">
        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
          <Cloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Integracja z Google Sheets
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Po zaakceptowaniu wygenerowanej tabeli, rekordy zostaną automatycznie dopisane jako nowe wiersze do Twojego arkusza Google.
          </p>
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="text-base font-semibold text-stone-900 border-b border-stone-100 pb-3">
          Konfiguracja adresu docelowego Google Apps Script
        </h3>

        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Ustawienia zostały zapisane w pamięci przeglądarki.</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Adres URL aplikacji internetowej Google Apps Script (Web App URL)
            </label>
            <input
              id="input-sheets-webapp-url"
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={formData.webAppUrl}
              onChange={(e) => setFormData({ ...formData, webAppUrl: e.target.value })}
              className="w-full text-sm rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-stone-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Adres otrzymany po kliknięciu <em>Wdróż &rarr; Nowe wdrożenie &rarr; Aplikacja internetowa</em> w edytorze Apps Script.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Nazwa arkusza / zakładki docelowej
              </label>
              <input
                id="input-sheet-name"
                type="text"
                placeholder="Form Responses 1"
                value={formData.sheetName}
                onChange={(e) => setFormData({ ...formData, sheetName: e.target.value })}
                className="w-full text-sm rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Domyślnie: <strong className="text-emerald-800">Form Responses 1</strong>. Nowe rekordy będą dopisywane na końcu tabelki w tej zakładce.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                ID Arkusza Google (opcjonalne)
              </label>
              <input
                id="input-spreadsheet-id"
                type="text"
                placeholder="np. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={formData.spreadsheetId}
                onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value })}
                className="w-full text-sm rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-stone-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Wymagane tylko wtedy, gdy Web App nie jest powiązany bezpośrednio z Twoim arkuszem.
              </p>
            </div>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <button
            type="button"
            id="btn-test-sheets-connection"
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Testowanie połączenia...' : 'Wyślij wiersz testowy'}</span>
          </button>

          <button
            type="submit"
            id="btn-save-sheets-config"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Zapisz konfigurację
          </button>
        </div>
      </form>

      {/* Instructions Card */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-stone-900 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
          <span>Jak w 2 minuty połączyć swój Arkusz Google?</span>
        </h3>

        <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-stone-700">
          <li>
            Otwórz swój arkusz w <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">Google Sheets</a>.
          </li>
          <li>
            W menu u góry kliknij <strong>Rozszerzenia &rarr; Apps Script</strong>.
          </li>
          <li>
            Skopiuj kod z zakładki{' '}
            <button
              type="button"
              onClick={onGoToCodeTab}
              className="text-emerald-700 font-semibold underline cursor-pointer"
            >
              "Apps Script &amp; Python"
            </button>{' '}
            i wklej go do edytora skryptów (zastępując całą zawartość).
          </li>
          <li>
            Kliknij niebieski przycisk <strong>Wdróż (Deploy) &rarr; Nowe wdrożenie</strong>:
            <ul className="list-disc pl-5 mt-1 text-stone-600 space-y-0.5">
              <li>Wybierz typ: <strong>Aplikacja internetowa (Web app)</strong>.</li>
              <li>Wykonaj jako: <strong>Ja (Twoje konto)</strong>.</li>
              <li>Kto ma dostęp: <strong>Każdy (Anyone)</strong>.</li>
            </ul>
          </li>
          <li>
            Skopiuj wygenerowany <strong>URL aplikacji internetowej</strong> i wklej go w formularzu powyżej!
          </li>
        </ol>

        <div className="pt-2 text-xs text-stone-500 border-t border-stone-200">
          💡 <strong>Wskazówka:</strong> Jeśli nie chcesz konfigurować Web App URL, w tabeli wynikowej możesz po prostu użyć przycisku <strong>"Kopiuj dla Google Sheets"</strong> — cała tabela skopiuje się do schowka, a w Twoim arkuszu Google wystarczy nacisnąć <strong>Ctrl+V</strong>!
        </div>
      </div>
    </div>
  );
};
