import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { CURRENCIES, CurrencyCode, useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
}

function MenuItem({ icon, label, value, onPress, danger, badge }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#FEE2E2" : colors.muted }]}>
        <Feather name={icon as any} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {badge && (
        <View style={[styles.menuBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      {value && <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text>}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={styles.menuChevron} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, switchRole } = useAuth();
  const { currency, setCurrency, info } = useCurrency();
  const [showCurrency, setShowCurrency] = useState(false);
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { logout(); router.replace("/(auth)/welcome"); } },
    ]);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.kycStatus === "verified" && (
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={12} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Wallet Card */}
      <TouchableOpacity
        style={[styles.walletCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/wallet")}
      >
        <View style={styles.walletLeft}>
          <View style={[styles.walletIcon, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="credit-card" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>Wallet Balance</Text>
            <Text style={[styles.walletBalance, { color: colors.foreground }]}>
              {formatPrice(user?.walletBalance ?? 0)}
            </Text>
          </View>
        </View>
        <View style={styles.walletActions}>
          <View style={[styles.walletAction, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={styles.walletActionText}>Top Up</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Switch to Vendor */}
      <TouchableOpacity
        style={[styles.switchBanner, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}
        onPress={() => {
          switchRole("vendor");
          router.replace("/(vendor)/dashboard");
        }}
      >
        <Feather name="briefcase" size={18} color={colors.accent} />
        <View style={styles.switchText}>
          <Text style={[styles.switchTitle, { color: colors.accent }]}>Switch to Vendor Mode</Text>
          <Text style={[styles.switchSub, { color: colors.mutedForeground }]}>Start selling on ShopDrop</Text>
        </View>
        <Feather name="arrow-right" size={16} color={colors.accent} />
      </TouchableOpacity>

      {/* Menu Sections */}
      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>Shopping</Text>
        <MenuItem icon="heart" label="Wishlist" badge="3" onPress={() => router.push("/(customer)/wishlist")} />
        <MenuItem icon="package" label="My Orders" onPress={() => router.push("/(customer)/orders")} />
        <MenuItem icon="map-pin" label="Saved Addresses" onPress={() => router.push("/addresses")} />
        <MenuItem icon="tag" label="My Coupons" onPress={() => router.push("/coupons" as any)} />
        <MenuItem icon="repeat" label="Compare Products" onPress={() => router.push("/product-compare" as any)} />
        <MenuItem icon="file-text" label="Order Templates" onPress={() => router.push("/order-templates" as any)} />
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>Account</Text>
        <MenuItem icon="user" label="Personal Info" onPress={() => router.push("/profile-edit")} />
        <MenuItem icon="dollar-sign" label="Currency" value={`${info.symbol} ${currency}`} onPress={() => setShowCurrency(true)} />
        <MenuItem icon="bell" label="Notifications" onPress={() => router.push("/notifications")} />
        <MenuItem icon="shield" label="KYC Verification" value={user?.kycStatus ?? "pending"} onPress={() => router.push("/kyc")} />
        <MenuItem icon="lock" label="Change Password" onPress={() => router.push("/profile-edit")} />
        <MenuItem icon="gift" label="Refer & Earn" onPress={() => router.push("/referral" as any)} />
        <MenuItem icon="award" label="Loyalty Rewards" onPress={() => router.push("/loyalty" as any)} />
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>AI Features</Text>
        <MenuItem icon="cpu" label="AI Shopping Assistant" onPress={() => router.push("/ai-chat")} />
        <MenuItem icon="eye" label="Visual Search" onPress={() => router.push("/visual-search" as any)} />
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>Support</Text>
        <MenuItem icon="help-circle" label="Help Center" onPress={() => router.push("/help" as any)} />
        <MenuItem icon="message-circle" label="Live Chat" onPress={() => {}} />
        <MenuItem icon="star" label="Rate App" onPress={() => {}} />
        <MenuItem icon="log-out" label="Sign Out" onPress={handleLogout} danger />
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>ShopDrop v1.0.0</Text>

      <Modal visible={showCurrency} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrency(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {(Object.values(CURRENCIES) as Array<{ code: CurrencyCode; symbol: string; name: string }>).map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.currencyItem, { borderBottomColor: colors.border }]}
                onPress={() => { setCurrency(c.code); setShowCurrency(false); }}
              >
                <Text style={[styles.currencySymbol, { color: currency === c.code ? colors.primary : colors.foreground }]}>
                  {c.symbol}
                </Text>
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencyCode, { color: colors.foreground }]}>{c.code}</Text>
                  <Text style={[styles.currencyName, { color: colors.mutedForeground }]}>{c.name}</Text>
                </View>
                {currency === c.code && (
                  <Feather name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center", paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: "700" as const, color: "#fff" },
  userName: { fontSize: 20, fontWeight: "700" as const, color: "#fff", marginBottom: 2 },
  userEmail: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  verifiedText: { color: "#fff", fontSize: 11, fontWeight: "600" as const },
  walletCard: {
    margin: 16, borderRadius: 16, borderWidth: 1,
    padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  walletLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  walletIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  walletLabel: { fontSize: 12, marginBottom: 2 },
  walletBalance: { fontSize: 20, fontWeight: "700" as const },
  walletActions: {},
  walletAction: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  walletActionText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  switchBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 16, marginBottom: 16, padding: 14,
    borderRadius: 14, borderWidth: 1,
  },
  switchText: { flex: 1 },
  switchTitle: { fontSize: 14, fontWeight: "600" as const },
  switchSub: { fontSize: 12, marginTop: 2 },
  menuSection: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1,
    overflow: "hidden", paddingTop: 4,
  },
  menuSectionTitle: {
    fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.5,
    paddingHorizontal: 16, paddingVertical: 8, textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 0.5,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15 },
  menuValue: { fontSize: 13, marginRight: 6 },
  menuBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  menuBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" as const },
  menuChevron: {},
  version: { textAlign: "center", fontSize: 12, marginVertical: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700" as const },
  currencyItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 14, borderBottomWidth: 0.5,
  },
  currencySymbol: { fontSize: 24, fontWeight: "700" as const, width: 36, textAlign: "center" },
  currencyInfo: { flex: 1 },
  currencyCode: { fontSize: 16, fontWeight: "600" as const },
  currencyName: { fontSize: 12, marginTop: 2 },
});
