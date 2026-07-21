import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorStats } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function VendorProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, switchRole } = useAuth();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const { data: vendorStats } = useVendorStats();
  const stats = vendorStats ?? { totalProducts: 0, totalOrders: 0, avgRating: 0 };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Sign out from vendor account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { logout(); router.replace("/(auth)/welcome"); } },
    ]);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
    >
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#FF6B35" }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.storeName}>{user?.businessName}</Text>
        <Text style={styles.storeEmail}>{user?.email}</Text>
        <View style={styles.storeStats}>
          {[
            { label: "Products", value: stats.totalProducts },
            { label: "Orders", value: stats.totalOrders },
            { label: "Rating", value: stats.avgRating },
          ].map((s) => (
            <View key={s.label} style={styles.storeStat}>
              <Text style={styles.storeStatValue}>{s.value}</Text>
              <Text style={styles.storeStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.switchBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
        onPress={() => { switchRole("customer"); router.replace("/(customer)/home"); }}
      >
        <Feather name="shopping-bag" size={18} color={colors.primary} />
        <Text style={[styles.switchText, { color: colors.primary }]}>Switch to Customer Mode</Text>
        <Feather name="arrow-right" size={16} color={colors.primary} />
      </TouchableOpacity>

      {[
        { title: "Store Settings", items: [
          { icon: "edit-2", label: "Edit Store Profile" },
          { icon: "image", label: "Store Banner & Logo" },
          { icon: "map-pin", label: "Business Address" },
          { icon: "truck", label: "Shipping Settings" },
        ]},
        { title: "Finance", items: [
          { icon: "credit-card", label: "Bank Accounts" },
          { icon: "calendar", label: "Payout Schedule" },
          { icon: "file-text", label: "Tax & Invoices" },
        ]},
        { title: "Compliance", items: [
          { icon: "shield", label: "KYC Documents", value: user?.kycStatus ?? "pending" },
          { icon: "file-text", label: "Business Registration" },
          { icon: "book", label: "Vendor Policy" },
        ]},
        { title: "Tools", items: [
          { icon: "cpu", label: "AI Vendor Assistant" },
          { icon: "trending-up", label: "SEO Dashboard" },
          { icon: "bell", label: "Notification Settings" },
          { icon: "log-out", label: "Sign Out", danger: true },
        ]},
      ].map((section) => (
        <View key={section.title} style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
               onPress={item.label === "Sign Out" ? handleLogout : item.label === "AI Vendor Assistant" ? () => router.push("/ai-chat" as any) : item.label === "SEO Dashboard" ? () => router.push("/seo-dashboard" as any) : () => {}}
            >
              <Feather name={item.icon as any} size={18} color={(item as any).danger ? colors.destructive : colors.primary} />
              <Text style={[styles.menuLabel, { color: (item as any).danger ? colors.destructive : colors.foreground }]}>
                {item.label}
              </Text>
              {(item as any).value && (
                <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{(item as any).value}</Text>
              )}
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 24, paddingHorizontal: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: "700" as const, color: "#fff" },
  storeName: { fontSize: 20, fontWeight: "700" as const, color: "#fff", marginBottom: 2 },
  storeEmail: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 },
  storeStats: { flexDirection: "row", gap: 32 },
  storeStat: { alignItems: "center" },
  storeStatValue: { fontSize: 22, fontWeight: "700" as const, color: "#fff" },
  storeStatLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  switchBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    margin: 16, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  switchText: { flex: 1, fontSize: 14, fontWeight: "600" as const },
  menuSection: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, paddingTop: 4,
  },
  menuSectionTitle: {
    fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.5,
    paddingHorizontal: 16, paddingVertical: 8, textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  menuLabel: { flex: 1, fontSize: 15 },
  menuValue: { fontSize: 13 },
});
