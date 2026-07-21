import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function RecentlyViewedScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, clear } = useRecentlyViewed();
  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Recently Viewed</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clear}>
            <Text style={[styles.clearText, { color: colors.destructive }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="clock" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recently viewed items</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Products you view will appear here
            </Text>
            <TouchableOpacity
              style={[styles.shopBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(customer)" as any)}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.itemVendor, { color: colors.mutedForeground }]}>{item.vendorName}</Text>
              <View style={styles.itemBottom}>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={[styles.itemOrigPrice, { color: colors.mutedForeground }]}>
                    {formatPrice(item.originalPrice)}
                  </Text>
                )}
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      />
    </View>
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
  clearText: { fontSize: 14, fontWeight: "600" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: "center" },
  shopBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  shopBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  itemCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, borderWidth: 1, padding: 12,
  },
  itemImage: { width: 64, height: 64, borderRadius: 10 },
  itemInfo: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 15, fontWeight: "600" },
  itemVendor: { fontSize: 12 },
  itemBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemPrice: { fontSize: 15, fontWeight: "700" },
  itemOrigPrice: { fontSize: 12, textDecorationLine: "line-through" },
});
