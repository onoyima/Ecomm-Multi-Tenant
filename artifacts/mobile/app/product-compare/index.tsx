import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// TODO: Wire to products.compare(ids) API when available
import { useProducts, formatPrice, Product } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const COMPARE_FIELDS = [
  { key: "price", label: "Price" },
  { key: "rating", label: "Rating" },
  { key: "vendorName", label: "Vendor" },
  { key: "description", label: "Description" },
  { key: "stock", label: "Stock" },
  { key: "category", label: "Category" },
];

export default function ProductCompareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { data: allProducts = [] } = useProducts();

  const filtered = allProducts.filter(
    (p) =>
      !compareList.find((c) => c.id === p.id) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  const addToCompare = (product: Product) => {
    if (compareList.length >= 3) {
      Alert.alert("Limit Reached", "You can compare up to 3 products at a time.");
      return;
    }
    setCompareList((prev) => [...prev, product]);
    setShowSearch(false);
    setSearch("");
  };

  const removeFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Compare Products</Text>
        <TouchableOpacity onPress={() => setShowSearch(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {compareList.length === 0 && !showSearch ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="bar-chart-2" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Products to Compare</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Add up to 3 products to see a side-by-side comparison</Text>
          <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={() => setShowSearch(true)}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
          {/* Selected Products */}
          <View style={styles.selectedRow}>
            {compareList.map((p) => (
              <View key={p.id} style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: p.image }} style={styles.selectedImg} contentFit="cover" />
                <Text style={[styles.selectedName, { color: colors.foreground }]} numberOfLines={2}>{p.title}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCompare(p.id)}>
                  <Feather name="x" size={14} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
            {compareList.length < 3 && (
              <TouchableOpacity
                style={[styles.addPlaceholder, { borderColor: colors.border }]}
                onPress={() => setShowSearch(true)}
              >
                <Feather name="plus" size={24} color={colors.mutedForeground} />
                <Text style={[styles.addPlaceholderText, { color: colors.mutedForeground }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Panel */}
          {showSearch && (
            <View style={[styles.searchPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.searchInputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="search" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.searchInput, { color: colors.foreground }]}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search products..."
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Feather name="x" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ) : null}
              </View>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.searchItem, { borderBottomColor: colors.border }]}
                    onPress={() => addToCompare(p)}
                  >
                    <Image source={{ uri: p.image }} style={styles.searchItemImg} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.searchItemTitle, { color: colors.foreground }]}>{p.title}</Text>
                      <Text style={[styles.searchItemPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                    </View>
                    <Feather name="plus-circle" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.noResults, { color: colors.mutedForeground }]}>No products found</Text>
              )}
              {compareList.length >= 3 && (
                <Text style={[styles.limitNote, { color: colors.warning }]}>Maximum 3 products reached</Text>
              )}
            </View>
          )}

          {/* Comparison Table */}
          {compareList.length > 0 && (
            <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Image Row */}
              <View style={styles.tableRow}>
                <View style={styles.tableLabel}>
                  <Text style={[styles.tableLabelText, { color: colors.mutedForeground }]}>Image</Text>
                </View>
                {compareList.map((p) => (
                  <View key={p.id} style={styles.tableCell}>
                    <Image source={{ uri: p.image }} style={styles.tableImg} contentFit="cover" />
                  </View>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.tableCell}>
                    <View style={[styles.tableImgPlaceholder, { backgroundColor: colors.muted }]} />
                  </View>
                ))}
              </View>

              {COMPARE_FIELDS.map((field) => (
                <View key={field.key} style={[styles.tableRow, { borderTopColor: colors.border }]}>
                  <View style={styles.tableLabel}>
                    <Text style={[styles.tableLabelText, { color: colors.mutedForeground }]}>{field.label}</Text>
                  </View>
                  {compareList.map((p) => {
                    const val = p[field.key as keyof Product];
                    return (
                      <View key={p.id} style={styles.tableCell}>
                        <Text style={[styles.tableCellText, { color: colors.foreground }]} numberOfLines={3}>
                          {field.key === "price"
                            ? formatPrice(val as number)
                            : field.key === "rating"
                            ? `${val} ⭐`
                            : field.key === "stock"
                            ? `${val} units`
                            : String(val ?? "N/A")}
                        </Text>
                      </View>
                    );
                  })}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.tableCell}>
                      <Text style={[styles.tableCellText, { color: colors.mutedForeground }]}>—</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 16 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700" as const, marginTop: 8 },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
  selectedRow: { flexDirection: "row", gap: 10 },
  selectedCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: "center", gap: 8, position: "relative" },
  selectedImg: { width: "100%", height: 80, borderRadius: 8 },
  selectedName: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  removeBtn: { position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  addPlaceholder: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", height: 150, alignItems: "center", justifyContent: "center", gap: 6 },
  addPlaceholderText: { fontSize: 12 },
  searchPanel: { borderRadius: 16, borderWidth: 1, padding: 12, gap: 8 },
  searchInputWrap: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14 },
  searchItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 0.5 },
  searchItemImg: { width: 44, height: 44, borderRadius: 8 },
  searchItemTitle: { fontSize: 13, fontWeight: "500" as const },
  searchItemPrice: { fontSize: 13, fontWeight: "700" as const, marginTop: 2 },
  noResults: { textAlign: "center", paddingVertical: 12, fontSize: 13 },
  limitNote: { textAlign: "center", fontSize: 12, fontWeight: "500" as const },
  tableCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderTopWidth: 0 },
  tableLabel: { width: 80, paddingHorizontal: 12, paddingVertical: 12, justifyContent: "center" },
  tableLabelText: { fontSize: 12, fontWeight: "600" as const },
  tableCell: { flex: 1, paddingHorizontal: 8, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  tableCellText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  tableImg: { width: 60, height: 60, borderRadius: 8 },
  tableImgPlaceholder: { width: 60, height: 60, borderRadius: 8 },
});
