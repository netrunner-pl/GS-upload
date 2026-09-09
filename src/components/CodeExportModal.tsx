import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Terminal, ShieldCheck, Download, LayoutTemplate, Sparkles, ExternalLink, Globe, GitBranch } from 'lucide-react';
import { getGoogleAppsScriptTemplate, getGoogleAppsScriptHtmlTemplate, getPythonScriptTemplate } from '../utils/sheetsSync';

export const CodeExportModal: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'gas-html' | 'gas' | 'github-pages' | 'python' | 'arch'>('github-pages');
  const [copied, setCopied] = useState<string | null>(null);

  const gasCode = getGoogleAppsScriptTemplate();
  const gasHtmlCode = getGoogleAppsScriptHtmlTemplate();
  const pythonCode = getPythonScriptTemplate();

  const ghActionsWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build Vite application
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-stone-900">
                Kod źródłowy dla Google Apps Script &amp; Python
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                Brak LLM / 100% Deterministyczny
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-0.5">
              Kompletny kod frontendowy (<code>index.html</code>) oraz backendowy (<code>Code.gs</code>) do uruchomienia w Google Apps Script w Twoim arkuszu.
            </p>
          </div>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex flex-wrap border-b border-stone-200 bg-stone-50 px-4 pt-3 gap-1">
          <button
            onClick={() => setActiveCodeTab('github-pages')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors border-t border-x ${
              activeCodeTab === 'github-pages'
                ? 'bg-white border-stone-200 text-emerald-800 border-b-transparent -mb-px shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>GitHub Pages (Wdrożenie)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Gotowe</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('gas-html')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors border-t border-x ${
              activeCodeTab === 'gas-html'
                ? 'bg-white border-stone-200 text-emerald-800 border-b-transparent -mb-px shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-emerald-600" />
            <span>index.html (Interfejs HTML/JS dla Apps Script)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('gas')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors border-t border-x ${
              activeCodeTab === 'gas'
                ? 'bg-white border-stone-200 text-emerald-800 border-b-transparent -mb-px shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Code.gs (Skrypt Google Apps Script)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('python')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors border-t border-x ${
              activeCodeTab === 'python'
                ? 'bg-white border-stone-200 text-emerald-800 border-b-transparent -mb-px shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Python (openpyxl)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('arch')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors border-t border-x ${
              activeCodeTab === 'arch'
                ? 'bg-white border-stone-200 text-emerald-800 border-b-transparent -mb-px shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zasada działania (Bez LLM)</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="p-5">
          {/* TAB: GitHub Pages */}
          {activeCodeTab === 'github-pages' && (
            <div className="space-y-5">
              {/* Introduction & Readiness card */}
              <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-2xl p-4 sm:p-5 text-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Globe className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-base">
                        Aplikacja jest w 100% gotowa do działania na GitHub Pages!
                      </h3>
                      <p className="text-xs text-emerald-900 mt-0.5">
                        Wprowadziliśmy wszystkie wymagane ustawienia dla statycznego hostingu GitHub Pages.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300 shrink-0">
                    Konfiguracja aktywna
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                    <strong className="text-stone-900 flex items-center space-x-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Relatywne ścieżki (base: './')</span>
                    </strong>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      W <code>vite.config.ts</code> ustawiono <code>base: './'</code>, dzięki czemu pliki JS, CSS i grafiki ładują się bezbłędnie pod adresem <code>https://username.github.io/repo-name/</code>.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                    <strong className="text-stone-900 flex items-center space-x-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>GitHub Actions Workflow</span>
                    </strong>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Utworzono plik <code>.github/workflows/deploy.yml</code>. Każdy <code>git push</code> do gałęzi <code>main</code> automatycznie buduje i publikuje aplikację.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                    <strong className="text-stone-900 flex items-center space-x-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Plik 404.html &amp; Standalone</span>
                    </strong>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Dodano <code>public/404.html</code> do obsługi przekierowań oraz samodzielny <code>gs-form-updater.html</code> dostępny bezpośrednio w sieci.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-step instructions on GitHub */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                  <GitBranch className="w-4 h-4 text-emerald-600" />
                  <span>Jak włączyć GitHub Pages w swoim repozytorium GitHub (2 minuty):</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-[11px]">1</span>
                      <strong className="text-stone-900 text-xs">Wejdź w Ustawienia repozytorium</strong>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      W serwisie GitHub przejdź do swojego repozytorium i kliknij zakładkę <strong>Settings</strong> (Ustawienia) u góry.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-[11px]">2</span>
                      <strong className="text-stone-900 text-xs">Wybierz zakładkę Pages</strong>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      W lewym menu bocznym kliknij <strong>Pages</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px]">3</span>
                      <strong className="text-stone-900 text-xs">Ustaw źródło: GitHub Actions</strong>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      W sekcji <strong>Build and deployment &gt; Source</strong> wybierz z listy: <strong>GitHub Actions</strong>.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mt-2 text-stone-700">
                  <p className="font-semibold text-amber-900">Co się stanie po włączeniu?</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    GitHub Actions natychmiast uruchomi proces budowania i w ciągu ok. 60 sekund Twoja aplikacja będzie publicznie dostępna pod adresem: <code>https://&lt;twoj-login&gt;.github.io/&lt;nazwa-repo&gt;/</code>.
                  </p>
                </div>
              </div>

              {/* Alternative CLI deploy option */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-stone-900">
                    Opcja alternatywna: Ręczne wdrożenie przez terminal (npm run deploy)
                  </h4>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200 font-mono">
                    pakiet: gh-pages
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Jeśli wolisz wdrażać bezpośrednio z wiersza poleceń ze swojego komputera:
                </p>
                <div className="p-3 bg-stone-900 text-stone-100 rounded-xl font-mono text-xs flex items-center justify-between">
                  <code>npm run deploy</code>
                  <button
                    onClick={() => handleCopy('npm run deploy', 'cli-deploy')}
                    className="text-stone-300 hover:text-white text-[11px] font-sans px-2 py-1 bg-stone-800 rounded border border-stone-700"
                  >
                    {copied === 'cli-deploy' ? 'Skopiowano!' : 'Kopiuj'}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Polecenie automatycznie uruchomi <code>npm run build</code> i wyśle zawartość folderu <code>dist/</code> do gałęzi <code>gh-pages</code>. Wtedy w <em>Settings &gt; Pages</em> wybierz <em>Deploy from a branch &gt; gh-pages</em>.
                </p>
              </div>

              {/* Workflow file viewer */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Zawartość pliku workflow: .github/workflows/deploy.yml
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Plik został już zapisany w Twoim projekcie. Poniżej podgląd:
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(ghActionsWorkflow, 'workflow')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    {copied === 'workflow' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Skopiowano workflow!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopiuj kod workflow</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto max-h-[360px] leading-relaxed select-all">
                    <code>{ghActionsWorkflow}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: index.html for Google Apps Script */}
          {activeCodeTab === 'gas-html' && (
            <div className="space-y-4">
              {/* Step-by-step instruction */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs text-stone-700">
                <div className="flex items-center space-x-2 font-bold text-emerald-950 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Instrukcja: Jak dodać plik index.html w Google Apps Script</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">1</span>
                    <p className="font-semibold text-stone-900">Dodaj plik HTML</p>
                    <p className="text-stone-500 text-[11px]">W edytorze Apps Script obok napisu <strong>Pliki</strong> kliknij <strong>+</strong> i wybierz <strong>HTML</strong>.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">2</span>
                    <p className="font-semibold text-stone-900">Nazwij go "index"</p>
                    <p className="text-stone-500 text-[11px]">Wpisz nazwę <strong>index</strong> (Apps Script sam nada rozszerzenie <code>.html</code>).</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">3</span>
                    <p className="font-semibold text-stone-900">Wklej poniższy kod</p>
                    <p className="text-stone-500 text-[11px]">Kliknij przycisk <em>"Kopiuj kod index.html"</em> i wklej w edytorze (Ctrl+V), zastępując domyślną treść.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">4</span>
                    <p className="font-semibold text-stone-900">Zapisz projekt</p>
                    <p className="text-stone-500 text-[11px]">Wciśnij <strong>Ctrl+S</strong>. Uruchamiaj przez Web App lub menu w Google Sheets!</p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    Plik: index.html (Samodzielny frontend dla Google Apps Script)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Zawiera obsługę wgrywania Excela, mapowania kodów, podgląd Kolumny D (Opis) oraz zapis do "Form Responses 1".
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id="btn-copy-gas-html"
                    onClick={() => handleCopy(gasHtmlCode, 'gas-html')}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    {copied === 'gas-html' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Skopiowano kod index.html!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Kopiuj kod index.html</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-download-gas-html"
                    onClick={() => handleDownloadFile(gasHtmlCode, 'index.html')}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz index.html</span>
                  </button>

                  <a
                    id="btn-open-standalone-html"
                    href="./gs-form-updater.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Uruchom plik HTML w nowej karcie</span>
                  </a>
                </div>
              </div>

              {/* Code display block */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
                  <code>{gasHtmlCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: Code.gs */}
          {activeCodeTab === 'gas' && (
            <div className="space-y-4">
              {/* Quick Instruction Banner */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs text-stone-700">
                <div className="flex items-center space-x-2 font-bold text-emerald-950 text-sm">
                  <span>Jak uruchomić plik Code.gs w Google Apps Script:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">1</span>
                    <p className="font-semibold text-stone-900">Otwórz Apps Script</p>
                    <p className="text-stone-500 text-[11px]">W swoim Arkuszu Google kliknij: <em>Rozszerzenia &rarr; Apps Script</em>.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">2</span>
                    <p className="font-semibold text-stone-900">Wklej plik Code.gs</p>
                    <p className="text-stone-500 text-[11px]">Wklej poniższy skrypt w pliku <code>Kod.gs</code> (lub <code>Code.gs</code>) i zapisz.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">3</span>
                    <p className="font-semibold text-stone-900">Wdróż aplikację</p>
                    <p className="text-stone-500 text-[11px]">Kliknij <strong>Wdróż &rarr; Nowe wdrożenie</strong>. Typ: <em>Aplikacja internetowa</em>, Dostęp: <em>Każdy</em>.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">4</span>
                    <p className="font-semibold text-stone-900">Gotowe!</p>
                    <p className="text-stone-500 text-[11px]">W arkuszu pojawi się menu <strong>⚙️ GS Form Updater</strong> do otwierania aplikacji!</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    Plik: Code.gs (Obsługa zapisu w zakładce "Form Responses 1" i menu arkusza)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Zawiera funkcje <code>doGet</code>, <code>doPost</code>, <code>saveRecordsToSheets</code> oraz menu <code>onOpen</code>.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id="btn-copy-code-gs"
                    onClick={() => handleCopy(gasCode, 'gas')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs"
                  >
                    {copied === 'gas' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Skopiowano kod!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopiuj kod</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadFile(gasCode, 'Code.gs')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pobierz .gs</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
                  <code>{gasCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Python */}
          {activeCodeTab === 'python' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    Skrypt Python: Przetwarzanie pliku Excel na dysku
                  </h4>
                  <p className="text-xs text-stone-500">
                    Uruchamiaj lokalnie: <code>python process_excel.py plik.xlsx</code>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(pythonCode, 'python')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs"
                  >
                    {copied === 'python' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Skopiowano kod!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopiuj kod</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadFile(pythonCode, 'process_excel.py')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pobierz .py</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
                  <code>{pythonCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Architecture */}
          {activeCodeTab === 'arch' && (
            <div className="space-y-4 text-sm text-stone-700 max-w-3xl">
              <h4 className="text-base font-bold text-stone-900">
                Gwarancja deterministycznego działania (Zero LLM / Zero API Hallucinations)
              </h4>

              <p>
                Aplikacja została zaprojektowana zgodnie z Twoimi ścisłymi wytycznymi:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                  <div className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    1. Czyste przetwarzanie pliku
                  </div>
                  <p className="text-xs text-stone-600">
                    Odczyt Kolumny A (indeks 0), Kolumny D (indeks 3 - Opis) oraz Kolumny J (indeks 9 - Premia GS) odbywa się za pomocą standardowych parserów tabelarycznych (SheetJS w przeglądarce, <code>openpyxl</code> w Pythonie, <code>SpreadsheetApp</code> w Google Apps Script).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                  <div className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    2. Słownik mapowań w pamięci
                  </div>
                  <p className="text-xs text-stone-600">
                    Zamiana kodu na markę i model SKU opiera się na lokalnej tabeli hash (słowniku). Brak zapytań do zewnętrznych modeli językowych zapewnia 100% precyzji, błyskawiczny czas reakcji i brak kosztów tokenów API.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                  <div className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    3. Obsługa braków przez człowieka z opisem z Kolumny D
                  </div>
                  <p className="text-xs text-stone-600">
                    W przypadku nieznanego kodu natychmiast pojawia się formularz wprowadzania danych przez użytkownika. Wyświetlany jest oryginalny opis z Kolumny D ułatwiający rozpoznanie urządzenia.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                  <div className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    4. Bezpośredni zapis na końcu "Form Responses 1"
                  </div>
                  <p className="text-xs text-stone-600">
                    Po zaakceptowaniu tabela przesyłana jest bezpośrednio do arkusza Google Sheets jako nowe wiersze dopisane na samym końcu z polami: <code>timestamp</code>, <code>marka</code>, <code>model</code>, <code>gs</code>. Przycisk jest blokowany po zapisie, by zapobiec duplikatom.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
