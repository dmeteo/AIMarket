'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: number;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ options, value, onChange, placeholder = 'Выберите...' }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (val: number) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = value.map((v) => options.find((o) => o.value === v)?.label).filter(Boolean);

  return (
    <div ref={ref} className="relative">
      {/* Trigger with inline search */}
      <div
        className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer hover:border-gray-300 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <input
          ref={inputRef}
          type="text"
          value={open ? search : (selectedLabels.length ? selectedLabels.join(', ') : '')}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 cursor-pointer"
        />
        <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown with filtered options */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">Ничего не найдено</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => toggle(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                  value.includes(option.value) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value.includes(option.value) && <span className="text-indigo-600 flex-shrink-0 ml-2">✓</span>}
              </button>
            ))
          )}

          {value.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Выбрано: {value.length}</span>
              <button onClick={() => onChange([])} className="text-xs text-red-500 hover:text-red-600">
                Снять все
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected tags (when closed) */}
      {value.length > 0 && !open && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((v) => {
            const label = options.find((o) => o.value === v)?.label;
            return (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                {label}
                <button onClick={(e) => { e.stopPropagation(); toggle(v); }} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
