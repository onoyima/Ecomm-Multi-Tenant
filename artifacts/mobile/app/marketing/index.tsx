// TODO: Wire to campaigns API when available — currently using inline MOCK_CAMPAIGNS
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface Campaign {
  id: string;
  name: string;
  type: "email" | "push" | "discount";
  status: "Active" | "Draft" | "Scheduled" | "Ended";
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  scheduledDate?: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Summer Sale 2026", type: "email", status: "Active", audience: "All Customers", sent: 2850, opened: 1420, clicked: 680, converted: 234 },
  { id: "c2", name: "New Arrivals Push", type: "push", status: "Scheduled", audience: "Repeat Buyers", sent: 0, opened: 0, clicked: 0, converted: 0, scheduledDate: "May 20, 2026" },
  { id: "c3", name: "VIP Discount 20%", type: "discount", status: "Active", audience: "VIP", sent: 28, opened: 24, clicked: 22, converted: 18 },
  { id: "c4", name: "Welcome Series", type: "email", status: "Draft", audience: "New Customers", sent: 0, opened: 0, clicked: 0, converted: 0 },
  { id: "c5", name: "Flash Friday Deal", type: "push", status: "Ended", audience: "All Customers", sent: 3200, opened: 1800, clicked: 950, converted: 410 },
];

const CAMPAIGN_TYPES = ["email", "push", "discount"] as const;
const AUDIENCES = ["All Customers", "New Customers", "Repeat Buyers", "High Spenders", "VIP", "Inactive"];

export default function MarketingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const [showForm, setShowForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"email" | "push" | "discount">("email");
  const [formAudience, setFormAudience] = useState("All Customers");
  const [formSchedule, setFormSchedule] = useState("");

  const statusColor = (s: string) => {
    switch (s) {
      case "Active": return "#10B981";
      case "Draft": return "#6B7280";
      case "Scheduled": return "#5B4EFF";
      case "Ended": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const statusBg = (s: string) => {
    switch (s) {
      case "Active": return "#DCFCE7";
      case "Draft": return "#F3F4F6";
      case "Scheduled": return "#EEF2FF";
      case "Ended": return "#FEE2E2";
      default: return "#F3F4F6";
    }
  };

  const typeIcon = (t: string) => {
    switch (t) {
      case "email": return "mail";
      case "push": return "message-circle";
      case "discount": return "percent";
      default: return "mail";
    }
  };

  const handleCreate = () => {
    setShowForm(false);
    setFormName("");
    setFormType("email");
    setFormAudience("All Customers");
    setFormSchedule("");
  };

  if (selectedCampaign) {
    const openRate = selectedCampaign.sent > 0 ? Math.round((selectedCampaign.opened / selectedCampaign.sent) * 100) : 0;
    const clickRate = selectedCampaign.opened > 0 ? Math.round((selectedCampaign.clicked / selectedCampaign.opened) * 100) : 0;
    const convRate = selectedCampaign.clicked > 0 ? Math.round((selectedCampaign.converted / selectedCampaign.clicked) * 100) : 0;

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      >
        <View style={[styles.detailHeader, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCampaign(null)}>
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.detailIcon, { backgroundColor: statusBg(selectedCampaign.status) }]}>
            <Feather name={typeIcon(selectedCampaign.type) as any} size={28} color={statusColor(selectedCampaign.status)} />
          </View>
          <Text style={[styles.detailName, { color: colors.foreground }]}>{selectedCampaign.name}</Text>
          <View style={[styles.detailBadge, { backgroundColor: statusBg(selectedCampaign.status) }]}>
            <Text style={[styles.detailBadgeText, { color: statusColor(selectedCampaign.status) }]}>{selectedCampaign.status}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metricsGrid}>
            {[
              { label: "Sent", value: selectedCampaign.sent.toLocaleString() },
              { label: "Opened", value: selectedCampaign.opened.toLocaleString(), sub: openRate + "%" },
              { label: "Clicked", value: selectedCampaign.clicked.toLocaleString(), sub: clickRate + "%" },
              { label: "Converted", value: selectedCampaign.converted.toLocaleString(), sub: convRate + "%" },
            ].map((m) => (
              <View key={m.label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>{m.value}</Text>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                {m.sub && <Text style={[styles.metricSub, { color: colors.primary }]}>{m.sub}</Text>}
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Type</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{selectedCampaign.type}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Audience</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{selectedCampaign.audience}</Text>
            </View>
            {selectedCampaign.scheduledDate && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Scheduled</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{selectedCampaign.scheduledDate}</Text>
              </View>
            )}
          </View>

          <View style={[styles.templatePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.templateTitle, { color: colors.foreground }]}>Email Template Preview</Text>
            <View style={[styles.templateHeader, { backgroundColor: colors.primary }]}>
              <Text style={styles.templateHeaderText}>{selectedCampaign.name}</Text>
            </View>
            <View style={styles.templateBody}>
              <Text style={[styles.templateGreeting, { color: colors.foreground }]}>Hi {'{{customer.name}}'},</Text>
              <Text style={[styles.templateContent, { color: colors.mutedForeground }]}>
                We have some exciting news! Check out our latest collection with exclusive discounts just for you. Shop now before they run out!
              </Text>
              <TouchableOpacity style={[styles.templateCta, { backgroundColor: colors.primary }]}>
                <Text style={styles.templateCtaText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>
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
      <LinearGradient colors={["#5B4EFF", "#3A2FD9"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="speaker" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Marketing</Text>
            <Text style={styles.headerSub}>Campaigns & promotions</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowForm(!showForm)}
        >
          <Feather name={showForm ? "x" : "plus"} size={16} color="#fff" />
          <Text style={styles.createBtnText}>{showForm ? "Cancel" : "New Campaign"}</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Create Campaign</Text>

            <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Campaign Name</Text>
            <TextInput
              style={[styles.formInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="e.g. Summer Sale"
              placeholderTextColor={colors.mutedForeground}
              value={formName}
              onChangeText={setFormName}
            />

            <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Type</Text>
            <View style={styles.typeRow}>
              {CAMPAIGN_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, { backgroundColor: formType === t ? colors.primary : colors.muted, borderColor: formType === t ? colors.primary : colors.border }]}
                  onPress={() => setFormType(t)}
                >
                  <Feather name={typeIcon(t) as any} size={14} color={formType === t ? "#fff" : colors.foreground} />
                  <Text style={[styles.typeBtnText, { color: formType === t ? "#fff" : colors.foreground }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Target Audience</Text>
            <View style={styles.audienceRow}>
              {AUDIENCES.slice(0, 4).map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.audiencePill, { backgroundColor: formAudience === a ? colors.primary : colors.muted, borderColor: formAudience === a ? colors.primary : colors.border }]}
                  onPress={() => setFormAudience(a)}
                >
                  <Text style={[styles.audiencePillText, { color: formAudience === a ? "#fff" : colors.foreground }]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Schedule (optional)</Text>
            <TextInput
              style={[styles.formInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="e.g. May 20, 2026 10:00 AM"
              placeholderTextColor={colors.mutedForeground}
              value={formSchedule}
              onChangeText={setFormSchedule}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleCreate}>
              <Text style={styles.submitBtnText}>Create Campaign</Text>
            </TouchableOpacity>
          </View>
        )}

        {MOCK_CAMPAIGNS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelectedCampaign(c)}
          >
            <View style={styles.campaignTop}>
              <View style={[styles.campaignIcon, { backgroundColor: statusBg(c.status) }]}>
                <Feather name={typeIcon(c.type) as any} size={18} color={statusColor(c.status)} />
              </View>
              <View style={styles.campaignInfo}>
                <View style={styles.campaignNameRow}>
                  <Text style={[styles.campaignName, { color: colors.foreground }]}>{c.name}</Text>
                  <View style={[styles.campaignStatus, { backgroundColor: statusBg(c.status) }]}>
                    <Text style={[styles.campaignStatusText, { color: statusColor(c.status) }]}>{c.status}</Text>
                  </View>
                </View>
                <Text style={[styles.campaignMeta, { color: colors.mutedForeground }]}>
                  {c.type} · {c.audience}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
            {c.sent > 0 && (
              <View style={[styles.campaignMetrics, { borderTopColor: colors.border }]}>
                <View style={styles.cmItem}>
                  <Text style={[styles.cmValue, { color: colors.foreground }]}>{c.sent.toLocaleString()}</Text>
                  <Text style={[styles.cmLabel, { color: colors.mutedForeground }]}>Sent</Text>
                </View>
                <View style={styles.cmItem}>
                  <Text style={[styles.cmValue, { color: colors.foreground }]}>{c.opened.toLocaleString()}</Text>
                  <Text style={[styles.cmLabel, { color: colors.mutedForeground }]}>Opened</Text>
                </View>
                <View style={styles.cmItem}>
                  <Text style={[styles.cmValue, { color: colors.foreground }]}>{c.clicked.toLocaleString()}</Text>
                  <Text style={[styles.cmLabel, { color: colors.mutedForeground }]}>Clicked</Text>
                </View>
                <View style={styles.cmItem}>
                  <Text style={[styles.cmValue, { color: colors.success }]}>{c.converted.toLocaleString()}</Text>
                  <Text style={[styles.cmLabel, { color: colors.mutedForeground }]}>Converted</Text>
                </View>
              </View>
            )}
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
  body: { padding: 20, gap: 14 },
  createBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14 },
  createBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  formTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 4 },
  formLabel: { fontSize: 12, fontWeight: "500" as const },
  formInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  typeBtnText: { fontSize: 12, fontWeight: "600" as const, textTransform: "capitalize" },
  audienceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  audiencePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  audiencePillText: { fontSize: 11, fontWeight: "500" as const },
  submitBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
  campaignCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  campaignTop: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  campaignIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  campaignInfo: { flex: 1 },
  campaignNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  campaignName: { fontSize: 14, fontWeight: "600" as const },
  campaignStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  campaignStatusText: { fontSize: 10, fontWeight: "600" as const },
  campaignMeta: { fontSize: 12 },
  campaignMetrics: { flexDirection: "row", padding: 12, borderTopWidth: 0.5 },
  cmItem: { flex: 1, alignItems: "center" },
  cmValue: { fontSize: 14, fontWeight: "700" as const },
  cmLabel: { fontSize: 10, marginTop: 1 },
  detailHeader: { alignItems: "center", gap: 8, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  backBtn: { alignSelf: "flex-start" },
  detailIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  detailName: { fontSize: 20, fontWeight: "700" as const },
  detailBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 100 },
  detailBadgeText: { fontSize: 12, fontWeight: "600" as const },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: {
    width: (width - 60) / 2, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: "center", gap: 2,
  },
  metricValue: { fontSize: 20, fontWeight: "700" as const },
  metricLabel: { fontSize: 11 },
  metricSub: { fontSize: 12, fontWeight: "600" as const },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 4 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "500" as const },
  templatePreview: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  templateTitle: { fontSize: 16, fontWeight: "600" as const, padding: 14, paddingBottom: 0 },
  templateHeader: { paddingVertical: 20, paddingHorizontal: 16, alignItems: "center", marginTop: 14, marginHorizontal: 14, borderRadius: 10 },
  templateHeaderText: { color: "#fff", fontSize: 18, fontWeight: "700" as const },
  templateBody: { padding: 14, gap: 10 },
  templateGreeting: { fontSize: 14, fontWeight: "600" as const },
  templateContent: { fontSize: 13, lineHeight: 20 },
  templateCta: { paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 4 },
  templateCtaText: { color: "#fff", fontWeight: "700" as const, fontSize: 14 },
});
