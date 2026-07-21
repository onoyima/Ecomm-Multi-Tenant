import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { loyaltyPoints as loyaltyApi } from "@workspace/api-client-react";

const REWARDS = [
  { id: "rw1", title: "₦5,000 Discount", points: 2500, icon: "tag", color: "#5B4EFF" },
  { id: "rw2", title: "Free Shipping", points: 500, icon: "truck", color: "#10B981" },
  { id: "rw3", title: "₦10,000 Gift Card", points: 5000, icon: "gift", color: "#FF6B35" },
  { id: "rw4", title: "20% Off Next Order", points: 1500, icon: "percent", color: "#F59E0B" },
  { id: "rw5", title: "Exclusive Product Access", points: 8000, icon: "star", color: "#FFB800" },
];

const HOW_TO_EARN = [
  { icon: "shopping-bag", desc: "Make a purchase — 1 point per ₦10 spent", pts: "10 pts/₦100" },
  { icon: "star", desc: "Review products after purchase", pts: "100 pts" },
  { icon: "users", desc: "Refer friends to ShopDrop", pts: "400 pts" },
  { icon: "gift", desc: "Birthday bonus points", pts: "1,000 pts" },
  { icon: "check-circle", desc: "Complete your profile", pts: "200 pts" },
];

const TIERS = [
  { name: "Bronze", min: 0, color: "#CD7F32", icon: "circle" },
  { name: "Silver", min: 5000, color: "#C0C0C0", icon: "circle" },
  { name: "Gold", min: 15000, color: "#FFD700", icon: "circle" },
  { name: "Platinum", min: 30000, color: "#E5E4E2", icon: "circle" },
];

export default function LoyaltyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"history" | "redeem">("history");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, balanceRes] = await Promise.all([
        loyaltyApi.list(),
        loyaltyApi.balance(),
      ]);
      const list = ((listRes as any).data ?? listRes);
      const bal = ((balanceRes as any).data ?? balanceRes);
      setTransactions(Array.isArray(list) ? list : []);
      setBalance(bal?.balance ?? 0);
    } catch (err) {
      console.error("Failed to load loyalty data", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = balance;
  const nextTier = TIERS.findLast((t) => totalPoints >= t.min) ?? TIERS[0];
  const nextTierIndex = TIERS.indexOf(nextTier);
  const nextTierTarget = nextTierIndex < TIERS.length - 1 ? TIERS[nextTierIndex + 1] : null;
  const progress = nextTierTarget ? ((totalPoints - nextTier.min) / (nextTierTarget.min - nextTier.min)) * 100 : 100;

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Loyalty Rewards</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Points Hero */}
        <LinearGradient colors={["#5B4EFF", "#3A2FD9"]} style={styles.hero}>
          <Text style={styles.heroLabel}>Your Points Balance</Text>
          <Text style={styles.heroPoints}>{totalPoints.toLocaleString()}</Text>
          <View style={styles.heroBadge}>
            <Feather name={nextTier.icon as any} size={12} color={nextTier.color} />
            <Text style={styles.heroBadgeText}>{nextTier.name} Member</Text>
          </View>
        </LinearGradient>

        {/* Progress to next tier */}
        {nextTierTarget && (
          <View style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.tierHeader}>
              <Text style={[styles.tierTitle, { color: colors.foreground }]}>Next Tier: {nextTierTarget.name}</Text>
              <Text style={[styles.tierPoints, { color: colors.mutedForeground }]}>
                {totalPoints.toLocaleString()} / {nextTierTarget.min.toLocaleString()} pts
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressDesc, { color: colors.mutedForeground }]}>
              {nextTierTarget.min - totalPoints} more points to reach {nextTierTarget.name}
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          {(["history", "redeem"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && [styles.activeTab, { backgroundColor: colors.background }]]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
                {t === "history" ? "Points History" : "Redeem Rewards"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "history" ? (
          <>
            {transactions.length === 0 ? (
              <Text style={[{ color: colors.mutedForeground, textAlign: "center", paddingVertical: 20 }]}>No points activity yet.</Text>
            ) : (
              transactions.map((h: any) => (
                <View key={h.id} style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.historyIcon, { backgroundColor: h.type === "earned" ? "#DCFCE7" : "#FEE2E2" }]}>
                    <Feather name={h.type === "earned" ? "arrow-down-left" : "arrow-up-right"} size={14} color={h.type === "earned" ? "#16A34A" : "#DC2626"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyDesc, { color: colors.foreground }]}>{h.desc}</Text>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{h.date}</Text>
                  </View>
                  <Text style={[styles.historyPoints, { color: h.type === "earned" ? colors.success : colors.destructive }]}>
                    {h.type === "earned" ? "+" : "-"}{h.points.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={[styles.redeemDesc, { color: colors.mutedForeground }]}>
              Redeem your points for exclusive rewards
            </Text>
            <View style={styles.rewardsGrid}>
              {REWARDS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.rewardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  disabled={totalPoints < r.points}
                >
                  <View style={[styles.rewardIcon, { backgroundColor: r.color + "20" }]}>
                    <Feather name={r.icon as any} size={22} color={r.color} />
                  </View>
                  <Text style={[styles.rewardTitle, { color: colors.foreground }]}>{r.title}</Text>
                  <Text style={[styles.rewardPoints, { color: totalPoints >= r.points ? colors.primary : colors.mutedForeground }]}>
                    {r.points.toLocaleString()} pts
                  </Text>
                  <View style={[styles.redeemBtn, { backgroundColor: totalPoints >= r.points ? colors.primary : colors.muted }]}>
                    <Text style={[styles.redeemBtnText, { color: totalPoints >= r.points ? "#fff" : colors.mutedForeground }]}>
                      {totalPoints >= r.points ? "Redeem" : "Not enough"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* How to Earn */}
        <View style={[styles.earnCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.earnTitle, { color: colors.foreground }]}>How to Earn Points</Text>
          {HOW_TO_EARN.map((item, i) => (
            <View key={item.desc} style={[styles.earnRow, i < HOW_TO_EARN.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
              <View style={[styles.earnIcon, { backgroundColor: colors.muted }]}>
                <Feather name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.earnDesc, { color: colors.foreground }]}>{item.desc}</Text>
              </View>
              <Text style={[styles.earnPts, { color: colors.primary }]}>{item.pts}</Text>
            </View>
          ))}
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
  hero: { borderRadius: 20, padding: 24, alignItems: "center", gap: 8, overflow: "hidden" },
  heroLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  heroPoints: { fontSize: 48, fontWeight: "800" as const, color: "#fff" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 },
  heroBadgeText: { fontSize: 13, fontWeight: "600" as const, color: "#fff" },
  tierCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tierTitle: { fontSize: 15, fontWeight: "600" as const },
  tierPoints: { fontSize: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressDesc: { fontSize: 12, textAlign: "center" },
  tabs: { flexDirection: "row", borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10 },
  activeTab: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: "600" as const },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  historyDesc: { fontSize: 13, fontWeight: "500" as const },
  historyDate: { fontSize: 11, marginTop: 2 },
  historyPoints: { fontSize: 14, fontWeight: "700" as const },
  redeemDesc: { fontSize: 13 },
  rewardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  rewardCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", gap: 8 },
  rewardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rewardTitle: { fontSize: 13, fontWeight: "600" as const, textAlign: "center" },
  rewardPoints: { fontSize: 12, fontWeight: "700" as const },
  redeemBtn: { width: "100%", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  redeemBtnText: { fontSize: 13, fontWeight: "600" as const },
  earnCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  earnTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 8 },
  earnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  earnIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  earnDesc: { fontSize: 13, lineHeight: 20 },
  earnPts: { fontSize: 12, fontWeight: "600" as const },
});
