import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { cart as cartApi } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string; 
  productId: string; 
  title: string; 
  price: number;
  quantity: number; 
  image: string; 
  vendorName: string; 
  variant?: string;
}

interface CartContextType {
  items: CartItem[]; 
  totalItems: number; 
  totalAmount: number;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>; 
  updateQuantity: (id: string, qty: number) => Promise<void>; 
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await cartApi.get();
      const data = (res as any).data ?? res;
      if (data && data.items) {
        setItems(data.items.map((i: any) => ({
          id: i.id.toString(),
          productId: i.product_id?.toString() || i.productId?.toString(),
          title: i.product?.title || i.title || "Product",
          price: i.price,
          quantity: i.quantity,
          image: i.product?.images?.[0] || i.image || "",
          vendorName: i.product?.vendor?.shop_name || i.vendorName || "Vendor",
          variant: i.variant,
        })));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (item: Omit<CartItem, "id">) => {
    if (!isAuthenticated) {
      // Local fallback for guest
      setItems((prev) => {
        const ex = prev.find((i) => i.productId === item.productId && i.variant === item.variant);
        return ex
          ? prev.map((i) => (i.productId === item.productId && i.variant === item.variant ? { ...i, quantity: i.quantity + item.quantity } : i))
          : [...prev, { ...item, id: Date.now().toString() }];
      });
      return;
    }

    try {
      await cartApi.addItem({
        productId: item.productId,
        quantity: item.quantity,
      });
      await fetchCart();
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  }, [isAuthenticated, fetchCart]);

  const removeItem = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    try {
      await cartApi.removeItem(id);
      await fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  }, [isAuthenticated, fetchCart]);

  const updateQuantity = useCallback(async (id: string, qty: number) => {
    if (qty < 1) { 
      return removeItem(id); 
    }
    if (!isAuthenticated) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
      return;
    }
    try {
      await cartApi.updateItem(id, { quantity: qty });
      await fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  }, [isAuthenticated, fetchCart, removeItem]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    try {
      await cartApi.clear();
      await fetchCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  }, [isAuthenticated, fetchCart]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
  
  return (
    <CartContext.Provider value={{ items, totalItems, totalAmount, isLoading, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { 
  const ctx = useContext(CartContext); 
  if (!ctx) throw new Error("useCart must be used within CartProvider"); 
  return ctx; 
}
