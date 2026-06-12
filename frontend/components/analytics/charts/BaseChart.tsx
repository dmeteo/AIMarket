'use client';

import { ChevronDown } from 'lucide-react';

interface ChartTab {
  value: string;
  label: string;
}

interface BaseChartProps {
  title: string;
  tabs?: ChartTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export default function BaseChart({ title, tabs, activeTab, onTabChange, children, className = '' }: BaseChartProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {tabs && tabs.length > 0 && (
          <div className="relative">
            <select
              value={activeTab || tabs[0]?.value}
              onChange={(e) => onTabChange?.(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {tabs.map((tab) => (
                <option key={tab.value} value={tab.value}>{tab.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
