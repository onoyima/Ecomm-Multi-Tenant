import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { suppliers as suppliersApi } from "@workspace/api-client-react";

const { width } = Dimensions.get("window");

interface Supplier {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Blacklisted";
  reliability: number;
  lastSync: string;
  productCount: number;
  totalOrders: number;
  totalSpent: number;
  url: string;
  notes: string;
}



export default function SuppliersScreen() {
  const { width } = Dimensions.get("window");
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await suppliersApi.list();
      const data = (res as any).data ?? res;
      setSuppliers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowForm(false);
    setFormName("");
    setFormUrl("");
    setFormKey("");
    setFormNotes("");
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Active": return "#10B981";
      case "Pending": return "#FFB800";
      case "Blacklisted": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const statusBg = (s: string) => {
    switch (s) {
      case "Active": return "#DCFCE7";
      case "Pending": return "#FEF3C7";
      case "Blacklisted": return "#FEE2E2";
      default: return "#F3F4F6";
    }
  };

  if (selected) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      >
        <View style={[styles.detailHeader, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelected(null)}>
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.detailAvatar}>
            <Feather name="truck" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.detailName, { color: colors.foreground }]}>{selected.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg(selected.status) }]}>
            <Text style={[styles.statusText, { color: statusColor(selected.status) }]}>{selected.status}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.statsGrid}>
            {[
              { label: "Products", value: selected.productCount.toString() },
              { label: "Orders", value: selected.totalOrders.toString() },
              { label: "Total Spent", value: formatPrice(selected.totalSpent) },
              { label: "Reliability", value: selected.reliability + "%" },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Last Sync", value: selected.lastSync },
              { label: "Website", value: selected.url || "N/A" },
              { label: "Notes", value: selected.notes || "None" },
            ].map((row) => (
              <View key={row.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive }]}>
            <Feather name="slash" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Remove Supplier</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#10B981", "#059669"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="truck" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Suppliers</Text>
            <Text style={styles.headerSub}>{suppliers.length} connected suppliers</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowForm(!showForm)}
        >
          <Feather name={showForm ? "x" : "plus"} size={16} color="#fff" />
          <Text style={styles.addBtnText}>{showForm ? "Cancel" : "Add Supplier"}</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Supplier</Text>
            <TextInput
              style={[styles.formInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Supplier Name"
              placeholderTextColor={colors.mutedForeground}
              value={formName}
              onChangeText={setFormName}
            />
            <TextInput
              style={[styles.formInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Website URL"
              placeholderTextColor={colors.mutedForeground}
              value={formUrl}
              onChangeText={setFormUrl}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.formInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="API Key"
              placeholderTextColor={colors.mutedForeground}
              value={formKey}
              onChangeText={setFormKey}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.formInput, styles.formTextArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Notes"
              placeholderTextColor={colors.mutedForeground}
              value={formNotes}
              onChangeText={setFormNotes}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>Connect Supplier</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
        ) : suppliers.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40, gap: 8 }}>
            <Feather name="truck" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>No suppliers yet</Text>
          </View>
        ) : suppliers.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.supplierRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelected(s)}
          >
            <View style={[styles.supplierAvatar, { backgroundColor: colors.muted }]}>
              <Feather name="truck" size={18} color={colors.primary} />
            </View>
            <View style={styles.supplierInfo}>
              <View style={styles.supplierTop}>
                <Text style={[styles.supplierName, { color: colors.foreground }]}>{s.name}</Text>
                <View style={[styles.supplierStatus, { backgroundColor: statusBg(s.status) }]}>
                  <Text style={[styles.supplierStatusText, { color: statusColor(s.status) }]}>{s.status}</Text>
                </View>
              </View>
              <View style={styles.supplierMeta}>
                <Text style={[styles.supplierMetaText, { color: colors.mutedForeground }]}>
                  {s.reliability > 0 ? `${s.reliability}% reliability` : "No data"}
                </Text>
                <Text style={[styles.supplierMetaDot, { color: colors.mutedForeground }]}>·</Text>
                <Text style={[styles.supplierMetaText, { color: colors.mutedForeground }]}>Sync: {s.lastSync}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  body: { padding: 20, gap: 12 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14 },
  addBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  formTitle: { fontSize: 16, fontWeight: "600" as const },
  formInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  formTextArea: { minHeight: 60, textAlignVertical: "top" },
  submitBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
  supplierRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 14,
  },
  supplierAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  supplierInfo: { flex: 1 },
  supplierTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  supplierName: { fontSize: 15, fontWeight: "600" as const },
  supplierStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  supplierStatusText: { fontSize: 10, fontWeight: "600" as const },
  supplierMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  supplierMetaText: { fontSize: 12 },
  supplierMetaDot: { fontSize: 12 },
  detailHeader: { alignItems: "center", gap: 8, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  backBtn: { alignSelf: "flex-start" },
  detailAvatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" },
  detailName: { fontSize: 20, fontWeight: "700" as const },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 12, fontWeight: "600" as const },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: (width - 60) / 2, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: "center", gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "700" as const },
  statLabel: { fontSize: 12 },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 4, gap: 0 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "500" as const, flex: 1, textAlign: "right" },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14 },
  actionBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
});
