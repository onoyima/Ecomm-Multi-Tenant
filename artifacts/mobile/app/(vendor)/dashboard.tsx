import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorStats, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const BAR_WIDTH = (width - 64) / 6 - 6;
const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export default function VendorDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const { data: vendorStats } = useVendorStats();
  const data = vendorStats ?? { totalRevenue: 0, totalOrders: 0, totalProducts: 0, pendingOrders: 0, avgRating: 0, walletBalance: 0, withdrawable: 0, monthlyRevenue: [], topProducts: [] };
  const maxRev = Math.max(...data.monthlyRevenue, 1);

  const stats = [
    { label: "Revenue", value: formatPrice(data.totalRevenue), icon: "trending-up", color: "#10B981", bg: "#DCFCE7" },
    { label: "Orders", value: data.totalOrders.toString(), icon: "shopping-bag", color: "#5B4EFF", bg: "#EEF2FF" },
    { label: "Products", value: data.totalProducts.toString(), icon: "box", color: "#FF6B35", bg: "#FFF3ED" },
    { label: "Rating", value: data.avgRating.toString(), icon: "star", color: "#FFB800", bg: "#FFF8E1" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={["#3A2FD9", "#5B4EFF"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.storeName}>{user?.businessName ?? user?.name}</Text>
            <Text style={styles.storeStatus}>Vendor Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/ai-chat")}
          >
            <Feather name="cpu" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Wallet Summary */}
        <View style={styles.walletRow}>
          <View style={styles.walletItem}>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletValue}>{formatPrice(data.walletBalance)}</Text>
          </View>
          <View style={[styles.walletDivider, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
          <View style={styles.walletItem}>
            <Text style={styles.walletLabel}>Withdrawable</Text>
            <Text style={styles.walletValue}>{formatPrice(data.withdrawable)}</Text>
          </View>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {data.pendingOrders > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push("/(vendor)/orders")}
          >
            <Feather name="alert-circle" size={14} color="#FFB800" />
            <Text style={styles.alertText}>
              {data.pendingOrders} orders need your attention
            </Text>
            <Feather name="chevron-right" size={14} color="#FFB800" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Feather name={s.icon as any} size={18} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Revenue Chart */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Revenue (6 months)</Text>
          <Text style={[styles.cardSub, { color: colors.success }]}>+18% this month</Text>
        </View>
        <View style={styles.chart}>
          {data.monthlyRevenue.map((rev: number, i: number) => {
            const h = Math.max(8, (rev / maxRev) * 100);
            const isLast = i === data.monthlyRevenue.length - 1;
            return (
              <View key={i} style={styles.barContainer}>
                <Text style={[styles.barValue, { color: colors.mutedForeground }]}>
                  {isLast ? `₦${(rev / 1000).toFixed(0)}k` : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: h,
                      width: BAR_WIDTH,
                      backgroundColor: isLast ? colors.primary : colors.muted,
                      borderRadius: 6,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{MONTHS[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Top Products */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Top Products</Text>
          <TouchableOpacity onPress={() => router.push("/(vendor)/products")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {data.topProducts.map((p: string, i: number) => (
          <View key={i} style={[styles.topProductRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.topProductRank, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.topProductRankText, { color: colors.primary }]}>#{i + 1}</Text>
            </View>
            <Text style={[styles.topProductName, { color: colors.foreground }]} numberOfLines={1}>
              {p}
            </Text>
            <Feather name="trending-up" size={14} color={colors.success} />
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { icon: "plus-circle", label: "Add Product", action: () => router.push("/add-product") },
          { icon: "cpu", label: "AI Insights", action: () => router.push("/ai-chat") },
          { icon: "alert-triangle", label: "Stock Alerts", action: () => router.push("/low-stock-alerts") },
          { icon: "map-pin", label: "Shipping Zones", action: () => router.push("/shipping-zones") },
          { icon: "camera", label: "Deliveries", action: () => router.push("/delivery-confirmation") },
          { icon: "download", label: "Bulk Import", action: () => router.push("/bulk-upload" as any) },
          { icon: "bar-chart-2", label: "Analytics", action: () => router.push("/seo-dashboard" as any) },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={a.action}
          >
            <Feather name={a.icon as any} size={22} color={colors.primary} />
            <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  storeName: { fontSize: 22, fontWeight: "700" as const, color: "#fff", marginBottom: 4 },
  storeStatus: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  walletRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  walletItem: { flex: 1 },
  walletLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  walletValue: { fontSize: 18, fontWeight: "700" as const, color: "#fff" },
  walletDivider: { width: 1, height: 36, marginHorizontal: 12 },
  withdrawBtn: {
    backgroundColor: "#FF6B35", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  withdrawBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  alertBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,184,0,0.15)",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  alertText: { flex: 1, fontSize: 12, color: "#FFB800", fontWeight: "500" as const },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: {
    width: (width - 56) / 2, borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 4,
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "700" as const },
  statLabel: { fontSize: 12 },
  card: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600" as const },
  cardSub: { fontSize: 12, fontWeight: "500" as const },
  seeAll: { fontSize: 13, fontWeight: "600" as const },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120 },
  barContainer: { alignItems: "center", gap: 4 },
  bar: {},
  barLabel: { fontSize: 10 },
  barValue: { fontSize: 9 },
  topProductRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, borderBottomWidth: 0.5,
  },
  topProductRank: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  topProductRankText: { fontSize: 12, fontWeight: "700" as const },
  topProductName: { flex: 1, fontSize: 14 },
  quickActions: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  quickAction: {
    width: (width - 52) / 2, borderRadius: 14, borderWidth: 1,
    padding: 16, alignItems: "center", gap: 8,
  },
  quickActionLabel: { fontSize: 13, fontWeight: "600" as const },
});
