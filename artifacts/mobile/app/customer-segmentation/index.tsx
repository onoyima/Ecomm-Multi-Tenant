import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface Segment {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  avgOrder: number;
  totalRevenue: number;
  customers: { name: string; email: string; orders: number; spent: number }[];
}

export default function CustomerSegmentationScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // TODO: Wire to customer segmentation API when available — using MOCK_SEGMENTS inline for now
  const MOCK_SEGMENTS: Segment[] = [
    {
      id: "new", name: "New Customers", icon: "user-plus", color: "#5B4EFF",
      count: 342, avgOrder: 18500, totalRevenue: 6327000,
      customers: [
        { name: "Chioma Okafor", email: "chioma.o@email.com", orders: 1, spent: 18500 },
        { name: "Emeka Nwosu", email: "emeka.n@email.com", orders: 1, spent: 32000 },
        { name: "Zainab Abdullah", email: "zainab.a@email.com", orders: 1, spent: 12500 },
      ],
    },
    {
      id: "repeat", name: "Repeat Buyers", icon: "refresh-cw", color: "#10B981",
      count: 187, avgOrder: 28500, totalRevenue: 5329500,
      customers: [
        { name: "Tunde Balogun", email: "tunde.b@email.com", orders: 5, spent: 142000 },
        { name: "Grace Okonkwo", email: "grace.o@email.com", orders: 3, spent: 78500 },
      ],
    },
    {
      id: "high", name: "High Spenders", icon: "award", color: "#FF6B35",
      count: 64, avgOrder: 95000, totalRevenue: 6080000,
      customers: [
        { name: "Dr. Adekunle Fashola", email: "a.fashola@email.com", orders: 7, spent: 845000 },
        { name: "Ngozi Eze", email: "ngozi.e@email.com", orders: 4, spent: 420000 },
      ],
    },
    {
      id: "inactive", name: "Inactive", icon: "clock", color: "#6B7280",
      count: 521, avgOrder: 0, totalRevenue: 0,
      customers: [
        { name: "Kelechi Ibe", email: "kelechi.i@email.com", orders: 0, spent: 0 },
        { name: "Fatima Usman", email: "fatima.u@email.com", orders: 0, spent: 0 },
      ],
    },
    {
      id: "vip", name: "VIP", icon: "star", color: "#FFB800",
      count: 28, avgOrder: 145000, totalRevenue: 4060000,
      customers: [
        { name: "Oluwatoyin Bakare", email: "toyin.b@email.com", orders: 12, spent: 1250000 },
        { name: "Chief Ikenna Okafor", email: "ikenna.o@email.com", orders: 9, spent: 980000 },
        { name: "Hauwa Mohammed", email: "hauwa.m@email.com", orders: 8, spent: 845000 },
      ],
    },
  ];

  if (selectedSegment) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      >
        <View style={[styles.detailHeader, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedSegment(null)}>
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.detailIcon, { backgroundColor: selectedSegment.color + "20" }]}>
            <Feather name={selectedSegment.icon as any} size={28} color={selectedSegment.color} />
          </View>
          <Text style={[styles.detailName, { color: colors.foreground }]}>{selectedSegment.name}</Text>
          <Text style={[styles.detailCount, { color: colors.mutedForeground }]}>{selectedSegment.count} customers</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.segmentMetrics}>
            {[
              { label: "Avg Order", value: formatPrice(selectedSegment.avgOrder) },
              { label: "Total Revenue", value: formatPrice(selectedSegment.totalRevenue) },
            ].map((m) => (
              <View key={m.label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>{m.value}</Text>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Customers</Text>
          {selectedSegment.customers.map((c, i) => (
            <View key={i} style={[styles.customerRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.customerAvatar, { backgroundColor: selectedSegment.color + "20" }]}>
                <Text style={[styles.customerInitial, { color: selectedSegment.color }]}>
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: colors.foreground }]}>{c.name}</Text>
                <Text style={[styles.customerEmail, { color: colors.mutedForeground }]}>{c.email}</Text>
              </View>
              <View style={styles.customerStats}>
                <Text style={[styles.customerOrders, { color: colors.foreground }]}>{c.orders} orders</Text>
                <Text style={[styles.customerSpent, { color: colors.primary }]}>{formatPrice(c.spent)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.actionsRow}>
            {[
              { icon: "mail", label: "Email All", color: colors.primary },
              { icon: "message-circle", label: "Send Push", color: "#10B981" },
              { icon: "percent", label: "Create Offer", color: "#FF6B35" },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={[styles.actionBtn, { backgroundColor: a.color }]}
              >
                <Feather name={a.icon as any} size={16} color="#fff" />
                <Text style={styles.actionBtnText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
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
      <LinearGradient colors={["#FF6B35", "#E55D2B"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="users" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Customer Segmentation</Text>
            <Text style={styles.headerSub}>Understand your audience</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {MOCK_SEGMENTS.map((seg) => (
          <TouchableOpacity
            key={seg.id}
            style={[styles.segmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelectedSegment(seg)}
          >
            <View style={styles.segmentTop}>
              <View style={[styles.segmentIcon, { backgroundColor: seg.color + "20" }]}>
                <Feather name={seg.icon as any} size={20} color={seg.color} />
              </View>
              <View style={styles.segmentInfo}>
                <Text style={[styles.segmentName, { color: colors.foreground }]}>{seg.name}</Text>
                <Text style={[styles.segmentCount, { color: colors.mutedForeground }]}>{seg.count} customers</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
            <View style={[styles.segmentStats, { borderTopColor: colors.border }]}>
              <View style={styles.segmentStat}>
                <Text style={[styles.segmentStatLabel, { color: colors.mutedForeground }]}>Avg Order</Text>
                <Text style={[styles.segmentStatValue, { color: colors.foreground }]}>{formatPrice(seg.avgOrder)}</Text>
              </View>
              <View style={[styles.segmentStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.segmentStat}>
                <Text style={[styles.segmentStatLabel, { color: colors.mutedForeground }]}>Revenue</Text>
                <Text style={[styles.segmentStatValue, { color: colors.primary }]}>{formatPrice(seg.totalRevenue)}</Text>
              </View>
            </View>
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
  segmentCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  segmentTop: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  segmentIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  segmentInfo: { flex: 1 },
  segmentName: { fontSize: 15, fontWeight: "600" as const },
  segmentCount: { fontSize: 12, marginTop: 2 },
  segmentStats: { flexDirection: "row", padding: 14, borderTopWidth: 0.5 },
  segmentStat: { flex: 1, alignItems: "center" },
  segmentStatLabel: { fontSize: 11 },
  segmentStatValue: { fontSize: 16, fontWeight: "700" as const, marginTop: 2 },
  segmentStatDivider: { width: 1, marginHorizontal: 12 },
  detailHeader: { alignItems: "center", gap: 8, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  backBtn: { alignSelf: "flex-start" },
  detailIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  detailName: { fontSize: 20, fontWeight: "700" as const },
  detailCount: { fontSize: 13 },
  segmentMetrics: { flexDirection: "row", gap: 12 },
  metricCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: "center", gap: 4,
  },
  metricValue: { fontSize: 16, fontWeight: "700" as const },
  metricLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 4 },
  customerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  customerAvatar: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  customerInitial: { fontSize: 14, fontWeight: "700" as const },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: "600" as const },
  customerEmail: { fontSize: 11, marginTop: 1 },
  customerStats: { alignItems: "flex-end" },
  customerOrders: { fontSize: 12 },
  customerSpent: { fontSize: 14, fontWeight: "700" as const },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  actionBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 12 },
});
