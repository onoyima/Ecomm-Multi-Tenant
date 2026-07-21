import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { admin as adminApi } from "@workspace/api-client-react";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";

export default function VendorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.vendors.list();
        setVendors(res.data);
      } catch (err) {
        console.error("Failed to load vendors", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <Text style={[styles.title, { color: colors.foreground }]}>Vendors</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{vendors.length} registered</Text>
      </View>
      <FlatList
        data={vendors}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={[styles.avatar, { backgroundColor: item.status === "approved" ? colors.primary : colors.muted }]}>
                <Text style={[styles.avatarText, { color: item.status === "approved" ? "#fff" : colors.mutedForeground }]}>
                  {item.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.email, { color: colors.mutedForeground }]}>{item.email ?? ""}</Text>
              </View>
              <Badge label={item.status === "approved" ? "Active" : "Pending"} variant={item.status === "approved" ? "success" : "warning"} size="sm" />
            </View>
            <View style={[styles.stats, { borderTopColor: colors.border }]}>
              <Text style={[styles.stat, { color: colors.mutedForeground }]}>{(item as any).productCount ?? 0} products</Text>
              <Text style={[styles.stat, { color: colors.mutedForeground }]}>{(item as any).reviewCount ?? 0} orders</Text>
              {(item.rating ?? 0) > 0 && <Text style={[styles.stat, { color: colors.success }]}>Score: {item.rating}</Text>}
            </View>
            {item.status === "pending" && (
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]}>
                  <Feather name="check" size={14} color="#fff" />
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.destructive }]}>
                  <Feather name="x" size={14} color="#fff" />
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="briefcase" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No vendors</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>No vendors registered yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: "700" as const },
  count: { fontSize: 13 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 100 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "700" as const },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" as const },
  email: { fontSize: 11, marginTop: 2 },
  stats: {
    flexDirection: "row", gap: 16, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 0.5,
  },
  stat: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, padding: 10, paddingTop: 0 },
  btn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
