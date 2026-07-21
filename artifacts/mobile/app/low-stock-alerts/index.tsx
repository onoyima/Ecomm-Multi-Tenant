import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVendorProducts, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const DEFAULT_THRESHOLD = 15;

export default function LowStockAlertsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;
  const { data: vendorProducts = [] } = useVendorProducts();

  const lowStock = vendorProducts.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
  const thresholds = [5, 10, 15, 20, 30];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Low Stock Alerts</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{lowStock.length} products</Text>
      </View>

      <View style={styles.thresholdRow}>
        <Text style={[styles.thresholdLabel, { color: colors.mutedForeground }]}>Threshold:</Text>
        {thresholds.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.thresholdChip,
              { backgroundColor: threshold === t ? colors.primary : colors.muted, borderColor: colors.border },
            ]}
            onPress={() => setThreshold(t)}
          >
            <Text style={[styles.thresholdChipText, { color: threshold === t ? "#fff" : colors.foreground }]}>
              ≤ {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={lowStock}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="check-circle" size={48} color={colors.success} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All stocked up!</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              No products below the threshold
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isCritical = item.stock <= 5;
          return (
            <TouchableOpacity
              style={[styles.itemCard, { backgroundColor: colors.card, borderColor: isCritical ? colors.destructive + "40" : colors.border }]}
              onPress={() => router.push(`/product/${item.id}`)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.itemVendor, { color: colors.mutedForeground }]}>{item.vendorName}</Text>
                <View style={styles.itemBottom}>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                  <View style={[styles.stockBadge, { backgroundColor: isCritical ? colors.destructive + "15" : colors.warning + "15" }]}>
                    <Text style={[styles.stockBadgeText, { color: isCritical ? colors.destructive : colors.warning }]}>
                      Stock: {item.stock}
                    </Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  count: { fontSize: 14 },
  thresholdRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingBottom: 12,
  },
  thresholdLabel: { fontSize: 13, fontWeight: "500" },
  thresholdChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1,
  },
  thresholdChipText: { fontSize: 12, fontWeight: "600" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  emptySub: { fontSize: 14 },
  itemCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, borderWidth: 1, padding: 12,
  },
  itemImage: { width: 60, height: 60, borderRadius: 10 },
  itemInfo: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 15, fontWeight: "600" },
  itemVendor: { fontSize: 12 },
  itemBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stockBadgeText: { fontSize: 11, fontWeight: "600" },
});
