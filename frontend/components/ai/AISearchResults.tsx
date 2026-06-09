import { Sparkles } from 'lucide-react';
import type { Product } from '../../hooks/useProducts';
import AILoader from './AILoader';
import AIProductCard from './AIProductCard';

interface AISearchResultsProps {
  query: string;
  results: Product[];
  explanation: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onBack: () => void;
}

export default function AISearchResults({
  query,
  results,
  explanation,
  isLoading,
  hasMore,
  onLoadMore,
  onBack,
}: AISearchResultsProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">AI поиск</h2>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Обычный поиск
        </button>
      </div>

      {/* Query */}
      <p className="text-sm text-gray-500 mb-4">
        По запросу: <span className="font-medium text-gray-700">«{query}»</span>
      </p>

      {/* Loading */}
      {isLoading && results.length === 0 && <AILoader />}

      {/* Results */}
      {results.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-4">{explanation}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((product, i) => (
              <AIProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    Ищу...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Искать ещё
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* No results */}
      {!isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Товары не найдены. Попробуйте изменить запрос.</p>
        </div>
      )}
    </div>
  );
}
