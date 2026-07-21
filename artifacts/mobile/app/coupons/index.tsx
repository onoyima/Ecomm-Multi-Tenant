import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice, useCoupons } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function CouponsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: coupons = [], isLoading } = useCoupons();
  const [showExpired, setShowExpired] = useState(false);

  const { active, expired } = useMemo(() => {
    const now = new Date();
    const active: any[] = [];
    const expired: any[] = [];
    for (const c of coupons) {
      if (c.expires_at && new Date(c.expires_at) < now) expired.push(c);
      else active.push(c);
    }
    return { active, expired };
  }, [coupons]);

  const copyCode = (code: string) => {
    Alert.alert("Code Copied", `Coupon code "${code}" has been copied to clipboard.`);
  };

  const renderCoupon = (coupon: any) => (
    <View key={coupon.id} style={[styles.couponCard, { backgroundColor: colors.card, borderColor: (coupon.used || expired.includes(coupon)) ? colors.border : colors.primary + "40" }]}>
      <View style={[styles.couponSide, { backgroundColor: colors.primary }]}>
        <Text style={styles.couponSideText}>{coupon.discount || coupon.type}</Text>
      </View>
      <View style={styles.couponBody}>
        <Text style={[styles.couponTitle, { color: colors.foreground }]}>{coupon.title || coupon.name}</Text>
        <View style={styles.couponDetails}>
          <View style={styles.couponDetail}>
            <Feather name="hash" size={12} color={colors.mutedForeground} />
            <Text style={[styles.couponCode, { color: colors.primary }]}>{coupon.code}</Text>
          </View>
          {coupon.minPurchase > 0 && (
            <Text style={[styles.couponMin, { color: colors.mutedForeground }]}>Min. {formatPrice(coupon.minPurchase)}</Text>
          )}
        </View>
        <View style={styles.couponFooter}>
          <View style={styles.couponDetail}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.couponExpiry, { color: colors.mutedForeground }]}>Expires {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : coupon.expiry}</Text>
          </View>
          <TouchableOpacity
            style={[styles.copyBtn, { backgroundColor: colors.primary + "15" }]}
            onPress={() => copyCode(coupon.code)}
          >
            <Feather name="copy" size={13} color={colors.primary} />
            <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copy Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Coupons & Promotions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {active.map(renderCoupon)}

            {expired.length > 0 && (
              <>
                <TouchableOpacity
                  style={[styles.expiredToggle, { borderBottomColor: colors.border }]}
                  onPress={() => setShowExpired(!showExpired)}
                >
                  <Feather name="archive" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.expiredToggleText, { color: colors.mutedForeground }]}>
                    Expired Coupons ({expired.length})
                  </Text>
                  <Feather name={showExpired ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </TouchableOpacity>

                {showExpired && expired.map(renderCoupon)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  content: { padding: 16, gap: 14 },
  couponCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, overflow: "hidden", minHeight: 120 },
  couponSide: { width: 70, alignItems: "center", justifyContent: "center", padding: 10 },
  couponSideText: { color: "#fff", fontSize: 12, fontWeight: "800" as const, textAlign: "center", transform: [{ rotate: "-90deg" }] },
  couponBody: { flex: 1, padding: 14, gap: 8 },
  couponTitle: { fontSize: 15, fontWeight: "600" as const },
  couponDetails: { gap: 4 },
  couponDetail: { flexDirection: "row", alignItems: "center", gap: 5 },
  couponCode: { fontSize: 14, fontWeight: "700" as const, letterSpacing: 1 },
  couponMin: { fontSize: 11 },
  couponFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  couponExpiry: { fontSize: 11 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  copyBtnText: { fontSize: 12, fontWeight: "600" as const },
  expiredToggle: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, borderBottomWidth: 0.5 },
  expiredToggleText: { flex: 1, fontSize: 13, fontWeight: "500" as const },
});
