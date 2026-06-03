import { create } from 'zustand';

const CART_KEY = 'cart_items';

export interface CartItem {
  id: number;
  title: string;
  price: string;
  final_price: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isOpen: false,

  addItem: (item, quantity = 1) => {
    const items = [...get().items];
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ ...item, quantity });
    }
    saveCart(items);
    set({ items });
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    saveCart(items);
    set({ items });
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeItem(id);
      return;
    }
    const items = get().items.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );
    saveCart(items);
    set({ items });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + parseFloat(i.final_price) * i.quantity, 0),
}));
