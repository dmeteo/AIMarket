'use client';

import { useState, useEffect, useCallback } from 'react';
import AIFloatingButton from '../components/ai/AIFloatingButton';
import AIChatDrawer from '../components/ai/AIChatDrawer';
import AISearchResults from '../components/ai/AISearchResults';
import { useAIChat } from '../hooks/useAIChat';
import { useAISearch } from '../hooks/useAISearch';
import { useProducts } from '../hooks/useProducts';

export default function AIProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState<string | null>(null);

  // Get all products for AI search/chat
  const { data: productsData } = useProducts(100);
  const allProducts = productsData?.pages?.flatMap((p) => p.items) ?? [];

  const aiSearch = useAISearch(allProducts);
  const aiChat = useAIChat(allProducts);

  // Listen for AI search events from ProductList
  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail?.query ?? '';
      setAiSearchQuery(query);
      aiSearch.search(query);
    };
    window.addEventListener('ai-search', handler);
    return () => window.removeEventListener('ai-search', handler);
  }, [aiSearch]);

  const handleBackToSearch = useCallback(() => {
    setAiSearchQuery(null);
    aiSearch.reset();
  }, [aiSearch]);

  return (
    <>
      {children}

      {/* AI Search Results overlay */}
      {aiSearchQuery && (
        <div className="fixed inset-0 z-30 bg-white overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <AISearchResults
              query={aiSearchQuery}
              results={aiSearch.results}
              explanation={aiSearch.explanation}
              isLoading={aiSearch.isLoading}
              hasMore={aiSearch.hasMore}
              onLoadMore={aiSearch.loadMore}
              onBack={handleBackToSearch}
            />
          </div>
        </div>
      )}

      {/* AI Chat */}
      <AIFloatingButton onClick={() => setChatOpen(true)} />
      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={aiChat.messages}
        isLoading={aiChat.isLoading}
        onSend={aiChat.sendMessage}
        onClear={aiChat.clearChat}
      />
    </>
  );
}
