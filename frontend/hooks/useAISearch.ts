import { useState, useCallback } from 'react';
import type { Product } from './useProducts';

const PAGE_SIZE = 4;
const MAX_RESULTS = 12;

interface AISearchState {
  results: Product[];
  explanation: string;
  isLoading: boolean;
  hasMore: boolean;
  query: string;
}

// Simple keyword extraction from natural language query
function parseQuery(query: string): {
  keywords: string[];
  maxPrice: number | null;
  minPrice: number | null;
  category: string | null;
} {
  const lower = query.toLowerCase();
  const keywords: string[] = [];

  // Extract price constraints
  const maxPriceMatch = lower.match(/до\s+(\d+)/);
  const minPriceMatch = lower.match(/от\s+(\d+)/);
  const maxPrice = maxPriceMatch ? parseInt(maxPriceMatch[1], 10) : null;
  const minPrice = minPriceMatch ? parseInt(minPriceMatch[1], 10) : null;

  // Known categories to detect
  const categoryMap: Record<string, string> = {
    'электроника': 'Электроника',
    'наушник': 'Электроника',
    'колонк': 'Электроника',
    'зарядк': 'Электроника',
    'аксессуар': 'Аксессуары',
    'чехол': 'Аксессуары',
    'кабел': 'Аксессуары',
    'периферия': 'Периферия',
    'клавиатур': 'Периферия',
    'мышь': 'Периферия',
    'веб-камер': 'Периферия',
    'монитор': 'Мониторы',
    'для дома': 'Для дома',
    'пылесос': 'Для дома',
    'чайник': 'Для дома',
    'ламп': 'Для дома',
    'гаджет': 'Гаджеты',
    'фитнес': 'Гаджеты',
    'трекер': 'Гаджеты',
    'накопител': 'Накопители',
    'ssd': 'Накопители',
    'развлечен': 'Развлечения',
    'игра': 'Развлечения',
    'книг': 'Книги',
  };

  let category: string | null = null;
  for (const [key, cat] of Object.entries(categoryMap)) {
    if (lower.includes(key)) {
      category = cat;
      break;
    }
  }

  // Extract remaining keywords (words longer than 3 chars, excluding stop words)
  const stopWords = new Set([
    'мне', 'нужен', 'нужна', 'нужны', 'хочу', 'найти', 'подобрать',
    'для', 'что', 'как', 'где', 'есть', 'можно', 'пожалуйста',
    'с', 'и', 'или', 'в', 'на', 'от', 'до', 'по', 'за', 'из',
    'руб', 'рублей', '₽', 'цена', 'стоимость', 'бюджет',
  ]);

  const words = lower
    .replace(/[^\wа-яё\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Deduplicate
  for (const w of words) {
    if (!keywords.includes(w)) keywords.push(w);
  }

  return { keywords, maxPrice, minPrice, category };
}

// Score a product against parsed query
function scoreProduct(
  product: Product,
  keywords: string[],
  category: string | null,
): number {
  let score = 0;
  const title = product.title.toLowerCase();
  const desc = product.description.toLowerCase();

  // Category match is strong signal
  if (category && product.category === category) {
    score += 10;
  }

  // Keyword matches
  for (const kw of keywords) {
    if (title.includes(kw)) score += 5;
    if (desc.includes(kw)) score += 2;
  }

  // Rating bonus
  if (product.rating) score += product.rating * 0.5;

  // New/bestseller bonus
  if (product.isNew) score += 1;
  if (product.isBestSeller) score += 1;

  return score;
}

export function useAISearch(allProducts: Product[]) {
  const [state, setState] = useState<AISearchState>({
    results: [],
    explanation: '',
    isLoading: false,
    hasMore: false,
    query: '',
  });

  const search = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setState({ results: [], explanation: '', isLoading: false, hasMore: false, query: '' });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, query }));

      // Simulate AI processing delay
      setTimeout(() => {
        const { keywords, maxPrice, minPrice, category } = parseQuery(query);

        // Filter by price first
        const filtered = allProducts.filter((p) => {
          const price = parseFloat(p.final_price);
          if (maxPrice !== null && price > maxPrice) return false;
          if (minPrice !== null && price < minPrice) return false;
          return true;
        });

        // Score and sort by relevance
        const scored = filtered
          .map((p) => ({ product: p, score: scoreProduct(p, keywords, category) }))
          .sort((a, b) => b.score - a.score);

        const results = scored.map((s) => s.product);
        const totalAvailable = results.length;
        const firstPage = results.slice(0, PAGE_SIZE);

        // Build explanation
        const parts: string[] = [];
        if (category) parts.push(`категория «${category}»`);
        if (maxPrice) parts.push(`цена до ${maxPrice} ₽`);
        if (minPrice) parts.push(`цена от ${minPrice} ₽`);
        if (keywords.length > 0) parts.push(`по запросу «${keywords.slice(0, 3).join(', ')}»`);

        const explanation = parts.length > 0
          ? `Найдено ${totalAvailable} товаров: ${parts.join(', ')}.`
          : `Найдено ${totalAvailable} товаров по вашему запросу.`;

        setState({
          results: firstPage,
          explanation,
          isLoading: false,
          hasMore: totalAvailable > PAGE_SIZE,
          query,
        });
      }, 1500 + Math.random() * 1000); // 1.5–2.5s delay
    },
    [allProducts],
  );

  const loadMore = useCallback(() => {
    const { query } = state;
    if (!query.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    setTimeout(() => {
      const { keywords, maxPrice, minPrice, category } = parseQuery(query);

      const filtered = allProducts.filter((p) => {
        const price = parseFloat(p.final_price);
        if (maxPrice !== null && price > maxPrice) return false;
        if (minPrice !== null && price < minPrice) return false;
        return true;
      });

      const scored = filtered
        .map((p) => ({ product: p, score: scoreProduct(p, keywords, category) }))
        .sort((a, b) => b.score - a.score);

      const allResults = scored.map((s) => s.product);
      const nextPage = allResults.slice(0, state.results.length + PAGE_SIZE);

      setState((prev) => ({
        ...prev,
        results: nextPage,
        isLoading: false,
        hasMore: nextPage.length < Math.min(allResults.length, MAX_RESULTS),
      }));
    }, 800);
  }, [state, allProducts]);

  const reset = useCallback(() => {
    setState({ results: [], explanation: '', isLoading: false, hasMore: false, query: '' });
  }, []);

  return { ...state, search, loadMore, reset };
}
