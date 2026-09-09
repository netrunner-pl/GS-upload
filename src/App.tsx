/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Navbar } from './components/Navbar';
import { ExcelUploader } from './components/ExcelUploader';
import { UnmappedResolverModal } from './components/UnmappedResolverModal';
import { PreviewTable } from './components/PreviewTable';
import { MappingManager } from './components/MappingManager';
import { GoogleSheetsSettings } from './components/GoogleSheetsSettings';
import { CodeExportModal } from './components/CodeExportModal';
import { ProductMapping, ProcessedRecord, UnmappedItem, GoogleSheetsConfig } from './types';
import { INITIAL_MAPPINGS, STORAGE_KEY_MAPPINGS, STORAGE_KEY_CONFIG } from './data/defaultMappings';
import { extractExcelData } from './utils/excelParser';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'process' | 'mappings' | 'sheets' | 'code'>('process');

  // Mappings State
  const [mappings, setMappings] = useState<Record<string, ProductMapping>>(() => {
    const mockCodes = ['SAM-S24-128', 'SAM-S24U-256', 'APL-IP16-128', 'APL-IP16P-256', 'XIA-RN13-8', 'XIA-14T-12', 'SNY-WH1000-B', 'ASU-ZEPH-G16', 'LEN-LOQ-15', 'LG-OLED-55C4', 'TCL-65C845'];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAPPINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered: Record<string, ProductMapping> = {};
        let changed = false;
        Object.keys(parsed).forEach((k) => {
          if (!mockCodes.includes(k)) {
            filtered[k] = parsed[k];
          } else {
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEY_MAPPINGS, JSON.stringify(filtered));
        }
        return filtered;
      }
    } catch (e) {
      console.error('Failed to load mappings from localStorage', e);
    }
    return {};
  });

  // Google Sheets Config State
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.sheetName || parsed.sheetName === 'Dane GS' || parsed.sheetName === 'Arkusz1') {
          parsed.sheetName = 'Form Responses 1';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load sheets config from localStorage', e);
    }
    return {
      webAppUrl: '',
      spreadsheetId: '',
      sheetName: 'Form Responses 1',
      autoSaveMappings: true,
    };
  });

  // Processing State
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');
  const [rawWorkbook, setRawWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentSheetName, setCurrentSheetName] = useState<string>('');
  const [processedRecords, setProcessedRecords] = useState<ProcessedRecord[]>([]);
  const [unmappedItems, setUnmappedItems] = useState<UnmappedItem[]>([]);
  const [isResolverOpen, setIsResolverOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Persist mappings
  const handleUpdateMappings = (newMappings: Record<string, ProductMapping>) => {
    setMappings(newMappings);
    try {
      localStorage.setItem(STORAGE_KEY_MAPPINGS, JSON.stringify(newMappings));
    } catch (e) {
      console.error('Failed to save mappings', e);
    }
  };

  // Persist sheets config
  const handleSaveSheetsConfig = (newConfig: GoogleSheetsConfig) => {
    setSheetsConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save sheets config', e);
    }
  };

  // Process uploaded Excel file
  const handleWorkbookLoaded = (
    workbook: XLSX.WorkBook,
    fileName: string,
    sheetName: string,
    codeColIndex?: number,
    gsColIndex?: number,
    hasHeader?: boolean,
    descColIndex?: number
  ) => {
    setIsProcessing(true);
    setRawWorkbook(workbook);
    setCurrentFileName(fileName);
    setCurrentSheetName(sheetName);

    try {
      const result = extractExcelData(workbook, mappings, {
        sheetName,
        codeColIndex,
        gsColIndex,
        hasHeader,
        descColIndex,
      });
      setProcessedRecords(result.records);

      if (result.unmappedItems.length > 0) {
        setUnmappedItems(result.unmappedItems);
        setIsResolverOpen(true);
      } else {
        setUnmappedItems([]);
        setIsResolverOpen(false);
        setCurrentStep('preview');
      }
    } catch (err: any) {
      alert(`Błąd przetwarzania pliku: ${err.message || 'Nieznany błąd'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resolving unmapped items from the modal
  const handleResolveUnmapped = (resolvedItems: UnmappedItem[]) => {
    // 1. Create a lookup for resolved items by code
    const resolvedLookup = new Map<string, UnmappedItem>();
    resolvedItems.forEach((item) => {
      const codeKey = (item.code || '').trim().toUpperCase();
      resolvedLookup.set(codeKey, item);
      if (item.key) {
        resolvedLookup.set(item.key, item);
      }
    });

    // 2. Update processed records
    const updatedRecords = processedRecords.map((record) => {
      const codeKey = (record.code || '').trim().toUpperCase();
      const resolved = resolvedLookup.get(codeKey) || resolvedLookup.get(`__EMPTY_CODE_ROW_${record.rowIndex}__`);

      if (resolved && (!record.brand || !record.model)) {
        return {
          ...record,
          brand: resolved.brand.trim(),
          model: resolved.model.trim(),
          source: 'manual' as const,
        };
      }
      return record;
    });

    // 3. Save new mappings to database if requested
    const newMappings = { ...mappings };
    let addedCount = 0;
    resolvedItems.forEach((item) => {
      const code = item.code.trim();
      if (code && item.saveToDatabase) {
        newMappings[code.toUpperCase()] = {
          code,
          brand: item.brand.trim(),
          model: item.model.trim(),
          updatedAt: new Date().toISOString(),
        };
        addedCount++;
      }
    });

    if (addedCount > 0) {
      handleUpdateMappings(newMappings);
    }

    setProcessedRecords(updatedRecords);
    setIsResolverOpen(false);
    setUnmappedItems([]);
    setCurrentStep('preview');
  };

  const handleResetWorkflow = () => {
    setCurrentStep('upload');
    setProcessedRecords([]);
    setUnmappedItems([]);
    setIsResolverOpen(false);
    setRawWorkbook(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mappingsCount={Object.keys(mappings).length}
        hasAcceptedData={currentStep === 'preview' && processedRecords.length > 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: Main Process Workflow */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            {currentStep === 'upload' && (
              <ExcelUploader
                onWorkbookLoaded={handleWorkbookLoaded}
                isLoading={isProcessing}
              />
            )}

            {currentStep === 'preview' && (
              <PreviewTable
                records={processedRecords}
                onUpdateRecords={setProcessedRecords}
                onReset={handleResetWorkflow}
                sheetsConfig={sheetsConfig}
                onOpenSheetsSettings={() => setActiveTab('sheets')}
              />
            )}
          </div>
        )}

        {/* TAB 2: Mappings Manager */}
        {activeTab === 'mappings' && (
          <MappingManager
            mappings={mappings}
            onUpdateMappings={handleUpdateMappings}
          />
        )}

        {/* TAB 3: Google Sheets Configuration */}
        {activeTab === 'sheets' && (
          <GoogleSheetsSettings
            config={sheetsConfig}
            onSaveConfig={handleSaveSheetsConfig}
            onGoToCodeTab={() => setActiveTab('code')}
          />
        )}

        {/* TAB 4: Apps Script & Python Source Code */}
        {activeTab === 'code' && <CodeExportModal />}
      </main>

      {/* Modal for Unmapped Items */}
      {isResolverOpen && unmappedItems.length > 0 && (
        <UnmappedResolverModal
          unmappedItems={unmappedItems}
          onResolve={handleResolveUnmapped}
          onCancel={() => {
            setIsResolverOpen(false);
            setCurrentStep('upload');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Excel &rarr; Google Sheets GS Mapper</strong> &bull; Deterministyczne przetwarzanie bez użycia LLM
          </span>
          <span className="font-mono text-[11px] text-stone-400">
            Kolumny: A (Kod) &bull; J (Premia GS) &bull; Format: [timestamp, marka, model, gs]
          </span>
        </div>
      </footer>
    </div>
  );
}
