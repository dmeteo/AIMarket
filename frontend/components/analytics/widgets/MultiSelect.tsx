'use client';

import { useState, useRef, useEffect } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-left hover:border-gray-300 transition-colors"
      >
        <span className={selectedLabels.length ? 'text-gray-900' : 'text-gray-400'}>
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => toggle(option.value)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                value.includes(option.value) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
              }`}
            >
              <span>{option.label}</span>
              {value.includes(option.value) && <span className="text-indigo-600">✓</span>}
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((v) => {
            const label = options.find((o) => o.value === v)?.label;
            return (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                {label}
                <button onClick={() => toggle(v)} className="hover:text-indigo-900">
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

// Helper to select all
export function SelectAll({ options, value, onChange }: Omit<MultiSelectProps, 'placeholder'>) {
  const allSelected = value.length === options.length;
  return (
    <button
      onClick={() => onChange(allSelected ? [] : options.map((o) => o.value))}
      className="text-xs text-indigo-600 hover:text-indigo-700 mb-1"
    >
      {allSelected ? 'Снять все' : 'Выбрать все'}
    </button>
  );
}
