import { useState, useCallback } from 'react';
import type { Product } from './useProducts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
  isTyping?: boolean;
}

interface ParsedContext {
  category: string | null;
  purpose: string | null;
  quantity: string | null;
  season: string | null;
  priceRange: string | null;
  rawKeywords: string[];
}

function parseContext(messages: ChatMessage[]): ParsedContext {
  const userTexts = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.text.toLowerCase())
    .join(' ');

  const ctx: ParsedContext = {
    category: null,
    purpose: null,
    quantity: null,
    season: null,
    priceRange: null,
    rawKeywords: [],
  };

  // Category detection
  const categories: Record<string, string[]> = {
    'палатк': ['палатк', 'тент', 'шатёр'],
    'наушник': ['наушник', 'гарнитур', 'headphone'],
    'зарядк': ['зарядк', 'повербанк', 'powerbank'],
    'клавиатур': ['клавиатур'],
    'мышь': ['мышь', 'мыш'],
    'чехол': ['чехол'],
    'кабел': ['кабел', 'провод'],
    'монитор': ['монитор'],
    'камера': ['камера', 'веб-кам'],
    'пылесос': ['пылесос'],
    'фитнес': ['фитнес', 'трекер', 'браслет'],
    'ssd': ['ssd', 'накопител'],
  };

  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => userTexts.includes(kw))) {
      ctx.category = cat;
      break;
    }
  }

  // Purpose / use case
  if (userTexts.includes('поход') || userTexts.includes('горы') || userTexts.includes('туризм')) {
    ctx.purpose = 'туризм';
  } else if (userTexts.includes('кемпинг') || userTexts.includes('лагерь')) {
    ctx.purpose = 'кемпинг';
  } else if (userTexts.includes('дом') || userTexts.includes('квартир')) {
    ctx.purpose = 'дом';
  } else if (userTexts.includes('работ') || userTexts.includes('офис')) {
    ctx.purpose = 'работа';
  } else if (userTexts.includes('спорт') || userTexts.includes('тренировк')) {
    ctx.purpose = 'спорт';
  } else if (userTexts.includes('шумоподавл') || userTexts.includes('тишин') || userTexts.includes('музык')) {
    ctx.purpose = 'музыка';
  } else if (userTexts.includes('игр') || userTexts.includes('гейминг')) {
    ctx.purpose = 'игры';
  }

  // Quantity
  const qtyMatch = userTexts.match(/(\d+)\s*(человек|чел|шт)/);
  if (qtyMatch) ctx.quantity = qtyMatch[1];
  else if (userTexts.includes('один') || userTexts.includes('1')) ctx.quantity = '1';
  else if (userTexts.includes('два') || userTexts.includes('дво') || userTexts.includes('2')) ctx.quantity = '2';
  else if (userTexts.includes('три') || userTexts.includes('тро') || userTexts.includes('3')) ctx.quantity = '3';

  // Season
  if (userTexts.includes('лето') || userTexts.includes('летн')) ctx.season = 'лето';
  else if (userTexts.includes('зима') || userTexts.includes('зимн')) ctx.season = 'зима';
  else if (userTexts.includes('весна') || userTexts.includes('весен')) ctx.season = 'весна';
  else if (userTexts.includes('осень') || userTexts.includes('осен')) ctx.season = 'осень';

  // Price
  const priceMatch = userTexts.match(/до\s+(\d+)/);
  if (priceMatch) ctx.priceRange = `до ${priceMatch[1]} ₽`;

  return ctx;
}

function generateResponse(
  userText: string,
  context: ParsedContext,
  allProducts: Product[],
  allMessages: ChatMessage[],
): { text: string; products: Product[]; nextQuestion: string | null } {
  const lower = userText.toLowerCase();

  // Detect what the user just said in this message
  const detectedCategory = detectCategory(lower);
  const detectedPurpose = detectPurpose(lower);

  // Step 1: No category yet — ask about purpose
  if (!context.category) {
    if (detectedCategory) {
      return {
        text: `Отлично! Вы ищете ${detectedCategory}. Для чего вам это нужно? 🎵 Музыка, работа, игры или что-то другое?`,
        products: [],
        nextQuestion: 'purpose',
      };
    }
    return {
      text: 'Привет! Я помогу подобрать товары. Что вы ищете? Например: наушники, клавиатура, мышь...',
      products: [],
      nextQuestion: 'category',
    };
  }

  // Step 2: Has category but no purpose yet — ask about specifics
  if (context.category && !context.purpose) {
    if (detectedPurpose) {
      const questions = getSpecificQuestions(context.category, detectedPurpose);
      return {
        text: `Понял! ${capitalize(context.category)} для ${detectedPurpose}. ${questions}`,
        products: [],
        nextQuestion: 'specifics',
      };
    }
    return {
      text: `Хорошо, вам нужны ${context.category}. Для чего вы планируете их использовать? 🎵 Музыка, работа, игры?`,
      products: [],
      nextQuestion: 'purpose',
    };
  }

  // Step 3: Has category + purpose — now search
  if (context.category && context.purpose) {
    // Update purpose if user specified a new one
    const effectivePurpose = detectedPurpose || context.purpose;
    const qty = detectQuantity(lower);

    const products = findProducts(allProducts, { ...context, purpose: effectivePurpose });
    if (products.length > 0) {
      const qtyText = qty ? `, ${qty} чел` : '';
      return {
        text: `Отлично! Подбираю ${context.category} для ${effectivePurpose}${qtyText}...`,
        products: products.slice(0, 4),
        nextQuestion: null,
      };
    }
    // No products found — fall through to fallback
  }

  // Has enough context — search
  let products = findProducts(allProducts, context);

  // Fallback 1: search by keywords in title/description
  if (products.length === 0) {
    const allUserText = allMessages
      .filter((m: ChatMessage) => m.role === 'user')
      .map((m: ChatMessage) => m.text.toLowerCase())
      .join(' ');

    const stopWords = new Set(['мне', 'нужен', 'нужна', 'нужны', 'хочу', 'найти', 'подобрать', 'для', 'что', 'как', 'где', 'есть', 'можно', 'пожалуйста', 'с', 'и', 'или', 'в', 'на', 'от', 'до', 'по', 'за', 'из', 'руб', 'рублей', '₽', 'цена', 'стоимость', 'бюджет', 'чел', 'человека', 'шт', 'штук']);

    const keywords = allUserText
      .replace(/[^\wа-яё\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    if (keywords.length > 0) {
      products = allProducts
        .filter((p) => {
          const text = `${p.title} ${p.description}`.toLowerCase();
          return keywords.some((kw) => text.includes(kw));
        })
        .slice(0, 4);
    }
  }

  // Fallback 2: show random products as recommendations
  if (products.length === 0) {
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
    products = shuffled.slice(0, 4);
  }

  const ctxDesc = [
    context.category,
    context.purpose && `для ${context.purpose}`,
    context.quantity && `${context.quantity} чел`,
    context.season && context.season,
  ].filter(Boolean).join(', ');

  const introText = products.length > 0
    ? (ctxDesc
      ? `Нашёл ${products.length} подходящих товаров (${ctxDesc}):`
      : `Вот что могу предложить по вашему запросу:`)
    : 'К сожалению, не удалось найти подходящие товары.';

  return {
    text: introText,
    products: products.slice(0, 4),
    nextQuestion: null,
  };
}

function findProducts(allProducts: Product[], ctx: ParsedContext): Product[] {
  return allProducts.filter((p) => {
    const text = `${p.title} ${p.description}`.toLowerCase();
    let match = true;

    if (ctx.category) {
      const catKeywords: Record<string, string[]> = {
        'палатка': ['палатка', 'тент'],
        'наушники': ['наушник', 'гарнитур'],
        'зарядка': ['зарядка', 'повербанк'],
        'клавиатура': ['клавиатур'],
        'мышь': ['мышь'],
        'чехол': ['чехол'],
        'кабель': ['кабель'],
        'монитор': ['монитор'],
        'камера': ['камера', 'веб-кам'],
        'пылесос': ['пылесос'],
        'фитнес': ['фитнес', 'трекер', 'браслет'],
        'ssd': ['ssd', 'накопитель'],
      };
      const kws = catKeywords[ctx.category] || [ctx.category];
      match = kws.some((kw) => text.includes(kw) || (p.categories?.[0]?.title && p.categories?.[0]?.title.toLowerCase().includes(kw)));
    }

    if (ctx.purpose === 'туризм' || ctx.purpose === 'кемпинг') {
      match = match && (text.includes('турист') || text.includes('поход') || text.includes('кемпинг') || text.includes('портативн') || text.includes('компакт'));
    }

    if (ctx.purpose === 'музыка') {
      match = match && (text.includes('шумоподавл') || text.includes('звук') || text.includes('музык') || text.includes('bluetooth') || text.includes('беспровод'));
    }

    if (ctx.purpose === 'игры') {
      match = match && (text.includes('игр') || text.includes('gaming') || text.includes('rgb') || text.includes('подсветк'));
    }

    return match;
  });
}

function detectCategory(text: string): string | null {
  const map: Record<string, string> = {
    'палатка': 'палатку', 'тент': 'палатку', 'шатёр': 'палатку',
    'наушник': 'наушники', 'гарнитур': 'наушники',
    'зарядка': 'зарядку', 'повербанк': 'повербанк',
    'клавиатур': 'клавиатуру',
    'мышь': 'мышь',
    'чехол': 'чехол',
    'кабель': 'кабель',
    'монитор': 'монитор',
    'камера': 'камеру', 'веб-кам': 'веб-камеру',
    'пылесос': 'пылесос',
    'фитнес': 'фитнес-трекер', 'трекер': 'фитнес-трекер', 'браслет': 'фитнес-трекер',
    'ssd': 'SSD накопитель',
  };
  for (const [key, value] of Object.entries(map)) {
    if (text.includes(key)) return value;
  }
  return null;
}

function detectPurpose(text: string): string | null {
  if (text.includes('поход') || text.includes('горы') || text.includes('туризм')) return 'туризм';
  if (text.includes('кемпинг') || text.includes('лагерь')) return 'кемпинг';
  if (text.includes('дом') || text.includes('квартир')) return 'дом';
  if (text.includes('работ') || text.includes('офис')) return 'работа';
  if (text.includes('спорт') || text.includes('тренировк')) return 'спорт';
  return null;
}

function detectQuantity(text: string): string | null {
  if (text.includes('один') || text.includes('1 чел') || text.includes('одного')) return '1';
  if (text.includes('два') || text.includes('дво') || text.includes('2 чел')) return '2';
  if (text.includes('три') || text.includes('тро') || text.includes('3 чел')) return '3';
  const match = text.match(/(\d+)\s*чел/);
  if (match) return match[1];
  return null;
}

function getSpecificQuestions(category: string, _purpose: string): string {
  const questions: Record<string, string> = {
    'палатк': 'Сколько человек должно поместиться? И в какое время года планируете использовать?',
    'наушник': 'Важен ли вам активный шумоподавление? Какой бюджет?',
    'зарядк': 'Какая ёмкость нужна? Для телефона или ноутбука?',
    'клавиатур': 'Механическая или мембранная? Нужна ли RGB подсветка?',
    'мышь': 'Для работы или игр? Проводная или беспроводная?',
  };
  return questions[category] || 'Есть ли какие-то особые требования?';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let messageIdCounter = 0;
function nextId(): string {
  return `msg-${++messageIdCounter}`;
}

export function useAIChat(allProducts: Product[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        text: text.trim(),
      };

      const typingMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        text: '',
        isTyping: true,
      };

      setMessages((prev) => [...prev, userMsg, typingMsg]);
      setIsLoading(true);

      // Simulate thinking delay
      setTimeout(() => {
        const context = parseContext([...messages, userMsg]);
        const response = generateResponse(text, context, allProducts, [...messages, userMsg]);

        const assistantMsg: ChatMessage = {
          id: typingMsg.id,
          role: 'assistant',
          text: response.text,
          products: response.products,
          isTyping: false,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === typingMsg.id ? assistantMsg : m)),
        );
        setIsLoading(false);
      }, 1000 + Math.random() * 1500);
    },
    [messages, isLoading, allProducts],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
}
