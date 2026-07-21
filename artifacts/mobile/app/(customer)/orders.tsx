import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderStatusBadge } from "@/components/Badge";
import { useOrders, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const TABS = ["All", "Active", "Delivered", "Cancelled"];

export default function OrdersScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const { data: orders = [] } = useOrders();

  const filtered = orders.filter((o) => {
    if (tab === 0) return true;
    if (tab === 1) return ["pending", "confirmed", "processing", "shipped"].includes(o.status);
    if (tab === 2) return o.status === "delivered";
    if (tab === 3) return o.status === "cancelled";
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === i && [styles.activeTab, { backgroundColor: colors.background }]]}
            onPress={() => setTab(i)}
          >
            <Text style={[styles.tabText, { color: tab === i ? colors.primary : colors.mutedForeground }]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/order/${item.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.orderTop}>
              <View>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>#{item.id}</Text>
                <Text style={[styles.orderDate, { color: colors.foreground }]}>{item.date}</Text>
              </View>
              <OrderStatusBadge status={item.status} />
            </View>

            <View style={styles.orderItems}>
              {item.items.slice(0, 2).map((p, i) => (
                <View key={i} style={styles.orderItemRow}>
                  <Image source={{ uri: p.image }} style={styles.orderItemImg} contentFit="cover" />
                  <View style={styles.orderItemInfo}>
                    <Text style={[styles.orderItemTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={[styles.orderItemQty, { color: colors.mutedForeground }]}>
                      Qty: {p.qty} · {formatPrice(p.price)}
                    </Text>
                  </View>
                </View>
              ))}
              {item.items.length > 2 && (
                <Text style={[styles.moreItems, { color: colors.mutedForeground }]}>
                  +{item.items.length - 2} more items
                </Text>
              )}
            </View>

            <View style={[styles.orderBottom, { borderTopColor: colors.border }]}>
              <View>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(item.total)}</Text>
              </View>
              {item.trackingNumber && (
                <View style={styles.trackingRow}>
                  <Feather name="truck" size={13} color={colors.success} />
                  <Text style={[styles.trackingText, { color: colors.success }]}>
                    {item.carrier}
                  </Text>
                </View>
              )}
              <View style={styles.detailBtn}>
                <Text style={[styles.detailBtnText, { color: colors.primary }]}>Details</Text>
                <Feather name="chevron-right" size={15} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Your order history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: "700" as const },
  tabs: {
    flexDirection: "row", marginHorizontal: 20, borderRadius: 12,
    padding: 3, marginBottom: 16,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10 },
  activeTab: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: "600" as const },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  orderCard: {
    borderRadius: 16, borderWidth: 1, marginBottom: 14,
    overflow: "hidden",
  },
  orderTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    padding: 14, paddingBottom: 10,
  },
  orderId: { fontSize: 11, marginBottom: 2 },
  orderDate: { fontSize: 14, fontWeight: "600" as const },
  orderItems: { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  orderItemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderItemImg: { width: 44, height: 44, borderRadius: 8 },
  orderItemInfo: { flex: 1 },
  orderItemTitle: { fontSize: 13, fontWeight: "500" as const },
  orderItemQty: { fontSize: 11, marginTop: 2 },
  moreItems: { fontSize: 12, marginTop: 4 },
  orderBottom: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderTopWidth: 1,
  },
  totalLabel: { fontSize: 11 },
  totalValue: { fontSize: 16, fontWeight: "700" as const },
  trackingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  trackingText: { fontSize: 12, fontWeight: "500" as const },
  detailBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  detailBtnText: { fontSize: 13, fontWeight: "600" as const },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14, textAlign: "center" },
});
