import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { admin as adminApi } from "@workspace/api-client-react";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

interface Dispute {
  id: string;
  orderId: string;
  customer: string;
  vendor: string;
  subject: string;
  description: string;
  status: "open" | "investigating" | "resolved" | "closed";
  createdAt: string;
  resolution?: string;
}

const STATUS_TABS = ["All", "Open", "Investigating", "Resolved"];

const STATUS_CONFIG: Record<string, { color: string; variant: "success" | "warning" | "destructive" | "primary" }> = {
  open: { color: "#EF4444", variant: "destructive" },
  investigating: { color: "#F59E0B", variant: "warning" },
  resolved: { color: "#10B981", variant: "success" },
  closed: { color: "#6B7280", variant: "primary" },
};

export default function DisputesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.disputes.list();
        setDisputes(res.data as unknown as Dispute[]);
      } catch (err) {
        console.error("Failed to load disputes", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = disputes.filter((d) => {
    if (tab === 0) return true;
    return d.status === STATUS_TABS[tab]!.toLowerCase();
  });

  const stats = {
    open: disputes.filter((d) => d.status === "open").length,
    investigating: disputes.filter((d) => d.status === "investigating").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
  };

  const handleResolve = async (id: string) => {
    if (!resolution.trim()) {
      Alert.alert("Resolution Required", "Enter a resolution description");
      return;
    }
    try {
      await adminApi.disputes.resolve(id, { resolution });
      setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "resolved", resolution } : d));
      setResolving(null);
      setResolution("");
      Alert.alert("Dispute Resolved", "The customer and vendor will be notified.");
    } catch (err) {
      Alert.alert("Error", "Failed to resolve dispute");
    }
  };

  const handleEscalate = async (id: string) => {
    try {
      await adminApi.disputes.escalate(id);
      setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "investigating" } : d));
      Alert.alert("Escalated", "Dispute escalated to senior support team.");
    } catch (err) {
      Alert.alert("Error", "Failed to escalate dispute");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Disputes</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.destructive }]}>
          <Text style={styles.countText}>{stats.open} open</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: "Open", value: stats.open, color: colors.destructive },
          { label: "Investigating", value: stats.investigating, color: colors.warning },
          { label: "Resolved", value: stats.resolved, color: colors.success },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <FlatList
        data={STATUS_TABS}
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subject, { color: colors.foreground }]}>{item.subject}</Text>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order #{item.orderId} · {item.createdAt}</Text>
              </View>
              <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={STATUS_CONFIG[item.status]?.variant ?? "primary"} size="sm" />
            </View>

            <View style={[styles.parties, { backgroundColor: colors.muted }]}>
              <View style={styles.partyItem}>
                <Feather name="user" size={12} color={colors.mutedForeground} />
                <Text style={[styles.partyText, { color: colors.mutedForeground }]}>Customer: </Text>
                <Text style={[styles.partyName, { color: colors.foreground }]}>{item.customer}</Text>
              </View>
              <View style={styles.partyItem}>
                <Feather name="briefcase" size={12} color={colors.mutedForeground} />
                <Text style={[styles.partyText, { color: colors.mutedForeground }]}>Vendor: </Text>
                <Text style={[styles.partyName, { color: colors.foreground }]}>{item.vendor}</Text>
              </View>
            </View>

            <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>

            {item.resolution && (
              <View style={[styles.resolutionBox, { backgroundColor: colors.success + "15" }]}>
                <Feather name="check-circle" size={13} color={colors.success} />
                <Text style={[styles.resolutionText, { color: colors.success }]}>{item.resolution}</Text>
              </View>
            )}

            {resolving === item.id && (
              <View style={styles.resolveForm}>
                <TextInput
                  style={[styles.resolveInput, { backgroundColor: colors.muted, borderColor: colors.primary, color: colors.foreground }]}
                  value={resolution}
                  onChangeText={setResolution}
                  placeholder="Describe the resolution (e.g. refund issued, replacement sent)..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                />
                <View style={styles.resolveActions}>
                  <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setResolving(null); setResolution(""); }}>
                    <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.success }]} onPress={() => handleResolve(item.id)}>
                    <Text style={styles.confirmBtnText}>Confirm Resolution</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {item.status !== "resolved" && item.status !== "closed" && resolving !== item.id && (
              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                {item.status === "open" && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning + "20" }]} onPress={() => handleEscalate(item.id)}>
                    <Feather name="alert-triangle" size={13} color={colors.warning} />
                    <Text style={[styles.actionBtnText, { color: colors.warning }]}>Escalate</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]} onPress={() => setResolving(item.id)}>
                  <Feather name="check-circle" size={13} color={colors.success} />
                  <Text style={[styles.actionBtnText, { color: colors.success }]}>Resolve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="message-circle" size={13} color={colors.foreground} />
                  <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Message</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shield" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No disputes</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>All clear in this category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: "700" as const },
  countBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700" as const },
  statLabel: { fontSize: 11, marginTop: 2 },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: "500" as const },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  subject: { fontSize: 14, fontWeight: "600" as const, marginBottom: 3 },
  orderId: { fontSize: 11 },
  parties: { flexDirection: "row", gap: 16, paddingHorizontal: 14, paddingVertical: 8 },
  partyItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  partyText: { fontSize: 12 },
  partyName: { fontSize: 12, fontWeight: "600" as const },
  description: { fontSize: 13, paddingHorizontal: 14, paddingVertical: 10, lineHeight: 20 },
  resolutionBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 14, marginBottom: 10, borderRadius: 10, padding: 10 },
  resolutionText: { flex: 1, fontSize: 12, lineHeight: 18 },
  resolveForm: { padding: 14, gap: 10 },
  resolveInput: { borderRadius: 12, borderWidth: 1.5, padding: 12, minHeight: 80, textAlignVertical: "top", fontSize: 13 },
  resolveActions: { flexDirection: "row", gap: 8 },
  cancelBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontSize: 13 },
  confirmBtn: { flex: 2, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  cardActions: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 0.5, justifyContent: "flex-end" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: "600" as const },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
