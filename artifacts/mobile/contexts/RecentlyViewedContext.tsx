import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface RecentlyViewedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  vendorId: string;
  category: string;
  description: string;
  stock: number;
  tags: string[];
  isDropshipping?: boolean;
  soldCount?: number;
  freeShipping?: boolean;
  aiOptimized?: boolean;
}

interface RecentlyViewedContextType {
  items: RecentlyViewedProduct[];
  addView: (product: RecentlyViewedProduct) => void;
  clear: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

const MAX_ITEMS = 20;
const STORAGE_KEY = "@recently_viewed";

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const persist = (newItems: RecentlyViewedProduct[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const addView = (product: RecentlyViewedProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX_ITEMS);
      persist(next);
      return next;
    });
  };

  const clear = () => {
    setItems([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, addView, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
