import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { orderTemplates as orderTemplatesApi } from "@workspace/api-client-react";
import { useProducts, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface OrderTemplate {
  id: string;
  name: string;
  items: { productId: string; quantity: number }[];
  total: number;
  lastUsed: string;
  frequency: string;
}

export default function OrderTemplatesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await orderTemplatesApi.list();
        setTemplates(
          res.data.map((t: { id: string; name: string; items: { productId: string; quantity: number }[]; totalEstimate: number; createdAt: string }) => ({
            id: t.id,
            name: t.name,
            items: t.items.map((i: { productId: string; quantity: number }) => ({ productId: i.productId, quantity: i.quantity })),
            total: t.totalEstimate,
            lastUsed: new Date(t.createdAt).toLocaleDateString(),
            frequency: "Custom",
          })),
        );
      } catch (err) {
        console.error("Failed to load order templates", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { data: allProducts = [] } = useProducts();
  const getProduct = (id: string) => allProducts.find((p) => p.id === id);

  const handleOrderNow = (template: OrderTemplate) => {
    Alert.alert("Order Placed", `Template "${template.name}" (${formatPrice(template.total)}) added to cart successfully!`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Order Templates</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="file-text" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Saved Templates</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Create an order template to quickly reorder your favorite items</Text>
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={17} color="#fff" />
              <Text style={styles.createBtnText}>Create Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          templates.map((template) => (
            <View key={template.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Feather name="file-text" size={18} color={colors.primary} />
                  <Text style={[styles.templateName, { color: colors.foreground }]}>{template.name}</Text>
                </View>
                <View style={[styles.freqBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.freqText, { color: colors.primary }]}>{template.frequency}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {template.items.map((item, i) => {
                  const product = getProduct(item.productId);
                  if (!product) return null;
                  return (
                    <View key={i} style={styles.itemRow}>
                      <Image source={{ uri: product.image }} style={styles.itemImg} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{product.title}</Text>
                        <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>Qty: {item.quantity} × {formatPrice(product.price)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.lastUsed, { color: colors.mutedForeground }]}>Last used: {template.lastUsed}</Text>
                  <Text style={[styles.totalAmount, { color: colors.foreground }]}>Total: {formatPrice(template.total)}</Text>
                </View>
                <TouchableOpacity style={[styles.orderNowBtn, { backgroundColor: colors.primary }]} onPress={() => handleOrderNow(template)}>
                  <Feather name="shopping-cart" size={15} color="#fff" />
                  <Text style={styles.orderNowText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 14 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14, textAlign: "center", paddingHorizontal: 40, lineHeight: 20 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  createBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, paddingBottom: 8 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  templateName: { fontSize: 16, fontWeight: "600" as const },
  freqBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  freqText: { fontSize: 11, fontWeight: "600" as const },
  itemsList: { paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemImg: { width: 40, height: 40, borderRadius: 8 },
  itemName: { fontSize: 13, fontWeight: "500" as const },
  itemQty: { fontSize: 11, marginTop: 2 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderTopWidth: 0.5 },
  lastUsed: { fontSize: 11 },
  totalAmount: { fontSize: 16, fontWeight: "700" as const, marginTop: 2 },
  orderNowBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  orderNowText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
});