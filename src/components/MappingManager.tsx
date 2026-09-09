import React, { useState, useRef } from 'react';
import { Plus, Search, Trash2, Edit2, Download, Upload, RefreshCw, Check, X, Database } from 'lucide-react';
import { ProductMapping } from '../types';
import { INITIAL_MAPPINGS } from '../data/defaultMappings';

interface MappingManagerProps {
  mappings: Record<string, ProductMapping>;
  onUpdateMappings: (mappings: Record<string, ProductMapping>) => void;
}

export const MappingManager: React.FC<MappingManagerProps> = ({
  mappings,
  onUpdateMappings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mappingsList: ProductMapping[] = Object.values(mappings);

  const filteredList = mappingsList.filter(
    (m: ProductMapping) =>
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = newCode.trim();
    const brand = newBrand.trim();
    const model = newModel.trim().toUpperCase().replace(/\s+/g, '');

    if (!code || !brand || !model) {
      setError('Wszystkie pola są wymagane.');
      return;
    }

    const normalizedCode = code.toUpperCase();
    if (mappings[normalizedCode]) {
      setError(`Kod "${code}" już istnieje w bazie. Edytuj istniejący wpis.`);
      return;
    }

    onUpdateMappings({
      ...mappings,
      [normalizedCode]: {
        code,
        brand,
        model,
        updatedAt: new Date().toISOString(),
      },
    });

    setNewCode('');
    setNewBrand('');
    setNewModel('');
    setIsAdding(false);
  };

  const handleStartEdit = (m: ProductMapping) => {
    setEditingCode(m.code.toUpperCase());
    setEditBrand(m.brand);
    setEditModel(m.model);
  };

  const handleSaveEdit = (code: string) => {
    const normalizedCode = code.toUpperCase();
    const existing = mappings[normalizedCode];
    if (!existing) return;

    onUpdateMappings({
      ...mappings,
      [normalizedCode]: {
        ...existing,
        brand: editBrand.trim() || existing.brand,
        model: editModel.trim().toUpperCase().replace(/\s+/g, '') || existing.model,
        updatedAt: new Date().toISOString(),
      },
    });
    setEditingCode(null);
  };

  const handleDelete = (code: string) => {
    const normalized = code.toUpperCase();
    const next = { ...mappings };
    delete next[normalized];
    onUpdateMappings(next);
  };

  const handleClearAll = () => {
    if (window.confirm('Czy na pewno chcesz usunąć wszystkie zapisane mapowania z bazy?')) {
      onUpdateMappings({});
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(Object.values(mappings), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baza_mapowan_sku_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text) as ProductMapping[];
        if (!Array.isArray(imported)) {
          alert('Plik JSON musi zawierać tablicę obiektów mapowań.');
          return;
        }

        const merged = { ...mappings };
        let count = 0;
        imported.forEach((m) => {
          if (m.code && m.brand && m.model) {
            merged[m.code.toUpperCase()] = {
              code: m.code,
              brand: m.brand,
              model: m.model,
              updatedAt: new Date().toISOString(),
            };
            count++;
          }
        });

        onUpdateMappings(merged);
        alert(`Pomyślnie zaimportowano ${count} pozycji mapowań!`);
      } catch (err) {
        console.error('Błąd importu JSON:', err);
        alert('Błąd podczas parsowania pliku JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Baza mapowań kodów na markę i model SKU
              </h2>
              <p className="text-sm text-stone-600">
                Słownik przechowywany w pamięci aplikacji. Przypisuje kod produktu z kolumny A do marki i oznaczenia modelu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-add-new-mapping"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj mapowanie</span>
          </button>

          <button
            id="btn-export-mappings"
            onClick={handleExportJson}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-colors"
            title="Eksportuj bazę do pliku JSON"
          >
            <Download className="w-4 h-4" />
            <span>Eksport JSON</span>
          </button>

          <button
            id="btn-import-mappings"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-colors"
            title="Importuj bazę z pliku JSON"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportJson}
          />

          <button
            id="btn-clear-mappings"
            onClick={handleClearAll}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl border border-stone-200 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs sm:text-sm font-medium transition-colors"
            title="Wyczyść wszystkie zapisane mapowania"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wyczyść bazę</span>
          </button>
        </div>
      </div>

      {/* Add New Mapping Form (Collapsible) */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-emerald-950 flex items-center space-x-1.5">
              <Plus className="w-4 h-4" />
              <span>Dodawanie nowego mapowania SKU</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Kod z pliku (Kolumna A) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-new-code"
                type="text"
                placeholder="np. SAM-S24-128"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Marka produktu <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-new-brand"
                type="text"
                placeholder="np. Samsung"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                className="w-full text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Oznaczenie modelu (symbol SKU) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-new-model"
                type="text"
                placeholder="np. Galaxy S24 128GB"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="w-full text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-white"
            >
              Anuluj
            </button>
            <button
              type="submit"
              id="btn-save-new-mapping"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              Zapisz mapowanie
            </button>
          </div>
        </form>
      )}

      {/* Mappings Table */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              id="input-search-mappings"
              type="text"
              placeholder="Wyszukaj kod, markę lub model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
            />
          </div>

          <div className="text-xs text-stone-500 font-mono">
            Łącznie w bazie: <strong>{mappingsList.length}</strong> pozycji
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 font-mono">#</th>
                <th className="py-3 px-3">Kod produktu (Kolumna A)</th>
                <th className="py-3 px-3">Marka produktu</th>
                <th className="py-3 px-3">Oznaczenie modelu (symbol SKU)</th>
                <th className="py-3 px-3 text-right w-24">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500 text-sm">
                    Brak pozycji w bazie mapowań. Kliknij "Dodaj mapowanie", aby zdefiniować pierwsze.
                  </td>
                </tr>
              ) : (
                filteredList.map((item: ProductMapping, idx) => {
                  const isEditing = editingCode === item.code.toUpperCase();
                  return (
                    <tr
                      key={item.code}
                      className={`hover:bg-stone-50 transition-colors ${
                        isEditing ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-xs text-stone-400">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-semibold text-stone-900">
                        <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-xs">
                          {item.code}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editBrand}
                            onChange={(e) => setEditBrand(e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-stone-300 w-full"
                          />
                        ) : (
                          <span className="font-medium text-stone-800">{item.brand}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editModel}
                            onChange={(e) => setEditModel(e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-stone-300 w-full"
                          />
                        ) : (
                          <span className="text-stone-700">{item.model}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(item.code)}
                            className="p-1 text-emerald-600 hover:text-emerald-800"
                            title="Zapisz zmiany"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-stone-400 hover:text-stone-700"
                            title="Edytuj"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.code)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                          title="Usuń mapowanie"
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
      </div>
    </div>
  );
};
