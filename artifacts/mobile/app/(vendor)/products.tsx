import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/Badge";
import { SearchBar } from "@/components/SearchBar";
import { useVendorProducts, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function VendorProducts() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const { data: vendorProducts = [] } = useVendorProducts();
  const filtered = query
    ? vendorProducts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : vendorProducts;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Products</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add-product")}
        >
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search your products..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.productRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.productImg} contentFit="cover" />
            <View style={styles.productInfo}>
              <Text style={[styles.productTitle, { color: colors.foreground }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.productCat, { color: colors.mutedForeground }]}>{item.category}</Text>
              <View style={styles.productMeta}>
                <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                <Text style={[styles.productStock, { color: item.stock < 10 ? colors.destructive : colors.success }]}>
                  Stock: {item.stock}
                </Text>
              </View>
              <View style={styles.badges}>
                <Badge label="Active" variant="success" size="sm" />
                {item.isDropshipping && <Badge label="Dropship" variant="primary" size="sm" />}
                {item.aiOptimized && <Badge label="AI Optimized" size="sm" />}
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Feather name="edit-2" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Feather name="more-vertical" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="box" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No products yet</Text>
            <TouchableOpacity
              style={[styles.addBtn2, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/add-product")}
            >
              <Text style={styles.addBtn2Text}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: "700" as const },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 100 },
  productRow: {
    flexDirection: "row", borderRadius: 14, borderWidth: 1,
    overflow: "hidden", alignItems: "center",
  },
  productImg: { width: 80, height: 80 },
  productInfo: { flex: 1, padding: 10 },
  productTitle: { fontSize: 14, fontWeight: "600" as const, marginBottom: 2 },
  productCat: { fontSize: 11, marginBottom: 4 },
  productMeta: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 6 },
  productPrice: { fontSize: 14, fontWeight: "700" as const },
  productStock: { fontSize: 12 },
  badges: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  productActions: { paddingRight: 8, gap: 4 },
  actionBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  addBtn2: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  addBtn2Text: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
});
