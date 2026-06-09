const STATUSES = [
  'Анализирую запрос...',
  'Подбираю товары...',
  'Почти готово...',
];

export default function AILoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>

      {/* Status text that cycles */}
      <div className="h-5 overflow-hidden relative">
        {STATUSES.map((status, i) => (
          <p
            key={status}
            className="text-sm text-gray-500 text-center animate-status-fade"
            style={{
              animationDelay: `${i * 0.8}s`,
            }}
          >
            {status}
          </p>
        ))}
      </div>
    </div>
  );
}
