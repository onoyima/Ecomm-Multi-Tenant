import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { admin as adminApi } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

export default function UsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.users.list();
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
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
        <Text style={[styles.title, { color: colors.foreground }]}>Customers</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{users.length} total</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {item.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.email, { color: colors.mutedForeground }]}>{item.email}</Text>
              <View style={styles.meta}>
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                  {item.orders ?? 0} orders · {formatPrice(item.spent ?? 0)} spent
                </Text>
              </View>
            </View>
            <Text style={[styles.joined, { color: colors.mutedForeground }]}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No users</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>No users found</Text>
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
  list: { paddingHorizontal: 16, gap: 8, paddingBottom: 100 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "700" as const },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" as const },
  email: { fontSize: 11, marginTop: 2 },
  meta: { marginTop: 4 },
  metaText: { fontSize: 11 },
  joined: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
