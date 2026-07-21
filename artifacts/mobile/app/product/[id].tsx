import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/Badge";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useProduct, formatPrice, useProductReviews, useCreateReview } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const { addView } = useRecentlyViewed();
  const { data: product } = useProduct(id ?? "");

  React.useEffect(() => {
    if (product) addView({ id: product.id, title: product.title, price: product.price, image: product.image, rating: product.rating, vendorName: product.vendorName, vendorId: product.vendorId, reviewCount: product.reviewCount, category: product.category, description: product.description, stock: product.stock, tags: product.tags });
  }, [product?.id]);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  if (!product) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Product not found</Text>
      </View>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const variantString = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: qty,
      image: product.image,
      vendorName: product.vendorName,
      variant: variantString || undefined,
    });
    Alert.alert("Added to Cart", `${product.title} added successfully!`, [
      { text: "View Cart", onPress: () => router.push("/(customer)/cart") },
      { text: "Continue Shopping", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
          {discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.wishBtn, { backgroundColor: colors.card }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWishlisted((v) => !v); }}
          >
            <Feather name="heart" size={20} color={wishlisted ? "#EF4444" : colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={[styles.vendor, { color: colors.primary }]}>{product.vendorName}</Text>
            <View style={styles.ratingRow}>
              <Feather name="star" size={14} color={colors.gold} />
              <Text style={[styles.rating, { color: colors.foreground }]}>{product.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
                ({product.reviewCount} reviews)
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>{product.title}</Text>

          {/* Badges */}
          <View style={styles.badges}>
            {product.isDropshipping && <Badge label="Dropshipped" variant="primary" size="sm" />}
            {product.aiOptimized && <Badge label="AI Optimized" size="sm" />}
            <Badge label={product.stock < 10 ? `Only ${product.stock} left` : "In Stock"} variant={product.stock < 10 ? "warning" : "success"} size="sm" />
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Variants */}
          {product.variants?.map((v) => (
            <View key={v.label} style={styles.variantSection}>
              <Text style={[styles.variantLabel, { color: colors.foreground }]}>{v.label}</Text>
              <View style={styles.variantOptions}>
                {v.options.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.variantOption,
                      {
                        borderColor: selectedVariants[v.label] === opt ? colors.primary : colors.border,
                        backgroundColor: selectedVariants[v.label] === opt ? colors.primary + "10" : colors.card,
                      },
                    ]}
                    onPress={() => setSelectedVariants((prev) => ({ ...prev, [v.label]: opt }))}
                  >
                    <Text style={[
                      styles.variantOptionText,
                      { color: selectedVariants[v.label] === opt ? colors.primary : colors.foreground },
                    ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Quantity */}
          <View style={styles.qtyRow}>
            <Text style={[styles.qtyLabel, { color: colors.foreground }]}>Quantity</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={[styles.qtyBtn, { borderColor: colors.border }]}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Feather name="minus" size={16} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.foreground }]}>{qty}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { borderColor: colors.border }]}
                onPress={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                <Feather name="plus" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={[styles.descSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>{product.description}</Text>
          </View>

          {/* Shipping Info */}
          <View style={[styles.shippingRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="truck" size={16} color={colors.success} />
            <Text style={[styles.shippingText, { color: colors.foreground }]}>
              Free delivery on orders over ₦50,000
            </Text>
          </View>

          {product.isDropshipping && (
            <View style={[styles.shippingRow, { backgroundColor: "#FFF3ED", borderColor: "#FF6B3530" }]}>
              <Feather name="clock" size={16} color={colors.accent} />
              <Text style={[styles.shippingText, { color: colors.foreground }]}>
                Dropshipped item: 15–30 day delivery
              </Text>
            </View>
          )}

          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.tags.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{t}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <ReviewsSection productId={id ?? ""} />
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.cta, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.ctaPrice}>
          <Text style={[styles.ctaTotalLabel, { color: colors.mutedForeground }]}>Total</Text>
          <Text style={[styles.ctaTotalValue, { color: colors.primary }]}>
            {formatPrice(product.price * qty)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
        >
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const colors = useColors();
  const { data: reviews = [] } = useProductReviews(productId);
  const createReview = useCreateReview();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!comment.trim()) return;
    createReview.mutate({ productId, rating, body: comment });
    setShowForm(false);
    setComment("");
    setRating(5);
  };

  return (
    <View style={{ paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={[styles.descTitle, { color: colors.foreground }]}>Reviews ({reviews.length})</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Feather name={showForm ? "x" : "plus"} size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Feather name="star" size={22} color={s <= rating ? colors.gold || "#F59E0B" : colors.border} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={{ backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 80, textAlignVertical: "top", color: colors.foreground, fontSize: 14 }}
            value={comment}
            onChangeText={setComment}
            placeholder="Write your review..."
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
          <TouchableOpacity
            style={{ backgroundColor: createReview.isPending ? colors.muted : colors.primary, borderRadius: 12, height: 46, alignItems: "center", justifyContent: "center", marginTop: 8 }}
            onPress={handleSubmit}
            disabled={createReview.isPending}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{createReview.isPending ? "Submitting..." : "Submit Review"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {reviews.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>No reviews yet. Be the first!</Text>
      ) : reviews.slice(0, 3).map((r: any) => (
        <View key={r.id} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontWeight: "600", fontSize: 13, color: colors.foreground }}>{r.user?.name || "Anonymous"}</Text>
            <View style={{ flexDirection: "row", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Feather key={i} name="star" size={12} color={i < (r.rating || 0) ? colors.gold || "#F59E0B" : colors.border} />
              ))}
            </View>
          </View>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 18 }}>{r.comment || r.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16 },
  imageContainer: { position: "relative" },
  image: { width, height: 320 },
  discountBadge: {
    position: "absolute", top: 12, left: 12,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: "#fff", fontSize: 13, fontWeight: "700" as const },
  wishBtn: {
    position: "absolute", top: 12, right: 12,
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  content: { padding: 20 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vendor: { fontSize: 13, fontWeight: "600" as const },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 14, fontWeight: "600" as const },
  reviewCount: { fontSize: 12 },
  title: { fontSize: 20, fontWeight: "700" as const, lineHeight: 27, marginBottom: 10 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  price: { fontSize: 26, fontWeight: "700" as const },
  originalPrice: { fontSize: 16, textDecorationLine: "line-through" as const },
  variantSection: { marginBottom: 16 },
  variantLabel: { fontSize: 14, fontWeight: "600" as const, marginBottom: 8 },
  variantOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  variantOptionText: { fontSize: 13, fontWeight: "500" as const },
  qtyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  qtyLabel: { fontSize: 15, fontWeight: "600" as const },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 14 },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 16, fontWeight: "700" as const, minWidth: 24, textAlign: "center" },
  descSection: { paddingTop: 20, borderTopWidth: 1, marginBottom: 16 },
  descTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 8 },
  desc: { fontSize: 14, lineHeight: 22 },
  shippingRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10,
  },
  shippingText: { flex: 1, fontSize: 13 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12 },
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    padding: 16, borderTopWidth: 1, gap: 16,
  },
  ctaPrice: {},
  ctaTotalLabel: { fontSize: 11 },
  ctaTotalValue: { fontSize: 20, fontWeight: "700" as const },
  addToCartBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 14,
  },
  addToCartText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
});
