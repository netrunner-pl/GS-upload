// Single-file HTML template dla Google Apps Script i bezpośredniego otwierania w przeglądarce
// 100% czysty JavaScript (Vanilla JS), biblioteki CDN (Tailwind, SheetJS), bez Node.js/Vite/npm i bez import/export

export const STANDALONE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GS Form Updater - Single-File HTML</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- SheetJS (xlsx) CDN: bezpośredni odczyt i zapis plików Excel bez bibliotek Node.js -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .fade-in { animation: fadeIn 0.2s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-stone-100 text-stone-900 min-h-screen p-3 sm:p-6">
  <div class="max-w-6xl mx-auto space-y-5">
    
    <!-- NAGŁÓWEK APLIKACJI -->
    <header class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center space-x-3.5">
        <div class="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
          GS
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-bold text-stone-900">GS Form Updater</h1>
            <span class="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Single-File HTML
            </span>
            <span id="envBadge" class="text-[11px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
              Tryb: Przeglądarka (Standalone)
            </span>
          </div>
          <p class="text-xs text-stone-500 mt-0.5">
            Wczytywanie Excela &rarr; Kolumna A (Kod), D (Opis), J (Premia GS) &rarr; Zapis na końcu "Form Responses 1"
          </p>
        </div>
      </div>
      
      <!-- Pasek narzędzi w nagłówku -->
      <div class="flex flex-wrap items-center gap-2">
        <button id="btnOpenDictionary" type="button" class="text-xs px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold transition-colors flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span>Słownik mapowań</span>
        </button>
        <button id="btnSampleDownload" type="button" class="text-xs px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold transition-colors flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Pobierz wzorzec Excel</span>
        </button>
        <button id="btnWebhookConfig" type="button" class="text-xs px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold transition-colors flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Webhook Apps Script</span>
        </button>
      </div>
    </header>

    <!-- KROK 1: WGRYWANIE PLIKU EXCEL -->
    <section id="uploadSection" class="space-y-4">
      <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div>
          <h2 class="text-base font-bold text-stone-900">1. Wgraj plik sprzedażowy Excel</h2>
          <p class="text-xs text-stone-500 mt-0.5">Obsługiwane formaty: .xlsx, .xls, .csv. Wszystko przetwarzane jest w 100% lokalnie w przeglądarce.</p>
        </div>

        <!-- Dropzone -->
        <div id="dropZone" class="border-2 border-dashed border-stone-300 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50/20 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all">
          <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" class="hidden" />
          <div class="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          <p class="text-base font-semibold text-stone-800">Przeciągnij i upuść plik Excel tutaj</p>
          <p class="text-xs text-stone-500 mt-1">lub kliknij, aby wybrać plik (.xlsx, .xls) z dysku komputera</p>
          <span class="inline-block mt-3 text-[11px] font-medium bg-stone-200/80 text-stone-700 px-3 py-1 rounded-full">
            Działa offline &bull; Bez instalowania Node/Vite/npm
          </span>
        </div>

        <!-- Sekcja konfiguracji kolumn (po wybraniu pliku) -->
        <div id="columnConfigCard" class="hidden bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-stone-800">Weryfikacja kolumn wejściowych z pliku:</span>
            <span id="fileNameLabel" class="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded"></span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Kolumna Kod -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-stone-700">Kolumna z Kodem produktu:</label>
              <select id="selectColCode" class="w-full text-xs rounded-lg border border-stone-300 bg-white p-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></select>
              <p class="text-[11px] text-stone-500">Domyślnie: <strong>Kolumna A</strong> (indeks 0).</p>
            </div>

            <!-- Kolumna Opis -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-stone-700">Kolumna z Opisem produktu:</label>
              <select id="selectColDesc" class="w-full text-xs rounded-lg border border-stone-300 bg-white p-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></select>
              <p class="text-[11px] text-stone-500">Domyślnie: <strong>Kolumna D</strong> (indeks 3).</p>
            </div>

            <!-- Kolumna GS -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-stone-700">Kolumna z Premią GS:</label>
              <select id="selectColGs" class="w-full text-xs rounded-lg border border-stone-300 bg-white p-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></select>
              <p class="text-[11px] text-stone-500">Domyślnie: <strong>Kolumna J</strong> (indeks 9).</p>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button id="btnProceedProcessing" type="button" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors">
              Przetwórz wiersze i wygeneruj tabelę &rarr;
            </button>
          </div>
        </div>

        <!-- Informacja o strukturze -->
        <div class="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs space-y-2 text-stone-700">
          <p class="font-bold text-stone-900">Zasada działania:</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-stone-600">
            <div class="bg-white p-3 rounded-lg border border-stone-200">
              <strong class="text-stone-900">Kolumna A (Kod):</strong>
              <p class="text-[11px] mt-0.5">Służy do odpytania bazy mapowań o markę i model (symbol SKU).</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-stone-200">
              <strong class="text-amber-900">Kolumna D (Opis):</strong>
              <p class="text-[11px] mt-0.5">Wyświetlana przy braku kodu lub nieznanym kodzie, by natychmiast rozpoznać urządzenie.</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-stone-200">
              <strong class="text-emerald-900">Kolumna J (Premia GS):</strong>
              <p class="text-[11px] mt-0.5">Odczytywana i zaokrąglana do liczby całkowitej (int), usuwane symbole walut.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL: UZUPEŁNIANIE BRAKUJĄCYCH KODÓW (Z WYŚWIETLENIEM KOLUMNY D) -->
    <div id="unmappedModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 fade-in">
        <div class="px-6 py-4 border-b border-stone-200 bg-amber-50/80 rounded-t-2xl">
          <div class="flex items-center space-x-2">
            <span class="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">!</span>
            <h3 class="text-base font-bold text-stone-900">Wymagane uzupełnienie danych produktów</h3>
          </div>
          <p class="text-xs text-stone-600 mt-1">
            Wykryto kody, których nie ma w słowniku mapowań. Poniżej wyświetlony jest oryginalny opis z <strong>Kolumny D</strong> pliku wejściowego.
          </p>
        </div>
        
        <div id="unmappedList" class="p-6 overflow-y-auto space-y-4 flex-1">
          <!-- Elementy wstrzykiwane w JS -->
        </div>

        <div class="px-6 py-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex flex-wrap justify-between items-center gap-3">
          <button id="btnCancelUnmapped" type="button" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold">
            Anuluj i wgraj inny plik
          </button>
          <button id="btnApplyUnmapped" type="button" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs">
            Zatwierdź i wygeneruj tabelę
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: SŁOWNIK MAPOWAŃ PRODUKTÓW -->
    <div id="dictionaryModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 fade-in">
        <div class="px-6 py-4 border-b border-stone-200 bg-stone-50 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-stone-900">Baza mapowań kodów produktów</h3>
            <p class="text-xs text-stone-500">Kody dopasowywane są automatycznie podczas wczytywania Excela.</p>
          </div>
          <button id="btnCloseDictionary" class="text-stone-400 hover:text-stone-700 text-xl font-bold px-2">&times;</button>
        </div>

        <!-- Formularz dodawania nowego mapowania -->
        <div class="p-4 border-b border-stone-200 bg-stone-50/50">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" id="dictInputCode" placeholder="Kod (np. SAM-S25-128)" class="text-xs p-2 rounded-lg border border-stone-300 uppercase font-mono" />
            <input type="text" id="dictInputBrand" placeholder="Marka (np. Samsung)" class="text-xs p-2 rounded-lg border border-stone-300" />
            <input type="text" id="dictInputModel" placeholder="Model (np. Galaxy S25)" class="text-xs p-2 rounded-lg border border-stone-300" />
          </div>
          <button id="btnAddDictEntry" type="button" class="mt-2 text-xs px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            + Dodaj mapowanie
          </button>
        </div>

        <!-- Lista mapowań -->
        <div id="dictionaryList" class="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
          <!-- Wstrzykiwane w JS -->
        </div>

        <div class="px-6 py-3 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex justify-between items-center text-xs">
          <button id="btnResetDictDefault" type="button" class="text-rose-600 hover:underline">
            Przywróć domyślne mapowania
          </button>
          <span id="dictCountBadge" class="text-stone-500 font-mono"></span>
        </div>
      </div>
    </div>

    <!-- MODAL: USTAWIENIA WEBHOOKA (DLA TRYBU STANDALONE) -->
    <div id="webhookModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 fade-in">
        <h3 class="text-base font-bold text-stone-900">Ustawienia adresu Webhooka Google Apps Script</h3>
        <p class="text-xs text-stone-600">
          Jeśli otwierasz ten plik HTML bezpośrednio w przeglądarce (poza Google Sheets), możesz wkleić URL swojej wdrożonej aplikacji internetowej Apps Script (kończący się na <code>/exec</code>), aby przesyłać dane jednym kliknięciem:
        </p>
        <div>
          <label class="block text-xs font-semibold text-stone-700 mb-1">Apps Script Web App URL:</label>
          <input type="url" id="webhookUrlInput" placeholder="https://script.google.com/macros/s/.../exec" class="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300" />
        </div>
        <div class="flex justify-end space-x-2 pt-2">
          <button id="btnCancelWebhook" type="button" class="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50">Anuluj</button>
          <button id="btnSaveWebhook" type="button" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">Zapisz URL</button>
        </div>
      </div>
    </div>

    <!-- KROK 2: WIDOK WYNIKOWY (TABELA I ZAPIS) -->
    <section id="resultsSection" class="hidden space-y-5">
      
      <!-- BANER SUKCESU PO ZAPISIE -->
      <div id="successBanner" class="hidden p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-emerald-950 shadow-xs fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-base sm:text-lg font-bold text-emerald-950">Dane zostały pomyślnie zapisane w Google Sheets!</span>
              <span class="text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Zapis zakończony</span>
            </div>
            <p id="successDetails" class="text-xs text-emerald-900 mt-1"></p>
          </div>
          <button id="btnUploadNext" type="button" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0">
            Wgraj kolejny plik
          </button>
        </div>
      </div>

      <!-- KARTY PODSUMOWANIA (KPI) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span class="text-xs text-stone-500 font-medium">Liczba wierszy do dodania</span>
          <p id="statCount" class="text-2xl font-bold text-stone-900 mt-1">0</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span class="text-xs text-stone-500 font-medium">Suma premii GS</span>
          <p id="statTotalGs" class="text-2xl font-bold text-emerald-700 mt-1">0</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span class="text-xs text-stone-500 font-medium">Średnia premia GS</span>
          <p id="statAvgGs" class="text-2xl font-bold text-stone-800 mt-1">0</p>
        </div>
      </div>

      <!-- TABELA I PASEK AKCJI -->
      <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-stone-900">Wygenerowana tabela (gotowa do arkusza)</h2>
            <p class="text-xs text-stone-500">Format kolumn: timestamp | marka | model | gs</p>
          </div>
          
          <div class="flex flex-wrap items-center gap-2">
            <input type="text" id="tableFilterInput" placeholder="Filtruj tabelę..." class="text-xs px-3 py-1.5 rounded-xl border border-stone-300 w-44" />
            <button id="btnCopyTsv" type="button" class="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center space-x-1">
              <svg class="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              <span>Kopiuj TSV (Ctrl+V)</span>
            </button>
            <button id="btnDownloadCsv" type="button" class="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700">
              CSV
            </button>
            <button id="btnDownloadXlsx" type="button" class="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700">
              Excel (.xlsx)
            </button>
            <button id="btnResetTable" type="button" class="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700">
              Zmień plik
            </button>
          </div>
        </div>

        <!-- Tabela wynikowa -->
        <div class="overflow-x-auto border border-stone-200 rounded-xl max-h-[500px]">
          <table class="w-full text-left text-xs">
            <thead class="sticky top-0 bg-stone-100 z-10 border-b border-stone-200">
              <tr class="text-stone-700 font-semibold uppercase tracking-wider">
                <th class="py-2.5 px-3 w-10">#</th>
                <th class="py-2.5 px-3">timestamp</th>
                <th class="py-2.5 px-3">marka</th>
                <th class="py-2.5 px-3">model</th>
                <th class="py-2.5 px-3 text-right">gs</th>
                <th class="py-2.5 px-3">kod &amp; opis (Kolumna D)</th>
                <th class="py-2.5 px-3 text-center w-16">usuń</th>
              </tr>
            </thead>
            <tbody id="tableBody" class="divide-y divide-stone-200 bg-white">
              <!-- Wiersze generowane w JS -->
            </tbody>
          </table>
        </div>

        <!-- Pasek zapisu do arkusza Google Sheets -->
        <div class="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div id="saveStatusInfo" class="text-xs text-stone-500">
            Wiersze zostaną dopisane na samym końcu zakładki <strong>"Form Responses 1"</strong>.
          </div>
          <button id="btnSaveToSheets" type="button" class="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center space-x-2">
            <span>Zaakceptuj i dopisz do "Form Responses 1"</span>
          </button>
        </div>
      </div>
    </section>

  </div>

  <!-- 100% CZYSTY JAVASCRIPT (VANILLA JS) BEZ NODE/VITE/NPM I BEZ IMPORT/EXPORT -->
  <script>
    (function() {
      // Domyślna baza mapowań kodów produktów
      var DEFAULT_MAPPINGS = {
        'SAM-S24-128': { brand: 'Samsung', model: 'Galaxy S24 128GB' },
        'SAM-S24U-256': { brand: 'Samsung', model: 'Galaxy S24 Ultra 256GB' },
        'APL-IP16P-256': { brand: 'Apple', model: 'iPhone 16 Pro 256GB' },
        'XIA-RN13-8': { brand: 'Xiaomi', model: 'Redmi Note 13 8GB' },
        'SNY-WH1000-B': { brand: 'Sony', model: 'WH-1000XM5 Black' },
        'MOT-E50P-512': { brand: 'Motorola', model: 'Edge 50 Pro 512GB' }
      };

      var knownBrands = ['Samsung', 'Apple', 'Xiaomi', 'Sony', 'Asus', 'Lenovo', 'Motorola', 'LG', 'Huawei', 'Philips'];

      // Stan aplikacji
      var currentWorkbook = null;
      var rawParsedRows = [];
      var detectedColumns = [];
      var currentRecords = [];
      var pendingUnmapped = [];
      var isSaved = false;

      // Sprawdź czy działamy w Google Apps Script
      var isAppsScriptEnv = typeof google !== 'undefined' && google.script && google.script.run;
      var envBadge = document.getElementById('envBadge');
      if (isAppsScriptEnv) {
        envBadge.textContent = 'Tryb: Google Apps Script';
        envBadge.className = 'text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200';
      }

      // Zarządzanie słownikiem mapowań
      function getMappings() {
        try {
          var saved = localStorage.getItem('GS_PRODUCT_MAPPINGS');
          if (saved) return Object.assign({}, DEFAULT_MAPPINGS, JSON.parse(saved));
        } catch(e) {}
        return DEFAULT_MAPPINGS;
      }

      function saveMappings(newMap) {
        try {
          localStorage.setItem('GS_PRODUCT_MAPPINGS', JSON.stringify(newMap));
        } catch(e) {}
        if (isAppsScriptEnv) {
          try {
            google.script.run.saveStoredMappings(newMap);
          } catch(e) {}
        }
      }

      // Narzędzia: formatowanie daty i parsowanie GS (int)
      function formatTimestamp() {
        var d = new Date();
        var pad = function(n) { return n < 10 ? '0' + n : n; };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
               pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      }

      function parseGsInteger(val) {
        if (val === null || val === undefined || val === '') return 0;
        if (typeof val === 'number') return Math.abs(Math.round(val));
        var str = String(val).replace(/zł|pln|eur|usd|\\$|€/gi, '').trim().replace(/\\s+/g, '');
        if (str.includes('.') && str.includes(',')) str = str.replace(/\\./g, '').replace(',', '.');
        else if (str.includes(',')) str = str.replace(',', '.');
        var match = str.match(/[-+]?\\d+(\\.\\d+)?/);
        return match ? Math.abs(Math.round(parseFloat(match[0]))) : 0;
      }

      function getColLetter(index) {
        return String.fromCharCode(65 + (index % 26));
      }

      // Obsługa drag & drop i wyboru pliku
      var dropZone = document.getElementById('dropZone');
      var fileInput = document.getElementById('fileInput');

      dropZone.addEventListener('click', function() { fileInput.click(); });
      dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('border-emerald-500', 'bg-emerald-50/40');
      });
      dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('border-emerald-500', 'bg-emerald-50/40');
      });
      dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('border-emerald-500', 'bg-emerald-50/40');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          loadFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
          loadFile(e.target.files[0]);
        }
      });

      // Wczytanie pliku Excel za pomocą SheetJS
      function loadFile(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
          try {
            var data = new Uint8Array(e.target.result);
            var wb = XLSX.read(data, { type: 'array' });
            currentWorkbook = wb;

            var firstSheet = wb.SheetNames[0];
            var ws = wb.Sheets[firstSheet];
            rawParsedRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

            if (!rawParsedRows || rawParsedRows.length === 0) {
              alert('Plik jest pusty lub nie zawiera arkuszy z danymi.');
              return;
            }

            document.getElementById('fileNameLabel').textContent = file.name;
            setupColumnSelectors();
          } catch(err) {
            alert('Błąd odczytu pliku Excel: ' + err.message);
          }
        };
        reader.readAsArrayBuffer(file);
      }

      // Przygotowanie selektorów kolumn (A = Kod, D = Opis, J = Premia GS)
      function setupColumnSelectors() {
        var headerRow = rawParsedRows[0] || [];
        var maxCols = Math.max(headerRow.length, 12);
        detectedColumns = [];

        var selCode = document.getElementById('selectColCode');
        var selDesc = document.getElementById('selectColDesc');
        var selGs = document.getElementById('selectColGs');

        selCode.innerHTML = '';
        selDesc.innerHTML = '';
        selGs.innerHTML = '';

        for (var i = 0; i < maxCols; i++) {
          var letter = getColLetter(i);
          var headerName = headerRow[i] ? String(headerRow[i]).trim() : '';
          var label = 'Kolumna ' + letter + (headerName ? ' ("' + headerName + '")' : '');
          detectedColumns.push({ index: i, letter: letter, name: headerName });

          selCode.innerHTML += '<option value="' + i + '">' + label + '</option>';
          selDesc.innerHTML += '<option value="' + i + '">' + label + '</option>';
          selGs.innerHTML += '<option value="' + i + '">' + label + '</option>';
        }

        // Ustawienia domyślne: Kolumna A (0), Kolumna D (3), Kolumna J (9)
        selCode.value = "0";

        // Jeśli w nagłówku jest "opis", ustaw odpowiednio
        var descIdx = 3;
        for (var d = 0; d < headerRow.length; d++) {
          var h = String(headerRow[d] || '').toLowerCase();
          if (h.includes('opis') || h.includes('nazwa') || h.includes('towar')) {
            descIdx = d;
            break;
          }
        }
        selDesc.value = String(descIdx);

        // Jeśli w nagłówku jest "gs" lub "premia", ustaw odpowiednio
        var gsIdx = 9;
        for (var g = 0; g < headerRow.length; g++) {
          var gh = String(headerRow[g] || '').toLowerCase();
          if (gh === 'gs' || gh.includes('premia gs') || gh.includes('premia')) {
            gsIdx = g;
            break;
          }
        }
        selGs.value = String(gsIdx);

        document.getElementById('columnConfigCard').classList.remove('hidden');
      }

      document.getElementById('btnProceedProcessing').addEventListener('click', function() {
        var codeCol = parseInt(document.getElementById('selectColCode').value, 10);
        var descCol = parseInt(document.getElementById('selectColDesc').value, 10);
        var gsCol = parseInt(document.getElementById('selectColGs').value, 10);

        processRows(codeCol, descCol, gsCol);
      });

      // Przetwarzanie wierszy i mapowanie kodów
      function processRows(codeCol, descCol, gsCol) {
        var mappings = getMappings();
        var startRow = 1; // pomijamy nagłówek
        var records = [];
        var unmappedMap = {};
        var now = formatTimestamp();

        for (var r = startRow; r < rawParsedRows.length; r++) {
          var row = rawParsedRows[r];
          if (!row || row.length === 0) continue;

          var rawCode = row[codeCol] ? String(row[codeCol]).trim() : '';
          var rawDesc = row[descCol] ? String(row[descCol]).trim() : '';
          var rawGs = row[gsCol];

          if (!rawCode && !rawGs && !rawDesc) continue;

          var parsedGs = parseGsInteger(rawGs);
          var normCode = rawCode.toUpperCase();
          var mapped = mappings[normCode];

          if (mapped) {
            records.push({
              timestamp: now,
              brand: mapped.brand,
              model: mapped.model,
              gs: parsedGs,
              code: rawCode,
              description: rawDesc
            });
          } else {
            var key = normCode || '__ROW_' + (r + 1) + '__';
            if (!unmappedMap[key]) {
              unmappedMap[key] = {
                key: key,
                code: rawCode,
                description: rawDesc, // Opis z Kolumny D!
                sampleGs: parsedGs,
                rows: [r + 1],
                brand: '',
                model: ''
              };
            } else {
              unmappedMap[key].rows.push(r + 1);
              if (!unmappedMap[key].description && rawDesc) {
                unmappedMap[key].description = rawDesc;
              }
            }

            records.push({
              timestamp: now,
              brand: '',
              model: '',
              gs: parsedGs,
              code: rawCode,
              description: rawDesc,
              unmappedKey: key
            });
          }
        }

        currentRecords = records;
        pendingUnmapped = Object.values(unmappedMap);

        if (pendingUnmapped.length > 0) {
          showUnmappedModal();
        } else {
          renderTable();
        }
      }

      // Modal brakujących kodów (Z opisem z Kolumny D!)
      function showUnmappedModal() {
        var modal = document.getElementById('unmappedModal');
        var list = document.getElementById('unmappedList');
        list.innerHTML = '';

        pendingUnmapped.forEach(function(item, idx) {
          var detectedBrand = '';
          if (item.description) {
            var dLower = item.description.toLowerCase();
            for (var b = 0; b < knownBrands.length; b++) {
              if (dLower.includes(knownBrands[b].toLowerCase())) {
                detectedBrand = knownBrands[b];
                break;
              }
            }
          }
          item.brand = item.brand || detectedBrand;

          var card = document.createElement('div');
          card.className = 'border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-3';

          var descHtml = item.description 
            ? '<span class="text-stone-900 font-semibold">' + escapeHtml(item.description) + '</span>'
            : '<span class="italic text-stone-400 font-normal">(Brak opisu w kolumnie D w pliku dla tego wiersza)</span>';

          var quickBrandButtons = knownBrands.slice(0, 7).map(function(brandName) {
            return '<button type="button" class="btnBrandPick px-2 py-0.5 rounded bg-white border border-stone-200 hover:border-emerald-500 text-[11px] text-stone-700 hover:text-emerald-800">' + brandName + '</button>';
          }).join(' ');

          card.innerHTML = 
            '<div class="flex items-center justify-between border-b border-stone-200 pb-2 text-xs">' +
              '<div class="flex items-center space-x-2">' +
                '<span class="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-[11px]">' + (idx + 1) + '</span>' +
                '<span class="font-mono font-bold text-stone-900">Kod: ' + (item.code ? escapeHtml(item.code) : '<span class="text-rose-600">Brak kodu w wierszu</span>') + '</span>' +
              '</div>' +
              '<span class="text-stone-500 font-mono text-[11px]">Wiersze w pliku: ' + item.rows.join(', ') + ' &bull; GS: <strong class="text-emerald-700">' + item.sampleGs + '</strong></span>' +
            '</div>' +

            // KARTA WYŚWIETLAJĄCA ZAWARTOŚĆ KOLUMNY D
            '<div class="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs">' +
              '<div class="flex items-center justify-between gap-2 mb-1">' +
                '<strong class="text-amber-950 font-bold">Zawartość Kolumny D z pliku (Opis produktu):</strong>' +
                '<span class="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-semibold shrink-0">Kolumna D</span>' +
              '</div>' +
              '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">' +
                '<p class="select-all leading-snug break-words">' + descHtml + '</p>' +
                (item.description ? '<button type="button" class="btnUseDesc px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-semibold shrink-0 transition-colors">Wstaw jako model</button>' : '') +
              '</div>' +
            '</div>' +

            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">' +
              '<div>' +
                '<label class="block text-xs font-semibold text-stone-700 mb-1">Marka produktu *</label>' +
                '<input type="text" class="inputBrand w-full text-xs rounded-lg border border-stone-300 p-2 bg-white" placeholder="np. Samsung, Apple, Xiaomi" value="' + escapeHtml(item.brand) + '" />' +
                '<div class="flex flex-wrap gap-1 mt-1.5">' + quickBrandButtons + '</div>' +
              '</div>' +
              '<div>' +
                '<label class="block text-xs font-semibold text-stone-700 mb-1">Oznaczenie modelu (SKU) *</label>' +
                '<input type="text" class="inputModel w-full text-xs rounded-lg border border-stone-300 p-2 bg-white" placeholder="np. Galaxy S24 128GB" value="' + escapeHtml(item.model) + '" />' +
              '</div>' +
            '</div>' +

            '<div class="pt-1">' +
              '<label class="inline-flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">' +
                '<input type="checkbox" class="chkSaveDict rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" checked />' +
                '<span>Zapamiętaj to mapowanie w słowniku na przyszłość</span>' +
              '</label>' +
            '</div>';

          var brandBtns = card.querySelectorAll('.btnBrandPick');
          brandBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
              card.querySelector('.inputBrand').value = this.textContent;
            });
          });

          var btnDesc = card.querySelector('.btnUseDesc');
          if (btnDesc && item.description) {
            btnDesc.addEventListener('click', function() {
              card.querySelector('.inputModel').value = item.description;
            });
          }

          list.appendChild(card);
        });

        modal.classList.remove('hidden');
      }

      // Zatwierdzenie uzupełnionych kodów
      document.getElementById('btnApplyUnmapped').addEventListener('click', function() {
        var list = document.getElementById('unmappedList');
        var cards = list.children;
        var mappings = getMappings();

        for (var i = 0; i < cards.length; i++) {
          var b = cards[i].querySelector('.inputBrand').value.trim();
          var m = cards[i].querySelector('.inputModel').value.trim();
          var chk = cards[i].querySelector('.chkSaveDict').checked;

          if (!b || !m) {
            alert('Uzupełnij markę i model dla wszystkich brakujących pozycji!');
            return;
          }

          pendingUnmapped[i].brand = b;
          pendingUnmapped[i].model = m;

          if (chk && pendingUnmapped[i].code) {
            mappings[pendingUnmapped[i].code.toUpperCase()] = { brand: b, model: m };
          }
        }

        saveMappings(mappings);

        currentRecords.forEach(function(rec) {
          if (rec.unmappedKey) {
            var found = pendingUnmapped.find(function(u) { return u.key === rec.unmappedKey; });
            if (found) {
              rec.brand = found.brand;
              rec.model = found.model;
            }
          }
        });

        document.getElementById('unmappedModal').classList.add('hidden');
        renderTable();
      });

      document.getElementById('btnCancelUnmapped').addEventListener('click', function() {
        document.getElementById('unmappedModal').classList.add('hidden');
        fileInput.value = '';
      });

      // Renderowanie tabeli
      function renderTable(filterText) {
        document.getElementById('uploadSection').classList.add('hidden');
        var results = document.getElementById('resultsSection');
        results.classList.remove('hidden');

        var tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        var filter = (filterText || '').toLowerCase();
        var totalGs = 0;

        currentRecords.forEach(function(r, idx) {
          totalGs += r.gs;

          var match = !filter || 
            r.brand.toLowerCase().includes(filter) ||
            r.model.toLowerCase().includes(filter) ||
            (r.code && r.code.toLowerCase().includes(filter)) ||
            (r.description && r.description.toLowerCase().includes(filter));

          if (!match) return;

          var tr = document.createElement('tr');
          tr.className = 'hover:bg-stone-50 transition-colors';
          tr.innerHTML = 
            '<td class="py-2.5 px-3 text-stone-400 font-mono text-[11px]">' + (idx + 1) + '</td>' +
            '<td class="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">' + r.timestamp + '</td>' +
            '<td class="py-2.5 px-3 font-medium text-stone-900">' +
              '<input type="text" class="cellBrand w-full bg-transparent hover:bg-stone-100 p-1 rounded border-transparent hover:border-stone-300 border text-xs" value="' + escapeHtml(r.brand) + '" />' +
            '</td>' +
            '<td class="py-2.5 px-3 font-mono font-semibold text-stone-900">' +
              '<input type="text" class="cellModel w-full bg-transparent hover:bg-stone-100 p-1 rounded border-transparent hover:border-stone-300 border text-xs" value="' + escapeHtml(r.model) + '" />' +
            '</td>' +
            '<td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">' +
              '<input type="number" class="cellGs w-20 text-right bg-transparent hover:bg-stone-100 p-1 rounded border-transparent hover:border-stone-300 border text-xs font-bold" value="' + r.gs + '" />' +
            '</td>' +
            '<td class="py-2.5 px-3 text-stone-500">' +
              '<span class="font-mono text-stone-800 font-bold">' + (r.code ? escapeHtml(r.code) : '(brak kodu)') + '</span>' +
              (r.description ? '<span class="block text-[11px] text-stone-500 truncate max-w-xs" title="' + escapeHtml(r.description) + '">' + escapeHtml(r.description) + '</span>' : '') +
            '</td>' +
            '<td class="py-2.5 px-3 text-center">' +
              '<button type="button" class="btnDeleteRow text-stone-400 hover:text-rose-600 p-1 rounded transition-colors" title="Usuń wiersz">&times;</button>' +
            '</td>';

          tr.querySelector('.cellBrand').addEventListener('change', function() { r.brand = this.value; });
          tr.querySelector('.cellModel').addEventListener('change', function() { r.model = this.value; });
          tr.querySelector('.cellGs').addEventListener('change', function() {
            r.gs = parseGsInteger(this.value);
            renderTable(document.getElementById('tableFilterInput').value);
          });
          tr.querySelector('.btnDeleteRow').addEventListener('click', function() {
            currentRecords.splice(idx, 1);
            renderTable(document.getElementById('tableFilterInput').value);
          });

          tbody.appendChild(tr);
        });

        document.getElementById('statCount').textContent = currentRecords.length;
        document.getElementById('statTotalGs').textContent = totalGs.toLocaleString();
        document.getElementById('statAvgGs').textContent = currentRecords.length ? Math.round(totalGs / currentRecords.length) : 0;

        if (!isSaved) {
          var btnSave = document.getElementById('btnSaveToSheets');
          btnSave.disabled = currentRecords.length === 0;
          btnSave.className = 'px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm shadow-sm transition-all';
          btnSave.innerHTML = '<span>Zaakceptuj i dopisz do "Form Responses 1" (' + currentRecords.length + ' wierszy)</span>';
          document.getElementById('successBanner').classList.add('hidden');
          document.getElementById('saveStatusInfo').innerHTML = 'Wiersze zostaną dopisane na samym końcu zakładki <strong>"Form Responses 1"</strong>.';
        }
      }

      document.getElementById('tableFilterInput').addEventListener('input', function() {
        renderTable(this.value);
      });

      // Kopiowanie TSV do schowka
      document.getElementById('btnCopyTsv').addEventListener('click', function() {
        if (currentRecords.length === 0) return;
        var lines = currentRecords.map(function(r) {
          return [r.timestamp, r.brand, r.model, r.gs].join('\\t');
        });
        navigator.clipboard.writeText(lines.join('\\n')).then(function() {
          alert('Skopiowano ' + currentRecords.length + ' wierszy do schowka! Wklej (Ctrl+V) bezpośrednio do arkusza Google Sheets.');
        });
      });

      // Pobieranie CSV
      document.getElementById('btnDownloadCsv').addEventListener('click', function() {
        if (currentRecords.length === 0) return;
        var csvLines = ['timestamp,marka,model,gs'];
        currentRecords.forEach(function(r) {
          csvLines.push('"' + r.timestamp + '","' + r.brand.replace(/"/g, '""') + '","' + r.model.replace(/"/g, '""') + '",' + r.gs);
        });
        downloadBlob(csvLines.join('\\n'), 'form_responses_export.csv', 'text/csv;charset=utf-8;');
      });

      // Pobieranie XLSX
      document.getElementById('btnDownloadXlsx').addEventListener('click', function() {
        if (currentRecords.length === 0) return;
        var aoa = [['timestamp', 'marka', 'model', 'gs']];
        currentRecords.forEach(function(r) {
          aoa.push([r.timestamp, r.brand, r.model, r.gs]);
        });
        var ws = XLSX.utils.aoa_to_sheet(aoa);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Form Responses 1');
        XLSX.writeFile(wb, 'form_responses_export.xlsx');
      });

      // Zapis do Google Sheets
      document.getElementById('btnSaveToSheets').addEventListener('click', function() {
        if (isSaved || currentRecords.length === 0) return;

        var btn = this;
        btn.disabled = true;
        btn.innerHTML = '<span>Zapisywanie w Google Sheets...</span>';

        var rowsToSave = currentRecords.map(function(r) {
          return [r.timestamp, r.brand, r.model, r.gs];
        });

        if (isAppsScriptEnv) {
          google.script.run
            .withSuccessHandler(function(res) {
              onSaveSuccess(rowsToSave.length, res.sheet || 'Form Responses 1');
            })
            .withFailureHandler(function(err) {
              btn.disabled = false;
              btn.innerHTML = '<span>Zaakceptuj i dopisz do "Form Responses 1"</span>';
              alert('Błąd zapisu w arkuszu: ' + err.message);
            })
            .saveRecordsToSheets(rowsToSave, 'Form Responses 1');
          return;
        }

        var webhookUrl = localStorage.getItem('GS_WEBHOOK_URL');
        if (webhookUrl && webhookUrl.startsWith('http')) {
          fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'append', sheetName: 'Form Responses 1', records: rowsToSave })
          }).then(function() {
            onSaveSuccess(rowsToSave.length, 'Form Responses 1');
          }).catch(function(err) {
            btn.disabled = false;
            btn.innerHTML = '<span>Zaakceptuj i dopisz do "Form Responses 1"</span>';
            alert('Błąd wysyłania do Webhooka: ' + err.message);
          });
        } else {
          var choice = confirm(
            'Aplikacja działa w trybie przeglądarki (poza edytorem Apps Script).\\n\\n' +
            'Czy chcesz skopiować wygenerowane wiersze do schowka, aby wkleić je (Ctrl+V) w arkuszu?\\n\\n' +
            '(Kliknij "Anuluj", jeśli wolisz podać URL Webhooka Apps Script w ustawieniach).'
          );
          if (choice) {
            document.getElementById('btnCopyTsv').click();
            onSaveSuccess(rowsToSave.length, 'Form Responses 1 (Schowek)');
          } else {
            btn.disabled = false;
            btn.innerHTML = '<span>Zaakceptuj i dopisz do "Form Responses 1"</span>';
            document.getElementById('webhookModal').classList.remove('hidden');
          }
        }
      });

      function onSaveSuccess(count, sheetName) {
        isSaved = true;
        var banner = document.getElementById('successBanner');
        banner.classList.remove('hidden');
        document.getElementById('successDetails').innerHTML = 
          'Dopisano <strong>' + count + ' wierszy</strong> na końcu zakładki <strong>"' + sheetName + '"</strong> o godzinie ' + new Date().toLocaleTimeString() + '. Przycisk został zablokowany, aby zapobiec podwójnemu wysłaniu danych.';

        var btn = document.getElementById('btnSaveToSheets');
        btn.disabled = true;
        btn.className = 'px-7 py-3 rounded-xl bg-stone-200 text-stone-500 cursor-not-allowed text-sm font-semibold flex items-center justify-center space-x-2';
        btn.innerHTML = '<span>✓ Dane dodane (' + count + ' wierszy) — przycisk zablokowany</span>';

        document.getElementById('saveStatusInfo').innerHTML = 
          '<span class="text-emerald-700 font-semibold">✓ Wiersze pomyślnie dopisane na końcu tabeli w "' + sheetName + '".</span>';
      }

      function resetToUpload() {
        currentRecords = [];
        pendingUnmapped = [];
        isSaved = false;
        fileInput.value = '';
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('columnConfigCard').classList.add('hidden');
        document.getElementById('uploadSection').classList.remove('hidden');
      }

      document.getElementById('btnResetTable').addEventListener('click', resetToUpload);
      document.getElementById('btnUploadNext').addEventListener('click', resetToUpload);

      function renderDictionaryList() {
        var mappings = getMappings();
        var list = document.getElementById('dictionaryList');
        var keys = Object.keys(mappings).sort();
        list.innerHTML = '';

        document.getElementById('dictCountBadge').textContent = 'Łącznie pozycji: ' + keys.length;

        keys.forEach(function(k) {
          var item = mappings[k];
          var div = document.createElement('div');
          div.className = 'flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50';
          div.innerHTML = 
            '<div>' +
              '<span class="font-mono font-bold text-stone-900 mr-2">' + escapeHtml(k) + '</span>' +
              '<span class="text-stone-700">' + escapeHtml(item.brand) + ' &bull; ' + escapeHtml(item.model) + '</span>' +
            '</div>' +
            '<button type="button" class="btnDelDict text-stone-400 hover:text-rose-600 text-sm font-bold px-2">&times;</button>';

          div.querySelector('.btnDelDict').addEventListener('click', function() {
            delete mappings[k];
            saveMappings(mappings);
            renderDictionaryList();
          });
          list.appendChild(div);
        });
      }

      document.getElementById('btnOpenDictionary').addEventListener('click', function() {
        renderDictionaryList();
        document.getElementById('dictionaryModal').classList.remove('hidden');
      });
      document.getElementById('btnCloseDictionary').addEventListener('click', function() {
        document.getElementById('dictionaryModal').classList.add('hidden');
      });
      document.getElementById('btnAddDictEntry').addEventListener('click', function() {
        var code = document.getElementById('dictInputCode').value.trim().toUpperCase();
        var brand = document.getElementById('dictInputBrand').value.trim();
        var model = document.getElementById('dictInputModel').value.trim();

        if (!code || !brand || !model) {
          alert('Uzupełnij kod, markę i model!');
          return;
        }

        var mappings = getMappings();
        mappings[code] = { brand: brand, model: model };
        saveMappings(mappings);

        document.getElementById('dictInputCode').value = '';
        document.getElementById('dictInputBrand').value = '';
        document.getElementById('dictInputModel').value = '';
        renderDictionaryList();
      });
      document.getElementById('btnResetDictDefault').addEventListener('click', function() {
        if (confirm('Czy na pewno przywrócić domyślne mapowania?')) {
          saveMappings(DEFAULT_MAPPINGS);
          renderDictionaryList();
        }
      });

      document.getElementById('btnWebhookConfig').addEventListener('click', function() {
        document.getElementById('webhookUrlInput').value = localStorage.getItem('GS_WEBHOOK_URL') || '';
        document.getElementById('webhookModal').classList.remove('hidden');
      });
      document.getElementById('btnCancelWebhook').addEventListener('click', function() {
        document.getElementById('webhookModal').classList.add('hidden');
      });
      document.getElementById('btnSaveWebhook').addEventListener('click', function() {
        var val = document.getElementById('webhookUrlInput').value.trim();
        if (val) {
          localStorage.setItem('GS_WEBHOOK_URL', val);
        } else {
          localStorage.removeItem('GS_WEBHOOK_URL');
        }
        document.getElementById('webhookModal').classList.add('hidden');
        alert('Adres Webhooka zapisany!');
      });

      document.getElementById('btnSampleDownload').addEventListener('click', function() {
        var sampleData = [
          ['Kod', 'Numer seryjny', 'Data', 'Opis produktu (Kolumna D)', 'Salon', 'Kategoria', 'Ilość', 'Cena', 'Prowizja', 'Premia GS'],
          ['SAM-S24-128', 'SN10129', '2026-09-01', 'Smartfon Samsung Galaxy S24 128GB Czarny', 'Warszawa', 'Smartfony', 1, 3599, 150, 240],
          ['APL-IP16P-256', 'SN44102', '2026-09-02', 'Smartfon Apple iPhone 16 Pro 256GB Tytan', 'Kraków', 'Smartfony', 1, 6499, 200, 350],
          ['XIA-RN13-8', 'SN88219', '2026-09-03', 'Smartfon Xiaomi Redmi Note 13 8/256GB', 'Gdańsk', 'Smartfony', 2, 1299, 80, 120],
          ['NOWY-KOD-BRAK', 'SN99201', '2026-09-04', 'Smartfon Motorola Edge 50 Pro 12/512GB Black', 'Wrocław', 'Smartfony', 1, 2899, 100, 180],
          ['', 'SN33110', '2026-09-05', 'Słuchawki Sony WH-1000XM5 ANC Czarne', 'Poznań', 'Audio', 1, 1499, 50, 95]
        ];
        var ws = XLSX.utils.aoa_to_sheet(sampleData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sprzedaż');
        XLSX.writeFile(wb, 'wzorzec_sprzedazy_gs.xlsx');
      });

      function downloadBlob(content, filename, contentType) {
        var blob = new Blob([content], { type: contentType });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

    })();
  </script>
</body>
</html>`;

export function getGoogleAppsScriptHtmlTemplate(): string {
  return STANDALONE_HTML_TEMPLATE;
}
