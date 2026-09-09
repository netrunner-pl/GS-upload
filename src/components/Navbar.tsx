import React from 'react';
import { FileSpreadsheet, Database, Cloud, Code2, Download, CheckCircle2 } from 'lucide-react';
import { generateSampleExcelFile } from '../utils/excelParser';

interface NavbarProps {
  activeTab: 'process' | 'mappings' | 'sheets' | 'code';
  setActiveTab: (tab: 'process' | 'mappings' | 'sheets' | 'code') => void;
  mappingsCount: number;
  hasAcceptedData?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mappingsCount,
  hasAcceptedData,
}) => {
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

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-stone-900 text-base tracking-tight">
                  GS form updater
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Form Responses 1
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Mapowanie Kol. A (Kod) &rarr; Marka/Model | Kol. J (Premia GS) &rarr; Google Sheets
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-tab-process"
              onClick={() => setActiveTab('process')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'process'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Przetwarzanie</span>
              {hasAcceptedData && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              )}
            </button>

            <button
              id="nav-tab-mappings"
              onClick={() => setActiveTab('mappings')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'mappings'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Baza mapowań</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-mono">
                {mappingsCount}
              </span>
            </button>

            <button
              id="nav-tab-sheets"
              onClick={() => setActiveTab('sheets')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'sheets'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span className="hidden md:inline">Google Sheets</span>
              <span className="md:hidden">Sheets</span>
            </button>

            <button
              id="nav-tab-code"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'code'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden lg:inline">Apps Script &amp; Python</span>
              <span className="lg:hidden">Kod</span>
            </button>

            {/* Quick Sample Download */}
            <button
              id="btn-download-sample-excel"
              onClick={handleDownloadSample}
              title="Pobierz gotowy przykładowy plik Excel (.xlsx) do testów"
              className="hidden sm:flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Wzór Excel</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
