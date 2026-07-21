import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function CartScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalAmount, removeItem, updateQuantity } = useCart();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const shipping = totalAmount > 50000 ? 0 : 2500;
  const total = totalAmount + shipping;

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>My Cart</Text>
        </View>
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="shopping-cart" size={40} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Discover amazing products and add them here
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(customer)/home")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>My Cart</Text>
        <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.cartImage} contentFit="cover" />
            <View style={styles.cartInfo}>
              <Text style={[styles.cartTitle, { color: colors.foreground }]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.variant && (
                <Text style={[styles.cartVariant, { color: colors.mutedForeground }]}>{item.variant}</Text>
              )}
              <Text style={[styles.cartVendor, { color: colors.mutedForeground }]}>{item.vendorName}</Text>
              <View style={styles.cartBottom}>
                <Text style={[styles.cartPrice, { color: colors.primary }]}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Feather name="minus" size={14} color={colors.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Feather name="plus" size={14} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Checkout Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: botPad + 16 }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatPrice(totalAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: shipping === 0 ? colors.success : colors.foreground }]}>
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  pageTitle: { fontSize: 24, fontWeight: "700" as const },
  itemCount: { fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyIcon: {
    width: 90, height: 90, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" as const },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  shopBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14,
  },
  shopBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
  cartItem: {
    flexDirection: "row", borderRadius: 14, borderWidth: 1,
    marginBottom: 12, overflow: "hidden",
  },
  cartImage: { width: 90, height: 100 },
  cartInfo: { flex: 1, padding: 10 },
  cartTitle: { fontSize: 13, fontWeight: "600" as const, lineHeight: 18, marginBottom: 2 },
  cartVariant: { fontSize: 11, marginBottom: 2 },
  cartVendor: { fontSize: 11, marginBottom: 8 },
  cartBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cartPrice: { fontSize: 15, fontWeight: "700" as const },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 14, fontWeight: "600" as const, minWidth: 20, textAlign: "center" },
  removeBtn: { padding: 10, alignSelf: "flex-start" },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 16,
    gap: 8,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "500" as const },
  totalRow: { marginTop: 4, marginBottom: 4 },
  totalLabel: { fontSize: 17, fontWeight: "700" as const },
  totalValue: { fontSize: 20, fontWeight: "700" as const },
  checkoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 54, borderRadius: 16, marginTop: 4,
  },
  checkoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
});
