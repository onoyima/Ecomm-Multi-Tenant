import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { referrals as referralsApi } from "@workspace/api-client-react";

const TIERS = [
  { name: "Bronze", referrals: 0, bonus: 500, icon: "circle", color: "#CD7F32" },
  { name: "Silver", referrals: 5, bonus: 2000, icon: "circle", color: "#C0C0C0" },
  { name: "Gold", referrals: 15, bonus: 5000, icon: "circle", color: "#FFD700" },
  { name: "Platinum", referrals: 30, bonus: 15000, icon: "circle", color: "#E5E4E2" },
];

export default function ReferralScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("SHOPDROP2026");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        referralsApi.list(),
        referralsApi.stats(),
      ]);
      const list = ((listRes as any).data ?? listRes);
      const s = ((statsRes as any).data ?? statsRes);
      setReferrals(Array.isArray(list) ? list : []);
      setStats(s);

      const codeRes = await referralsApi.store();
      const codeData = (codeRes as any).data ?? codeRes;
      setReferralCode(codeData.referralCode || "SHOPDROP2026");
    } catch (err) {
      console.error("Failed to load referral data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    Alert.alert("Referral Code", `Your code ${referralCode} has been copied! Share it with friends.`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Refer & Earn</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Hero */}
        <LinearGradient colors={["#5B4EFF", "#3A2FD9"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Invite Friends, Earn Rewards</Text>
          <Text style={styles.heroSub}>Give ₦2,000, get ₦2,000 when they shop</Text>
          <View style={styles.codeWrap}>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Feather name="share-2" size={16} color="#5B4EFF" />
            <Text style={styles.shareBtnText}>Share Referral Code</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: "users", value: referrals.length, label: "People Referred", color: "#5B4EFF" },
            { icon: "wallet", value: formatPrice(stats?.totalEarnings ?? 0), label: "Total Earned", color: "#10B981" },
            { icon: "clock", value: formatPrice(stats?.pendingBonus ?? 0), label: "Pending Bonus", color: "#F59E0B" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Reward Tiers */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reward Tiers</Text>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${(referrals.length / 30) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {referrals.length} / 30 referrals to reach Platinum
          </Text>
          {TIERS.map((tier, i) => {
            const unlocked = referrals.length >= tier.referrals;
            return (
              <View key={tier.name} style={[styles.tierRow, i < TIERS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                <View style={[styles.tierIcon, { backgroundColor: unlocked ? tier.color + "20" : colors.muted }]}>
                  <Feather name={unlocked ? "check" : "circle"} size={14} color={unlocked ? tier.color : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierName, { color: unlocked ? colors.foreground : colors.mutedForeground }]}>{tier.name}</Text>
                  <Text style={[styles.tierDesc, { color: colors.mutedForeground }]}>{tier.referrals} referrals — {formatPrice(tier.bonus)} bonus</Text>
                </View>
                {unlocked && (
                  <View style={[styles.unlockedBadge, { backgroundColor: colors.success + "20" }]}>
                    <Text style={[styles.unlockedText, { color: colors.success }]}>Unlocked</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Referral History */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Referral History</Text>
          {referrals.length === 0 ? (
            <Text style={[{ color: colors.mutedForeground, textAlign: "center", paddingVertical: 20 }]}>No referrals yet. Share your code to start earning!</Text>
          ) : (
            referrals.map((r: any) => (
              <View key={r.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.historyAvatar, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.historyInitials, { color: colors.primary }]}>{r.name.split(" ").map((n: string) => n[0]).join("")}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyName, { color: colors.foreground }]}>{r.name}</Text>
                  <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{r.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.historyReward, { color: colors.success }]}>+{formatPrice(r.reward)}</Text>
                  <Text style={[styles.historyStatus, { color: r.status === "completed" ? colors.success : colors.warning }]}>
                    {r.status === "completed" ? "Completed" : "Pending"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.muted }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            You earn ₦2,000 for every friend who signs up and makes their first purchase. Bonus unlocks at each tier level.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  content: { padding: 16, gap: 16 },
  hero: { borderRadius: 20, padding: 24, alignItems: "center", gap: 10, overflow: "hidden" },
  heroTitle: { fontSize: 22, fontWeight: "700" as const, color: "#fff" },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  codeWrap: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  codeText: { fontSize: 24, fontWeight: "800" as const, color: "#fff", letterSpacing: 3 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4 },
  shareBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#5B4EFF" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 16, fontWeight: "700" as const },
  statLabel: { fontSize: 11, textAlign: "center" },
  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabel: { fontSize: 12, textAlign: "center" },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  tierIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  tierName: { fontSize: 14, fontWeight: "600" as const },
  tierDesc: { fontSize: 12, marginTop: 2 },
  unlockedBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  unlockedText: { fontSize: 11, fontWeight: "600" as const },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 0.5 },
  historyAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  historyInitials: { fontSize: 13, fontWeight: "700" as const },
  historyName: { fontSize: 14, fontWeight: "500" as const },
  historyDate: { fontSize: 11, marginTop: 2 },
  historyReward: { fontSize: 14, fontWeight: "700" as const },
  historyStatus: { fontSize: 11, marginTop: 2 },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: 14 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
