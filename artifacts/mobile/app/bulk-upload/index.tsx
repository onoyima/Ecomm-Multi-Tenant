import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// TODO: Wire to vendor.products.create() API for real CSV upload when backend available
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const COLUMN_MAP = [
  { key: "title", label: "Product Title" },
  { key: "price", label: "Price" },
  { key: "category", label: "Category" },
  { key: "stock", label: "Stock" },
  { key: "description", label: "Description" },
  { key: "tags", label: "Tags" },
];

interface ParsedRow {
  title: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  tags: string;
}

// TODO: Replace MOCK_PARSED with real CSV parse results and wire to vendor.products.create() API
const MOCK_PARSED: ParsedRow[] = [
  { title: "Premium Wireless Headphones", price: 45000, category: "Electronics", stock: 30, description: "High-quality wireless headphones with ANC", tags: "headphones, wireless, audio" },
  { title: "Leather Crossbody Bag", price: 22000, category: "Fashion", stock: 18, description: "Genuine leather crossbody handbag", tags: "handbag, leather, fashion" },
  { title: "Organic Green Tea 500g", price: 3500, category: "Food", stock: 100, description: "Premium organic green tea leaves", tags: "tea, organic, beverage" },
  { title: "Yoga Mat Premium", price: 12500, category: "Sports", stock: 45, description: "Non-slip premium yoga mat 6mm", tags: "yoga, fitness, sports" },
  { title: "Smart LED Desk Lamp", price: 18500, category: "Home", stock: 22, description: "LED desk lamp with wireless charging", tags: "lamp, smart, home" },
];

export default function BulkUploadScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const [hasFile, setHasFile] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    title: "title",
    price: "price",
    category: "category",
    stock: "stock",
    description: "description",
    tags: "tags",
  });

  // TODO: Wire to vendor.products.create() in a loop for real import
  const handleImport = () => {
    setImporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#FF6B35", "#E55D2B"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="upload-cloud" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Bulk CSV Upload</Text>
            <Text style={styles.headerSub}>Import products from a CSV file</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <TouchableOpacity style={[styles.downloadBtn, { borderColor: colors.primary }]}>
          <Feather name="download" size={16} color={colors.primary} />
          <Text style={[styles.downloadBtnText, { color: colors.primary }]}>Download CSV Template</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadArea, { borderColor: hasFile ? colors.primary : colors.border, backgroundColor: colors.card }]}
          onPress={() => setHasFile(true)}
        >
          <Feather name={hasFile ? "file-text" : "upload"} size={32} color={colors.mutedForeground} />
          <Text style={[styles.uploadTitle, { color: colors.foreground }]}>
            {hasFile ? "products_export.csv" : "Tap to select CSV file"}
          </Text>
          <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
            {hasFile ? "2.4 KB — 5 products detected" : "Supports .csv files up to 5MB"}
          </Text>
          {hasFile && (
            <TouchableOpacity style={[styles.changeBtn, { borderColor: colors.border }]} onPress={() => setHasFile(false)}>
              <Text style={[styles.changeBtnText, { color: colors.foreground }]}>Change File</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {hasFile && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Column Mapping</Text>
            <View style={[styles.mappingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {COLUMN_MAP.map((col) => (
                <View key={col.key} style={[styles.mappingRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.mappingLabel, { color: colors.mutedForeground }]}>{col.label}</Text>
                  <View style={[styles.mappingPill, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={[styles.mappingValue, { color: colors.primary }]}>{col.key}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preview ({MOCK_PARSED.length} products)</Text>
            <View style={styles.table}>
              <View style={[styles.tableHeader, { backgroundColor: colors.muted }]}>
                {["Product", "Price", "Category", "Stock"].map((h) => (
                  <Text key={h} style={[styles.tableHeaderText, { color: colors.mutedForeground }]}>{h}</Text>
                ))}
              </View>
              {MOCK_PARSED.map((row, i) => (
                <View key={i} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.tableCell, { color: colors.foreground, flex: 2 }]} numberOfLines={1}>{row.title}</Text>
                  <Text style={[styles.tableCell, { color: colors.primary }]}>{formatPrice(row.price)}</Text>
                  <Text style={[styles.tableCell, { color: colors.mutedForeground }]}>{row.category}</Text>
                  <Text style={[styles.tableCell, { color: colors.foreground }]}>{row.stock}</Text>
                </View>
              ))}
            </View>

            {importing && (
              <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>Importing products…</Text>
                  <Text style={[styles.progressPct, { color: colors.primary }]}>{progress}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.primary, width: ((progress / 100) * (Dimensions.get("window").width - 72)) as any }]} />
                </View>
                <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
                  {Math.round(progress / 20)} of {MOCK_PARSED.length} products imported
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: importing ? colors.muted : colors.primary }]}
              onPress={handleImport}
              disabled={importing}
            >
              {importing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="check" size={16} color="#fff" />
              )}
              <Text style={styles.importBtnText}>
                {importing ? "Importing…" : `Import All (${MOCK_PARSED.length} products)`}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  body: { padding: 20, gap: 16 },
  downloadBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed",
  },
  downloadBtnText: { fontSize: 14, fontWeight: "600" as const },
  uploadArea: {
    alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderRadius: 16, padding: 32, borderStyle: "dashed",
  },
  uploadTitle: { fontSize: 15, fontWeight: "600" as const },
  uploadSub: { fontSize: 12 },
  changeBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 },
  changeBtnText: { fontSize: 12, fontWeight: "500" as const },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 4 },
  mappingCard: { borderRadius: 14, borderWidth: 1, padding: 4, gap: 0 },
  mappingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  mappingLabel: { fontSize: 13 },
  mappingPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  mappingValue: { fontSize: 12, fontWeight: "600" as const },
  table: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  tableHeader: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10 },
  tableHeaderText: { flex: 1, fontSize: 11, fontWeight: "600" as const, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5 },
  tableCell: { flex: 1, fontSize: 13 },
  progressCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 14, fontWeight: "600" as const },
  progressPct: { fontSize: 14, fontWeight: "700" as const },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressSub: { fontSize: 12 },
  importBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14,
  },
  importBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
});
