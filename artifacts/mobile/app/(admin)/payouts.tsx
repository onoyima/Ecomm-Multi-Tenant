import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { payouts as payoutsApi } from "@workspace/api-client-react";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

interface PayoutItem {
  id: string;
  vendor: string;
  amount: number;
  status: "pending" | "processing" | "completed";
  date: string;
  paymentMethod: string;
}

const PAYOUT_TABS = ["Pending", "Processing", "History"];

const STATUS_CONFIG: Record<string, { label: string; variant: "warning" | "primary" | "success" }> = {
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "primary" },
  completed: { label: "Completed", variant: "success" },
};

export default function PayoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [tab, setTab] = useState(0);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await payoutsApi.list();
        setPayouts(
          res.data.map((p) => ({
            id: String(p.id),
            vendor: `Vendor #${p.vendorId}`,
            amount: p.amount,
            status: (p.status === "completed" ? "completed" : p.status === "processing" ? "processing" : "pending") as "pending" | "processing" | "completed",
            date: new Date(p.createdAt).toLocaleDateString(),
            paymentMethod: "Bank Transfer",
          })),
        );
      } catch (err) {
        console.error("Failed to load payouts", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalProcessing = payouts.filter((p) => p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const totalCompletedToday = payouts.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  const filtered = payouts.filter((p) => {
    if (tab === 0) return p.status === "pending";
    if (tab === 1) return p.status === "processing";
    if (tab === 2) return p.status === "completed";
    return true;
  });

  const handleProcess = (id: string) => {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: "processing" } : p));
  };

  const handleCancel = (id: string) => {
    setPayouts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Payouts</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{payouts.length} this period</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Pending Payouts", value: formatPrice(totalPending), color: colors.warning },
          { label: "Processing", value: formatPrice(totalProcessing), color: colors.primary },
          { label: "Completed Today", value: formatPrice(totalCompletedToday), color: colors.success },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={PAYOUT_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        contentContainerStyle={styles.tabs}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.tabPill, { backgroundColor: tab === index ? colors.primary : colors.muted, borderColor: colors.border }]}
            onPress={() => setTab(index)}
          >
            <Text style={[styles.tabText, { color: tab === index ? "#fff" : colors.mutedForeground }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={[styles.vendorAvatar, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.vendorAvatarText, { color: colors.primary }]}>
                  {item.vendor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.vendorName, { color: colors.foreground }]}>{item.vendor}</Text>
                <Text style={[styles.payoutAmount, { color: colors.foreground }]}>{formatPrice(item.amount)}</Text>
              </View>
              <Badge label={STATUS_CONFIG[item.status]!.label} variant={STATUS_CONFIG[item.status]!.variant} size="sm" />
            </View>

            <View style={[styles.paymentRow, { borderTopColor: colors.border }]}>
              <View style={styles.paymentDetail}>
                <Feather name="calendar" size={11} color={colors.mutedForeground} />
                <Text style={[styles.paymentText, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <View style={styles.paymentDetail}>
                <Feather name="credit-card" size={11} color={colors.mutedForeground} />
                <Text style={[styles.paymentText, { color: colors.mutedForeground }]}>{item.paymentMethod}</Text>
              </View>
            </View>

            {(item.status === "pending" || item.status === "processing") && (
              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                {item.status === "pending" && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]} onPress={() => handleProcess(item.id)}>
                    <Feather name="arrow-right" size={13} color={colors.success} />
                    <Text style={[styles.actionBtnText, { color: colors.success }]}>Process</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + "20" }]} onPress={() => handleCancel(item.id)}>
                  <Feather name="x" size={13} color={colors.destructive} />
                  <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="credit-card" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No payouts</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Nothing to show in this category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: "700" as const },
  count: { fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700" as const },
  statLabel: { fontSize: 11, marginTop: 2 },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: "500" as const },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  vendorAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  vendorAvatarText: { fontSize: 14, fontWeight: "700" as const },
  info: { flex: 1 },
  vendorName: { fontSize: 14, fontWeight: "600" as const },
  payoutAmount: { fontSize: 16, fontWeight: "700" as const, marginTop: 2 },
  paymentRow: { flexDirection: "row", gap: 16, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 0.5 },
  paymentDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentText: { fontSize: 11 },
  cardActions: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 0.5, justifyContent: "flex-end" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: "600" as const },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
