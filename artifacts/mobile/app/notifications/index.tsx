import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const TYPE_CONFIG: Record<string, { icon: "package" | "tag" | "cpu" | "credit-card"; color: string; bg: string }> = {
  order: { icon: "package", color: "#5B4EFF", bg: "#EEF2FF" },
  promo: { icon: "tag", color: "#FF6B35", bg: "#FFF3ED" },
  system: { icon: "cpu", color: "#10B981", bg: "#DCFCE7" },
  wallet: { icon: "credit-card", color: "#FFB800", bg: "#FFF8E1" },
};

function getType(data: any): string {
  const type = data.type ?? "";
  if (type.includes("order") || type.includes("shipped") || type.includes("delivered")) return "order";
  if (type.includes("wallet") || type.includes("credit") || type.includes("payout")) return "wallet";
  if (type.includes("promo") || type.includes("sale") || type.includes("coupon")) return "promo";
  return "system";
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const items = notifications.map((n: any) => {
    const nData = n.data ?? {};
    const nType = getType(nData);
    return {
      id: n.id,
      type: nType,
      title: nData.title ?? nData.subject ?? "Notification",
      body: nData.body ?? nData.message ?? "",
      time: timeAgo(n.created_at ?? n.createdAt),
      read: n.read_at ? true : !!n.readAt,
    };
  });

  const unreadCount = items.filter((n: any) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadCount, { color: colors.mutedForeground }]}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllRead()}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {items.map((n: any) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
            return (
              <TouchableOpacity
                key={n.id}
                style={[
                  styles.notifRow,
                  {
                    backgroundColor: n.read ? colors.background : colors.primary + "08",
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => { if (!n.read) markRead(n.id); }}
              >
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Feather name={cfg.icon} size={18} color={cfg.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text style={[styles.notifTitle, { color: colors.foreground, fontWeight: n.read ? "500" : "700" }]}>
                      {n.title}
                    </Text>
                    {!n.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {n.body}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  unreadCount: { fontSize: 12, marginTop: 2 },
  markAll: { fontSize: 13, fontWeight: "600" },
  notifRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  notifTitle: { fontSize: 14, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  notifBody: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11 },
});
