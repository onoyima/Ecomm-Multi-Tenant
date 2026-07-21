import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fraud, type FraudAlert } from "@workspace/api-client-react";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

const RISK_TABS = ["All", "High Risk", "Medium", "Review"];

const RISK_BADGE: Record<string, { label: string; variant: "destructive" | "warning" | "success" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "success" },
};

const REASON_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  "Velocity Check": "zap",
  "Device Mismatch": "smartphone",
  "IP Reputation": "globe",
  "Amount Anomaly": "dollar-sign",
};

export default function FraudScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [tab, setTab] = useState(0);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fraud.list();
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to load fraud alerts", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = {
    flagged: alerts.filter((a) => a.status === "flagged").length,
    review: alerts.filter((a) => a.status === "review").length,
    blocked: alerts.filter((a) => a.status === "blocked").length,
    falsePositive: alerts.filter((a) => a.status === "false_positive").length,
  };

  const filtered = alerts.filter((a) => {
    if (tab === 0) return true;
    if (tab === 1) return a.riskLevel === "high";
    if (tab === 2) return a.riskLevel === "medium";
    if (tab === 3) return a.status === "review";
    return true;
  });

  const handleApprove = async (id: string) => {
    try {
      await fraud.approve(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "false_positive" as const } : a));
    } catch (err) {
      console.error("Failed to approve", err);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await fraud.block(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "blocked" as const } : a));
    } catch (err) {
      console.error("Failed to block", err);
    }
  };

  const handleReview = async (id: string) => {
    try {
      await fraud.review(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "review" as const } : a));
    } catch (err) {
      console.error("Failed to flag for review", err);
    }
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
        <Text style={[styles.title, { color: colors.foreground }]}>Fraud Monitoring</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{stats.flagged} flagged today</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Flagged", value: stats.flagged, color: colors.destructive },
          { label: "Under Review", value: stats.review, color: colors.warning },
          { label: "Blocked", value: stats.blocked, color: colors.destructive },
          { label: "False Positives", value: stats.falsePositive, color: colors.success },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={RISK_TABS}
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
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.transactionRow}>
                  <Text style={[styles.transactionId, { color: colors.foreground }]}>{item.transactionId}</Text>
                  <Badge label={RISK_BADGE[item.riskLevel]!.label} variant={RISK_BADGE[item.riskLevel]!.variant} size="sm" />
                </View>
                <Text style={[styles.amount, { color: colors.foreground }]}>{formatPrice(item.amount)}</Text>
              </View>
            </View>

            <View style={[styles.reasonRow, { backgroundColor: colors.muted }]}>
              <Feather name={REASON_ICONS[item.reason] ?? "alert-circle"} size={12} color={colors.mutedForeground} />
              <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>{item.reason}</Text>
              <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
              <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>{item.timestamp}</Text>
            </View>

            <View style={styles.customerRow}>
              <Feather name="user" size={12} color={colors.mutedForeground} />
              <Text style={[styles.customerName, { color: colors.foreground }]}>{item.customerName}</Text>
            </View>

            {item.status !== "blocked" && item.status !== "false_positive" && (
              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]} onPress={() => handleApprove(item.id)}>
                  <Feather name="check" size={13} color={colors.success} />
                  <Text style={[styles.actionBtnText, { color: colors.success }]}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + "20" }]} onPress={() => handleBlock(item.id)}>
                  <Feather name="x" size={13} color={colors.destructive} />
                  <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Block</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning + "20" }]} onPress={() => handleReview(item.id)}>
                  <Feather name="eye" size={13} color={colors.warning} />
                  <Text style={[styles.actionBtnText, { color: colors.warning }]}>Review</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === "false_positive" && (
              <View style={[styles.statusBar, { backgroundColor: colors.success + "15" }]}>
                <Feather name="check-circle" size={13} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>Approved as legitimate</Text>
              </View>
            )}

            {item.status === "blocked" && (
              <View style={[styles.statusBar, { backgroundColor: colors.destructive + "15" }]}>
                <Feather name="shield-off" size={13} color={colors.destructive} />
                <Text style={[styles.statusText, { color: colors.destructive }]}>Transaction blocked</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shield" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All clear</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>No fraud alerts in this category</Text>
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
  statValue: { fontSize: 22, fontWeight: "700" as const },
  statLabel: { fontSize: 11, marginTop: 2 },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: "500" as const },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { padding: 14, paddingBottom: 0 },
  transactionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  transactionId: { fontSize: 13, fontWeight: "600" as const },
  amount: { fontSize: 18, fontWeight: "700" as const, marginTop: 2 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 5, margin: 14, marginBottom: 0, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  reasonText: { fontSize: 11 },
  dot: { fontSize: 11 },
  customerRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 10 },
  customerName: { fontSize: 13, fontWeight: "500" as const },
  cardActions: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 0.5, justifyContent: "flex-end" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: "600" as const },
  statusBar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  statusText: { fontSize: 12, fontWeight: "500" as const },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
