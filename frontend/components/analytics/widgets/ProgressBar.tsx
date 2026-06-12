interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export default function ProgressBar({ label, value, max, color = 'bg-indigo-500' }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-900">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
