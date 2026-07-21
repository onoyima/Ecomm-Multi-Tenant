import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatPrice, Product } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  product: Product;
  onAddToCart?: (p: Product) => void;
  horizontal?: boolean;
  compact?: boolean;
}

export function ProductCard({ product, onAddToCart, horizontal, compact }: Props) {
  const colors = useColors();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWishlisted((v) => !v);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/product/${product.id}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: product.image }} style={styles.compactImage} contentFit="cover" />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={[styles.compactPrice, { color: colors.primary }]}>
            {formatPrice(product.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.hCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/product/${product.id}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: product.image }} style={styles.hImage} contentFit="cover" />
        <View style={styles.hInfo}>
          <Text style={[styles.hVendor, { color: colors.mutedForeground }]}>{product.vendorName}</Text>
          <Text style={[styles.hTitle, { color: colors.foreground }]} numberOfLines={2}>{product.title}</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
              {product.rating} ({product.reviewCount})
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.destructive }]}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {product.isDropshipping && (
          <View style={[styles.dropBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.dropText}>DS</Text>
          </View>
        )}
        <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist}>
          <Feather name="heart" size={16} color={wishlisted ? "#EF4444" : "#fff"} />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={[styles.vendor, { color: colors.mutedForeground }]} numberOfLines={1}>
          {product.vendorName}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={11} color={colors.gold} />
          <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
            {product.rating} ({product.reviewCount})
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(product.price)}</Text>
          {product.originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
        </View>
        {onAddToCart && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAddToCart(product);
            }}
          >
            <Feather name="shopping-cart" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 165,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 160 },
  discountBadge: {
    position: "absolute", top: 8, left: 8,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: "#fff", fontSize: 10, fontWeight: "700" as const },
  dropBadge: {
    position: "absolute", top: 8, right: 34,
    borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  dropText: { color: "#fff", fontSize: 9, fontWeight: "700" as const },
  wishBtn: {
    position: "absolute", top: 6, right: 6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  info: { padding: 10 },
  vendor: { fontSize: 10, marginBottom: 2 },
  title: { fontSize: 13, fontWeight: "600" as const, marginBottom: 4, lineHeight: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
  ratingText: { fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 14, fontWeight: "700" as const },
  originalPrice: { fontSize: 11, textDecorationLine: "line-through" as const },
  addBtn: {
    position: "absolute", bottom: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },
  hCard: {
    flexDirection: "row", borderRadius: 14, overflow: "hidden",
    borderWidth: 1, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  hImage: { width: 100, height: 100 },
  hInfo: { flex: 1, padding: 10, justifyContent: "space-between" },
  hVendor: { fontSize: 10 },
  hTitle: { fontSize: 14, fontWeight: "600" as const, lineHeight: 19 },
  compactCard: {
    width: 110, borderRadius: 10, overflow: "hidden",
    borderWidth: 1, marginRight: 10,
  },
  compactImage: { width: "100%", height: 100 },
  compactInfo: { padding: 8 },
  compactTitle: { fontSize: 11, fontWeight: "600" as const, marginBottom: 2 },
  compactPrice: { fontSize: 12, fontWeight: "700" as const },
});
