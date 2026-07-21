import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/contexts/CartContext";
import { useWishlist, useRemoveFromWishlist, useAddToWishlist, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function WishlistScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const { data: wishlistItems = [], isLoading } = useWishlist();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const toggle = (productId: string) => {
    const existing = wishlistItems.find((i: any) =>
      String(i.product?.id ?? i.productId ?? i.product_id) === productId
    );
    if (existing) {
      removeFromWishlist(existing.id);
    } else {
      addToWishlist({ productId });
    }
  };

  const remove = (wishlistId: string) => removeFromWishlist(wishlistId);

  const handleAddToCart = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    if (item) {
      addItem({ productId, title: item.title, price: item.price, image: item.image, vendorName: item.vendorName, quantity: 1 });
    }
  };

  const items = wishlistItems.map((wi: any) => {
    const p = wi.product ?? wi;
    const images = p.images ?? [];
    return {
      id: p.id,
      title: p.title ?? p.name ?? "",
      price: Number(p.price),
      originalPrice: p.originalPrice ?? p.original_price ? Number(p.originalPrice ?? p.original_price) : undefined,
      image: Array.isArray(images) && images.length > 0
        ? (typeof images[0] === "string" ? images[0] : images[0]?.url ?? "")
        : p.image ?? "",
      vendorName: p.vendor?.shopName ?? p.vendor?.shop_name ?? "",
      rating: Number(p.rating ?? 0),
      reviewCount: Number(p.reviewCount ?? p.review_count ?? 0),
      wishlistId: wi.id,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Wishlist</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{items.length} items</Text>
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={56} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Save items you love for later</Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(customer)/home")}
          >
            <Text style={styles.exploreBtnText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 100 }}>
          {items.map((p) => {
            const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <Image source={{ uri: p.image }} style={styles.img} contentFit="cover" />
                <View style={styles.info}>
                  <Text style={[styles.vendor, { color: colors.mutedForeground }]}>{p.vendorName}</Text>
                  <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>{p.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                    {discount > 0 && (
                      <View style={[styles.discBadge, { backgroundColor: "#FEE2E2" }]}>
                        <Text style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>-{discount}%</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.starRow}>
                    <Feather name="star" size={12} color="#FFB800" />
                    <Text style={[styles.rating, { color: colors.mutedForeground }]}>{p.rating} ({p.reviewCount})</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.cartBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleAddToCart(p.id)}
                  >
                    <Feather name="shopping-cart" size={13} color="#fff" />
                    <Text style={styles.cartBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => remove(p.id)}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "700" },
  count: { fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySub: { fontSize: 14 },
  exploreBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 },
  exploreBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    flexDirection: "row", borderRadius: 16, borderWidth: 1,
    overflow: "hidden", position: "relative",
  },
  img: { width: 110, height: 130 },
  info: { flex: 1, padding: 12, gap: 4 },
  vendor: { fontSize: 11 },
  name: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700" },
  discBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  starRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 11 },
  cartBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 6, alignSelf: "flex-start",
  },
  cartBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  removeBtn: {
    position: "absolute", top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
});
