import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { commissions as commissionsApi } from "@workspace/api-client-react";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

interface CommissionTier {
  id: string;
  name: string;
  rate: number;
  minOrders: number;
  minRevenue: number;
  vendorCount: number;
}

interface VendorOverride {
  id: string;
  vendorName: string;
  currentRate: number;
  defaultRate: number;
}

const OVERRIDES: VendorOverride[] = [
  { id: "o1", vendorName: "Kicks Hub NG", currentRate: 8, defaultRate: 10 },
  { id: "o2", vendorName: "TechMall NG", currentRate: 4, defaultRate: 5 },
  { id: "o3", vendorName: "Adaeze Fashion Hub", currentRate: 12, defaultRate: 15 },
];

const FEATHER_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  "New": "trending-up",
  "Established": "trending-up",
  "Top": "award",
};

export default function CommissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await commissionsApi.tiers();
        setTiers(
          res.data.map((t) => ({
            id: String(t.id),
            name: t.name,
            rate: t.rate,
            minOrders: t.minSales ?? 0,
            minRevenue: 0,
            vendorCount: 0,
          })),
        );
      } catch (err) {
        console.error("Failed to load commission tiers", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = (id: string) => {
    const tier = tiers.find((t) => t.id === id);
    if (tier) {
      setEditingTier(id);
      setEditRate(String(tier.rate));
    }
  };

  const handleSave = (id: string) => {
    const rate = parseInt(editRate, 10);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      Alert.alert("Invalid Rate", "Commission rate must be between 0 and 100");
      return;
    }
    setTiers((prev) => prev.map((t) => t.id === id ? { ...t, rate } : t));
    setEditingTier(null);
    setEditRate("");
    Alert.alert("Updated", "Commission rate updated successfully");
  };

  const handleCancel = () => {
    setEditingTier(null);
    setEditRate("");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Commissions</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>Tier-based structure</Text>
      </View>

      {tiers.map((tier) => (
        <View key={tier.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.tierIcon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name={FEATHER_ICONS[tier.name] ?? "percent"} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tierName, { color: colors.foreground }]}>{tier.name}</Text>
              {editingTier === tier.id ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={[styles.rateInput, { backgroundColor: colors.muted, borderColor: colors.primary, color: colors.foreground }]}
                    value={editRate}
                    onChangeText={setEditRate}
                    keyboardType="number-pad"
                    placeholder="Rate"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <Text style={[styles.percentSign, { color: colors.mutedForeground }]}>%</Text>
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.success }]} onPress={() => handleSave(tier.id)}>
                    <Feather name="check" size={14} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.muted }]} onPress={handleCancel}>
                    <Feather name="x" size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={[styles.tierRate, { color: colors.primary }]}>{tier.rate}% commission</Text>
              )}
            </View>
            <Badge label={`${tier.vendorCount} vendors`} variant="muted" size="sm" />
          </View>

          <View style={[styles.criteriaRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            <View style={styles.criteriaItem}>
              <Text style={[styles.criteriaLabel, { color: colors.mutedForeground }]}>Min Orders</Text>
              <Text style={[styles.criteriaValue, { color: colors.foreground }]}>{tier.minOrders > 0 ? tier.minOrders : "—"}</Text>
            </View>
            <View style={styles.criteriaDivider} />
            <View style={styles.criteriaItem}>
              <Text style={[styles.criteriaLabel, { color: colors.mutedForeground }]}>Min Revenue</Text>
              <Text style={[styles.criteriaValue, { color: colors.foreground }]}>{tier.minRevenue > 0 ? formatPrice(tier.minRevenue) : "—"}</Text>
            </View>
          </View>

          {editingTier !== tier.id && (
            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(tier.id)}>
              <Feather name="edit-2" size={12} color={colors.mutedForeground} />
              <Text style={[styles.editBtnText, { color: colors.mutedForeground }]}>Edit Rate</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vendor Overrides</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Custom rates for specific vendors</Text>
      </View>

      {OVERRIDES.map((ov) => (
        <View key={ov.id} style={[styles.overrideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.overrideTop}>
            <View style={[styles.overrideAvatar, { backgroundColor: colors.warning + "20" }]}>
              <Text style={[styles.overrideAvatarText, { color: colors.warning }]}>{ov.vendorName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.overrideName, { color: colors.foreground }]}>{ov.vendorName}</Text>
              <Text style={[styles.overrideDefault, { color: colors.mutedForeground }]}>Default: {ov.defaultRate}%</Text>
            </View>
            <Text style={[styles.overrideRate, { color: colors.warning }]}>{ov.currentRate}%</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: "700" as const },
  count: { fontSize: 13 },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  tierIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tierName: { fontSize: 16, fontWeight: "600" as const },
  tierRate: { fontSize: 13, fontWeight: "700" as const, marginTop: 2 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  rateInput: { width: 60, height: 32, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, fontSize: 14, textAlign: "center" },
  percentSign: { fontSize: 14 },
  saveBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cancelBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  criteriaRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5, borderBottomWidth: 0.5 },
  criteriaItem: { flex: 1, alignItems: "center" },
  criteriaLabel: { fontSize: 11 },
  criteriaValue: { fontSize: 14, fontWeight: "600" as const, marginTop: 2 },
  criteriaDivider: { width: 1, backgroundColor: "transparent" },
  editBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12 },
  editBtnText: { fontSize: 12 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600" as const },
  sectionSub: { fontSize: 12, marginTop: 2 },
  overrideCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1 },
  overrideTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  overrideAvatar: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  overrideAvatarText: { fontSize: 13, fontWeight: "700" as const },
  overrideName: { fontSize: 14, fontWeight: "600" as const },
  overrideDefault: { fontSize: 11, marginTop: 1 },
  overrideRate: { fontSize: 18, fontWeight: "700" as const },
});
