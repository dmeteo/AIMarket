import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../../hooks/useAIChat';
import type { Product } from '../../hooks/useProducts';
import AIProductCard from './AIProductCard';

interface AIChatMessageProps {
  message: ChatMessage;
  onProductClick?: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export default function AIChatMessage({ message, onProductClick }: AIChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser ? 'bg-zinc-900' : 'bg-indigo-100'
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-indigo-600" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`inline-block rounded-xl px-3 py-2 text-sm max-w-full ${
            isUser
              ? 'bg-zinc-900 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          {message.isTyping ? (
            <TypingIndicator />
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          )}
        </div>

        {/* Products */}
        {message.products && message.products.length > 0 && (
          <div className="mt-2 space-y-2 w-full">
            {message.products.map((product: Product, i: number) => (
              <AIProductCard key={product.id} product={product} index={i} onProductClick={onProductClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
