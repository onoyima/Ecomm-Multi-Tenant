import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { useCart } from "@/contexts/CartContext";
import { useProducts, useCategories } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const SORT_OPTIONS = ["Relevance", "Price: Low to High", "Price: High to Low", "Best Rated", "Newest"];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [sort, setSort] = useState(0);
  const [showSort, setShowSort] = useState(false);
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const results = useMemo(() => {
    let list = products;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    if (selectedCat) list = list.filter((p) => p.category === selectedCat);
    if (sort === 1) list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 2) list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 3) list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, selectedCat, sort]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onFilterPress={() => setShowSort(!showSort)}
          autoFocus={false}
        />
      </View>

      {/* Category Pills */}
      <FlatList
        data={[{ id: "all", name: "All", icon: "apps", color: "#5B4EFF" }, ...categories]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.cats}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catPill,
              {
                backgroundColor: (item.name === "All" ? !selectedCat : selectedCat === item.name)
                  ? colors.primary : colors.card,
                borderColor: (item.name === "All" ? !selectedCat : selectedCat === item.name)
                  ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCat(item.name === "All" ? null : item.name)}
          >
            <Text
              style={[
                styles.catText,
                {
                  color: (item.name === "All" ? !selectedCat : selectedCat === item.name)
                    ? "#fff" : colors.foreground,
                },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Sort Bar */}
      {showSort && (
        <View style={[styles.sortBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SORT_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              style={[styles.sortOpt, sort === i && { backgroundColor: colors.primary + "15" }]}
              onPress={() => { setSort(i); setShowSort(false); }}
            >
              <Text style={[styles.sortText, { color: sort === i ? colors.primary : colors.foreground }]}>
                {opt}
              </Text>
              {sort === i && <Feather name="check" size={14} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {results.length} products found
        </Text>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSort(!showSort)}
        >
          <Feather name="bar-chart-2" size={15} color={colors.primary} />
          <Text style={[styles.sortBtnText, { color: colors.primary }]}>{SORT_OPTIONS[sort]}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            horizontal
            onAddToCart={(p) =>
              addItem({ productId: p.id, title: p.title, price: p.price, quantity: 1, image: p.image, vendorName: p.vendorName })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Try different keywords or browse categories
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  cats: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontWeight: "500" as const },
  sortBar: {
    marginHorizontal: 16, borderRadius: 14, borderWidth: 1,
    padding: 8, marginBottom: 8,
  },
  sortOpt: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8,
  },
  sortText: { fontSize: 14 },
  resultsHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 12,
  },
  resultCount: { fontSize: 13 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortBtnText: { fontSize: 13, fontWeight: "500" as const },
  list: { paddingHorizontal: 16 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14, textAlign: "center" },
});
