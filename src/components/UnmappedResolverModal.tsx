import React, { useState } from 'react';
import { AlertTriangle, Check, FileText, Sparkles } from 'lucide-react';
import { UnmappedItem, ProductMapping } from '../types';

interface UnmappedResolverModalProps {
  unmappedItems: UnmappedItem[];
  onResolve: (resolvedItems: UnmappedItem[]) => void;
  onCancel: () => void;
  knownBrands?: string[];
}

export const UnmappedResolverModal: React.FC<UnmappedResolverModalProps> = ({
  unmappedItems,
  onResolve,
  onCancel,
  knownBrands = ['Samsung', 'Apple', 'Xiaomi', 'Sony', 'Asus', 'Lenovo', 'LG', 'Motorola', 'Huawei', 'Philips'],
}) => {
  const [items, setItems] = useState<UnmappedItem[]>(() =>
    unmappedItems.map((item) => {
      // Auto-suggest brand if found in Column D description
      let initialBrand = item.brand || '';
      let initialModel = item.model || '';

      if (!initialBrand && item.description) {
        const descLower = item.description.toLowerCase();
        const matchedBrand = knownBrands.find((b) => descLower.includes(b.toLowerCase()));
        if (matchedBrand) {
          initialBrand = matchedBrand;
        }
      }

      return {
        ...item,
        brand: initialBrand,
        model: initialModel,
        saveToDatabase: item.saveToDatabase ?? true,
      };
    })
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFieldChange = (
    index: number,
    field: 'brand' | 'model' | 'saveToDatabase',
    value: any
  ) => {
    setValidationError(null);
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleBrandSelect = (index: number, brand: string) => {
    handleFieldChange(index, 'brand', brand);
  };

  const handleUseDescriptionAsModel = (index: number, desc: string) => {
    if (!desc) return;
    handleFieldChange(index, 'model', desc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: all items must have both brand and model filled
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.brand.trim()) {
        setValidationError(`Uzupełnij markę produktu dla pozycji #${i + 1} (Kod: "${item.code || 'Brak kodu'}").`);
        return;
      }
      if (!item.model.trim()) {
        setValidationError(`Uzupełnij oznaczenie modelu (SKU) dla pozycji #${i + 1} (Kod: "${item.code || 'Brak kodu'}").`);
        return;
      }
    }

    onResolve(items);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 bg-amber-50/60 rounded-t-2xl flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-stone-900">
              Wymagane uzupełnienie danych ({items.length} {items.length === 1 ? 'pozycja' : 'pozycje'})
            </h3>
            <p className="text-sm text-stone-600 mt-0.5">
              W pliku wykryto kody, których nie ma w bazie mapowań, lub wiersze z brakującym kodem. Wprowadź markę i oznaczenie modelu. Poniżej wyświetlony jest opis z <strong>Kolumny D</strong> pliku wejściowego ułatwiający identyfikację.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {validationError}
            </div>
          )}

          <div className="space-y-4">
            {items.map((item, index) => {
              const isMissingCode = !item.code || item.code.trim() === '';
              return (
                <div
                  key={item.key || index}
                  className="border border-stone-200 rounded-xl p-4 sm:p-5 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 text-xs font-mono font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      {isMissingCode ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-semibold">
                          Brak kodu w wierszu
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs text-stone-500">Kod z pliku:</span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-200/80 font-mono font-bold text-stone-900 text-xs">
                            {item.code}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-stone-500 font-mono">
                      <span>
                        Wiersze w pliku: <strong className="text-stone-700">{item.sampleRows.join(', ')}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Premia GS: <strong className="text-emerald-700">{item.sampleGs}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Zawartość Kolumny D (Opis z pliku wejściowego) */}
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-950">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                        <FileText className="w-4 h-4 text-amber-800 shrink-0" />
                        <span>Zawartość Kolumny D z pliku (Opis produktu):</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-semibold shrink-0">
                        Kolumna D
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-stone-900 select-all break-words leading-snug">
                        {item.description && item.description.trim() ? (
                          item.description
                        ) : (
                          <span className="italic text-stone-400 font-normal">
                            (Brak opisu w kolumnie D w pliku dla tego wiersza)
                          </span>
                        )}
                      </p>
                      {item.description && item.description.trim() && !item.model && (
                        <button
                          type="button"
                          onClick={() => handleUseDescriptionAsModel(index, item.description!)}
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold transition-colors shrink-0 self-start sm:self-auto"
                          title="Wklej ten opis do pola Model (SKU)"
                        >
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Wstaw jako model</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Marka produktu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={`input-unmapped-brand-${index}`}
                        type="text"
                        placeholder="np. Samsung, Apple, Xiaomi"
                        value={item.brand}
                        onChange={(e) => handleFieldChange(index, 'brand', e.target.value)}
                        className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                      {/* Brand quick picks */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {knownBrands.slice(0, 6).map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => handleBrandSelect(index, b)}
                            className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Oznaczenie modelu (symbol SKU) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={`input-unmapped-model-${index}`}
                        type="text"
                        placeholder="np. Galaxy S24 128GB, WH-1000XM5"
                        value={item.model}
                        onChange={(e) => handleFieldChange(index, 'model', e.target.value)}
                        className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                      <p className="text-[11px] text-stone-400 mt-1">
                        Dokładna nazwa modelu wprowadzana do tabeli wynikowej
                      </p>
                    </div>
                  </div>

                  {/* Save to database toggle */}
                  {!isMissingCode && (
                    <div className="pt-1">
                      <label className="inline-flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                        <input
                          id={`check-unmapped-save-${index}`}
                          type="checkbox"
                          checked={item.saveToDatabase}
                          onChange={(e) => handleFieldChange(index, 'saveToDatabase', e.target.checked)}
                          className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="font-medium text-stone-700">
                          Zapisz to mapowanie do bazy (zapamiętaj dla kodu "{item.code}" na przyszłość)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-stone-200 pt-4 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              id="btn-cancel-resolver"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium transition-colors"
            >
              Wróć do wyboru pliku
            </button>

            <button
              type="submit"
              id="btn-submit-resolver"
              className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Zatwierdź i wygeneruj tabelę</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
