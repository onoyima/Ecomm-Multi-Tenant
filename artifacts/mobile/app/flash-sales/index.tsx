import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CountdownTimer } from "@/components/CountdownTimer";
import { getActiveFlashSales, FlashSale } from "@/data/mockFlashSales";
import { formatPrice, useProducts } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function FlashSalesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: allProducts = [] } = useProducts();
  const sales = getActiveFlashSales(allProducts);
  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Flash Sales</Text>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20, gap: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="zap-off" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No active flash sales</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Check back soon for more deals!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FlashSaleCard sale={item} onPress={() => router.push(`/product/${item.productId}`)} colors={colors} />
        )}
      />
    </View>
  );
}

function FlashSaleCard({ sale, onPress, colors }: { sale: FlashSale; onPress: () => void; colors: any }) {
  const product = sale.product;
  if (!product) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>-{sale.discountPercent}%</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.label]}>{sale.label}</Text>
        <Text style={[styles.prodTitle, { color: colors.foreground }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.salePrice, { color: colors.accent }]}>{formatPrice(sale.salePrice)}</Text>
          <Text style={[styles.origPrice, { color: colors.mutedForeground }]}>{formatPrice(sale.originalPrice)}</Text>
        </View>
        <View style={styles.timerRow}>
          <Feather name="clock" size={13} color={colors.accent} />
          <CountdownTimer endsAt={sale.endsAt} size="sm" />
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: "center" },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, borderWidth: 1, padding: 12, position: "relative",
  },
  image: { width: 80, height: 80, borderRadius: 12 },
  badge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: "#EF4444", borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  info: { flex: 1, gap: 4 },
  label: { fontSize: 11, fontWeight: "700", color: "#EF4444", textTransform: "uppercase" },
  prodTitle: { fontSize: 14, fontWeight: "600" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  salePrice: { fontSize: 16, fontWeight: "800" },
  origPrice: { fontSize: 12, textDecorationLine: "line-through" },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
});
