import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cart as cartApi } from "@workspace/api-client-react";

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
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function mapServerCartItem(i: any): CartItem {
  const p = i.product ?? {};
  const images = p.images ?? [];
  return {
    id: String(i.id),
    productId: String(p.id ?? i.product_id ?? ""),
    title: p.title ?? p.name ?? "",
    price: Number(i.price ?? p.price ?? 0),
    quantity: i.quantity ?? 1,
    image: Array.isArray(images) && images.length > 0
      ? (typeof images[0] === "string" ? images[0] : images[0]?.url ?? "")
      : p.image ?? "",
    vendorName: p.vendor?.shopName ?? p.vendor?.shop_name ?? p.vendor_name ?? "",
    variant: i.variant ?? undefined,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data: serverCart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cartApi.get();
      return res;
    },
    staleTime: 30_000,
    retry: 1,
  });

  const addMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      cartApi.addItem({ productId: data.productId, quantity: data.quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const items: CartItem[] = (serverCart as any)?.data?.items?.map(mapServerCartItem)
    ?? (serverCart as any)?.items?.map(mapServerCartItem)
    ?? [];

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isLoading = addMutation.isPending || updateMutation.isPending;

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addMutation.mutate({ productId: item.productId, quantity: item.quantity });
    },
    [addMutation],
  );

  const removeItem = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      removeMutation.mutate(id);
    },
    [removeMutation],
  );

  const updateQuantity = useCallback(
    (id: string, qty: number) => {
      if (qty < 1) {
        removeItem(id);
        return;
      }
      updateMutation.mutate({ itemId: id, quantity: qty });
    },
    [updateMutation, removeItem],
  );

  const clearCart = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

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
