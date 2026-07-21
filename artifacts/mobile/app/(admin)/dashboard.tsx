import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { admin as adminApi } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.dashboard();
        setDashboard(res.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = dashboard
    ? [
        { label: "Total Revenue", value: formatPrice(dashboard.totalRevenue ?? 0), icon: "trending-up", color: "#10B981", bg: "#DCFCE7", change: "" },
        { label: "Active Vendors", value: String(dashboard.totalVendors ?? 0), icon: "briefcase", color: "#5B4EFF", bg: "#EEF2FF", change: "" },
        { label: "Total Orders", value: String(dashboard.totalOrders ?? 0), icon: "shopping-bag", color: "#FF6B35", bg: "#FFF3ED", change: "" },
        { label: "Active Users", value: String(dashboard.totalUsers ?? 0), icon: "users", color: "#EC4899", bg: "#FDF2F8", change: "" },
      ]
    : [];

  const alerts = dashboard
    ? [
        ...(dashboard.pendingDisputes > 0 ? [{ type: "error" as const, text: `${dashboard.pendingDisputes} active disputes need resolution`, icon: "alert-triangle" as const }] : []),
        { type: "info" as const, text: `Platform running — ${dashboard.totalOrders ?? 0} total orders`, icon: "calendar" as const },
      ]
    : [];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#5B4EFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
    >
      <LinearGradient colors={["#0B0B1E", "#1E1E3A"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.adminLabel}>Admin Panel</Text>
            <Text style={styles.adminTitle}>Platform Control</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => { logout(); router.replace("/(auth)/welcome"); }}
          >
            <Feather name="log-out" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Alerts */}
        <View style={styles.alerts}>
          {alerts.map((a, i) => (
            <TouchableOpacity key={i} style={[
              styles.alertRow,
              { backgroundColor: (a as any).type === "error" ? "#FEE2E220" : (a as any).type === "warning" ? "#FEF9C320" : "#EEF2FF20" },
            ]}>
              <Feather
                name={a.icon as any}
                size={14}
                color={(a as any).type === "error" ? "#EF4444" : (a as any).type === "warning" ? "#F59E0B" : "#5B4EFF"}
              />
              <Text style={[styles.alertText, {
                color: (a as any).type === "error" ? "#EF4444" : (a as any).type === "warning" ? "#F59E0B" : "#A5B4FC",
              }]}>{a.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Feather name={s.icon as any} size={18} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            <Text style={[styles.statChange, { color: colors.success }]}>{s.change} this month</Text>
          </View>
        ))}
      </View>

      {[
        { title: "Vendor Management", items: [
          { label: "Pending KYC (5)", route: "/commissions" },
          { label: "Suspend Vendor", route: "/commissions" },
          { label: "Commission Config", route: "/commissions" },
          { label: "Vendor Performance", route: "/commissions" },
        ]},
        { title: "Financial Controls", items: [
          { label: "Escrow Overview", route: "/escrow" },
          { label: "Payout Processing", route: "/payouts" },
          { label: "Dispute Resolution", route: "/(admin)/disputes" },
          { label: "Revenue Reports", route: "/commissions" },
        ]},
        { title: "Platform Management", items: [
          { label: "Fraud Monitoring", route: "/(admin)/fraud" },
          { label: "Content Moderation", route: "/(admin)/moderation" },
          { label: "Commission Rates", route: "/commissions" },
          { label: "System Health", route: "/(admin)/dashboard" },
        ]},
      ].map((section) => (
        <View key={section.title} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
          <View style={styles.sectionItems}>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.sectionItem, { borderColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <Text style={[styles.sectionItemText, { color: colors.foreground }]}>{item.label}</Text>
                <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  adminLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: 1, marginBottom: 4 },
  adminTitle: { fontSize: 24, fontWeight: "700" as const, color: "#fff" },
  logoutBtn: { padding: 8 },
  alerts: { gap: 8 },
  alertRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  alertText: { fontSize: 12, fontWeight: "500" as const },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  statCard: {
    width: (width - 56) / 2, borderRadius: 14, borderWidth: 1, padding: 14,
  },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: "700" as const },
  statLabel: { fontSize: 11, marginTop: 2 },
  statChange: { fontSize: 11, marginTop: 4, fontWeight: "500" as const },
  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 12 },
  sectionItems: { gap: 2 },
  sectionItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 0.5,
  },
  sectionItemText: { fontSize: 14 },
});
