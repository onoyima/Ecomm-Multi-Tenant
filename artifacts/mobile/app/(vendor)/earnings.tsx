import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/Badge";
import { wallet } from "@workspace/api-client-react";
import { useVendorStats, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function EarningsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const { data: vendorStats } = useVendorStats();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    wallet
      .transactions({ perPage: 20 })
      .then((res: any) => {
        if (mounted) setTransactions(res.data ?? res ?? []);
      })
      .catch(() => {
        if (mounted) setTransactions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
    >
      <View style={{ paddingTop: topPad }}>
        <LinearGradient colors={["#10B981", "#059669"]} style={styles.hero}>
          <Text style={styles.heroLabel}>Total Earned (All Time)</Text>
          <Text style={styles.heroBalance}>{formatPrice(vendorStats?.totalRevenue ?? 0)}</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroItem}>
              <Text style={styles.heroItemLabel}>Available</Text>
              <Text style={styles.heroItemValue}>{formatPrice(vendorStats?.withdrawable ?? 0)}</Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            <View style={styles.heroItem}>
              <Text style={styles.heroItemLabel}>In Escrow</Text>
              <Text style={styles.heroItemValue}>{formatPrice(22500)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Feather name="download" size={16} color="#10B981" />
            <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Commission Tier */}
      <View style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tierLeft}>
          <View style={[styles.tierIcon, { backgroundColor: "#FFB800" + "20" }]}>
            <Feather name="award" size={20} color="#FFB800" />
          </View>
          <View>
            <Text style={[styles.tierTitle, { color: colors.foreground }]}>Established Vendor</Text>
            <Text style={[styles.tierSub, { color: colors.mutedForeground }]}>
               10% commission rate · {vendorStats?.totalOrders ?? 0} orders
            </Text>
          </View>
        </View>
        <View style={[styles.tierProgress, { backgroundColor: colors.muted }]}>
          <View style={[styles.tierFill, { backgroundColor: "#FFB800", width: "65%" }]} />
        </View>
        <Text style={[styles.tierNext, { color: colors.mutedForeground }]}>
          852 more orders to reach Top Vendor (5% commission)
        </Text>
      </View>

      {/* Payout Schedule */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payout Schedule</Text>
        {[
          { label: "Schedule", value: "After delivery confirmation" },
          { label: "Next Payout", value: "May 15, 2026" },
          { label: "Amount", value: formatPrice(22500) },
          { label: "Destination", value: "GTBank ****4521" },
        ].map((row) => (
          <View key={row.label} style={[styles.metaRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Transaction History */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitleLg, { color: colors.foreground }]}>Transaction History</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
      ) : (
        transactions.map((t: any, i: number) => (
          <View key={t.id ?? i} style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[
              styles.txIcon,
              { backgroundColor: t.type === "credit" ? "#DCFCE7" : "#FEE2E2" },
            ]}>
              <Feather
                name={t.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                size={16}
                color={t.type === "credit" ? "#16A34A" : "#DC2626"}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={[styles.txDesc, { color: colors.foreground }]}>{t.description}</Text>
              <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{t.createdAt}</Text>
            </View>
            <Text style={[
              styles.txAmount,
              { color: t.type === "credit" ? colors.success : colors.destructive },
            ]}>
              {t.type === "credit" ? "+" : "-"}{formatPrice(t.amount)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 24, paddingBottom: 28 },
  heroLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 6 },
  heroBalance: { fontSize: 36, fontWeight: "700" as const, color: "#fff", marginBottom: 20 },
  heroRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  heroItem: { flex: 1 },
  heroItemLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 3 },
  heroItemValue: { fontSize: 18, fontWeight: "600" as const, color: "#fff" },
  heroDivider: { width: 1, height: 36, marginHorizontal: 16 },
  withdrawBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", alignSelf: "flex-start",
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
  },
  withdrawBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#10B981" },
  tierCard: {
    margin: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 10,
  },
  tierLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  tierIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tierTitle: { fontSize: 15, fontWeight: "600" as const },
  tierSub: { fontSize: 12, marginTop: 2 },
  tierProgress: { height: 6, borderRadius: 3, overflow: "hidden" },
  tierFill: { height: "100%", borderRadius: 3 },
  tierNext: { fontSize: 11 },
  section: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1,
    padding: 16, gap: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 10 },
  metaRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 0.5,
  },
  metaLabel: { fontSize: 13 },
  metaValue: { fontSize: 13, fontWeight: "500" as const },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 10 },
  sectionTitleLg: { fontSize: 18, fontWeight: "700" as const },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1, padding: 12,
  },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontWeight: "500" as const },
  txDate: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "700" as const },
});
