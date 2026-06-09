import { Sparkles } from 'lucide-react';

interface AIFloatingButtonProps {
  onClick: () => void;
}

export default function AIFloatingButton({ onClick }: AIFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      title="ИИ-консультант"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20" />
      <Sparkles className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform" />
    </button>
  );
}
