import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderStatusBadge } from "@/components/Badge";
import { useVendorOrders, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered"];

export default function VendorOrders() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const { data: vendorOrders = [] } = useVendorOrders();

  const filtered = vendorOrders.filter((o) => {
    if (tab === 0) return true;
    return o.status === TABS[tab].toLowerCase();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Orders</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.countText}>{vendorOrders.length} total</Text>
        </View>
      </View>

      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        contentContainerStyle={styles.tabs}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.tabPill,
              { backgroundColor: tab === index ? colors.primary : colors.muted, borderColor: colors.border },
            ]}
            onPress={() => setTab(index)}
          >
            <Text style={[styles.tabText, { color: tab === index ? "#fff" : colors.mutedForeground }]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>#{item.id}</Text>
                <Text style={[styles.orderDate, { color: colors.foreground }]}>{item.date}</Text>
              </View>
              <View style={styles.orderRight}>
                <OrderStatusBadge status={item.status} />
                <Text style={[styles.orderTotal, { color: colors.primary }]}>{formatPrice(item.total)}</Text>
              </View>
            </View>
            <View style={styles.orderItems}>
              {item.items.map((p, i) => (
                <View key={i} style={styles.orderItemRow}>
                  <Image source={{ uri: p.image }} style={styles.orderItemImg} contentFit="cover" />
                  <Text style={[styles.orderItemTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {p.title} × {p.qty}
                  </Text>
                  <Text style={[styles.orderItemPrice, { color: colors.mutedForeground }]}>
                    {formatPrice(p.price)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={() => router.push(`/vendor-order/${item.id}`)}>
                <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
                  <Feather name="eye" size={13} /> View
                </Text>
              </TouchableOpacity>
              {item.status === "pending" && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                    <Feather name="check" size={13} /> Confirm
                  </Text>
                </TouchableOpacity>
              )}
              {item.status === "confirmed" && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]}>
                  <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                    <Feather name="truck" size={13} /> Ship
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: "700" as const },
  countBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
  tabs: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tabPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: "500" as const },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  orderCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  orderHeader: {
    flexDirection: "row", justifyContent: "space-between",
    padding: 14, paddingBottom: 10,
  },
  orderId: { fontSize: 11 },
  orderDate: { fontSize: 14, fontWeight: "600" as const },
  orderRight: { alignItems: "flex-end", gap: 6 },
  orderTotal: { fontSize: 16, fontWeight: "700" as const },
  orderItems: { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  orderItemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderItemImg: { width: 36, height: 36, borderRadius: 8 },
  orderItemTitle: { flex: 1, fontSize: 13 },
  orderItemPrice: { fontSize: 12 },
  orderFooter: {
    flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, justifyContent: "flex-end",
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: "600" as const },
});
