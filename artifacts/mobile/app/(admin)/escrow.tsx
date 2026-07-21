import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { escrow as escrowApi } from "@workspace/api-client-react";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

interface EscrowEntry {
  id: string;
  orderId: string;
  amountHeld: number;
  vendor: string;
  status: "held" | "partially_released" | "released" | "disputed";
  date: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: "primary" | "warning" | "success" | "destructive" }> = {
  held: { label: "Held", variant: "primary" },
  partially_released: { label: "Partially Released", variant: "warning" },
  released: { label: "Released", variant: "success" },
  disputed: { label: "Disputed", variant: "destructive" },
};

export default function EscrowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [entries, setEntries] = useState<EscrowEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await escrowApi.list();
        setEntries(
          res.data.map((e) => ({
            id: String(e.id),
            orderId: String(e.orderId),
            amountHeld: e.amount,
            vendor: `Vendor #${e.orderId}`,
            status: (e.status === "released" || e.status === "disputed" ? e.status : "held") as EscrowEntry["status"],
            date: new Date(e.createdAt).toLocaleDateString(),
          })),
        );
      } catch (err) {
        console.error("Failed to load escrow", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalHeld = entries.reduce((sum, e) => sum + (e.status === "held" || e.status === "partially_released" ? e.amountHeld : 0), 0);
  const pendingRelease = entries.filter((e) => e.status === "held").reduce((sum, e) => sum + e.amountHeld, 0);
  const disputed = entries.filter((e) => e.status === "disputed").reduce((sum, e) => sum + e.amountHeld, 0);
  const releasedToday = entries.filter((e) => e.status === "released" && e.date.startsWith("May")).reduce((sum, e) => sum + e.amountHeld, 0);

  const handleRelease = (id: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: "released" } : e));
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
        <Text style={[styles.title, { color: colors.foreground }]}>Escrow</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{entries.length} active entries</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Total Held", value: formatPrice(totalHeld), color: colors.primary },
          { label: "Pending Release", value: formatPrice(pendingRelease), color: colors.warning },
          { label: "Disputed", value: formatPrice(disputed), color: colors.destructive },
          { label: "Released Today", value: formatPrice(releasedToday), color: colors.success },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={[styles.orderIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="lock" size={16} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.orderId, { color: colors.foreground }]}>Order #{item.orderId}</Text>
                <Text style={[styles.vendorName, { color: colors.mutedForeground }]}>{item.vendor}</Text>
              </View>
              <Badge label={STATUS_BADGE[item.status]!.label} variant={STATUS_BADGE[item.status]!.variant} size="sm" />
            </View>

            <View style={[styles.amountRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Amount Held</Text>
              <Text style={[styles.amountValue, { color: colors.foreground }]}>{formatPrice(item.amountHeld)}</Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.date}</Text>
              {item.status === "held" && (
                <TouchableOpacity style={[styles.releaseBtn, { backgroundColor: colors.success }]} onPress={() => handleRelease(item.id)}>
                  <Feather name="unlock" size={12} color="#fff" />
                  <Text style={styles.releaseBtnText}>Release</Text>
                </TouchableOpacity>
              )}
              {item.status === "partially_released" && (
                <TouchableOpacity style={[styles.releaseBtn, { backgroundColor: colors.warning }]} onPress={() => handleRelease(item.id)}>
                  <Feather name="unlock" size={12} color="#fff" />
                  <Text style={styles.releaseBtnText}>Release Remaining</Text>
                </TouchableOpacity>
              )}
              {item.status === "disputed" && (
                <TouchableOpacity style={[styles.releaseBtn, { backgroundColor: colors.destructive }]}>
                  <Feather name="alert-triangle" size={12} color="#fff" />
                  <Text style={styles.releaseBtnText}>View Dispute</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="unlock" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No escrow entries</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>All funds have been released</Text>
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
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  orderIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  info: { flex: 1 },
  orderId: { fontSize: 14, fontWeight: "600" as const },
  vendorName: { fontSize: 11, marginTop: 2 },
  amountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 0.5, borderBottomWidth: 0.5 },
  amountLabel: { fontSize: 12 },
  amountValue: { fontSize: 16, fontWeight: "700" as const },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  date: { fontSize: 11 },
  releaseBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  releaseBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
