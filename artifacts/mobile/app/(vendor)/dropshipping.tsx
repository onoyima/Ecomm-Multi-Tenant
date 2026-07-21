import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dropshipping } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

interface ImportedProduct {
  id?: string;
  title: string;
  supplierPrice: number;
  suggestedMarkup: number;
  category: string;
  estimatedDelivery: string;
  supplier: string;
  aiScore: number;
  aiNotes: string;
}

const SUPPLIER_EXAMPLES = [
  "https://aliexpress.com/item/...",
  "https://cj.com/product/...",
  "https://alibaba.com/product/...",
];

export default function DropshippingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<ImportedProduct | null>(null);
  const [importedId, setImportedId] = useState<string | null>(null);
  const [markup, setMarkup] = useState("30");
  const [step, setStep] = useState<"input" | "review" | "published">("input");

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await dropshipping.create({ supplierUrl: url.trim() });
      const data = (res as any).data ?? res;
      setImported(data);
      setImportedId(data.id ?? null);
    } catch (err) {
      console.error("Import failed", err);
      Alert.alert("Import Failed", "Could not import product. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = imported
    ? Math.round(imported.supplierPrice * (1 + parseInt(markup || "0") / 100) / 100) * 100
    : 0;

  const platformFee = imported ? Math.round(finalPrice * 0.1) : 0;
  const vendorProfit = imported ? finalPrice - imported.supplierPrice - platformFee : 0;

  const handlePublish = async () => {
    if (!importedId) return;
    try {
      await dropshipping.update(importedId, { status: "published" });
      setStep("published");
    } catch (err) {
      console.error("Publish failed", err);
      Alert.alert("Publish Failed", "Could not publish the product. Please try again.");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient colors={["#2D1B69", "#5B4EFF"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="package" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Dropshipping Import</Text>
            <Text style={styles.headerSub}>Import & sell without holding inventory</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            // TODO: Wire stats to useDropshipRequests() API data
            { label: "Imported", value: "12" },
            { label: "Active", value: "9" },
            { label: "Revenue", value: "₦284k" },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {step === "published" ? (
          <View style={styles.successBox}>
            <View style={[styles.successIcon, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={40} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Product Published!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              Your dropshipping product is live on the marketplace. Orders will be automatically forwarded to {imported?.supplier}.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
              onPress={() => { setStep("input"); setUrl(""); setImported(null); }}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Import Another Product</Text>
            </TouchableOpacity>
          </View>
        ) : step === "input" ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Import from Supplier URL</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Paste a product URL from AliExpress, CJ Dropshipping, or Alibaba. Our AI will extract, optimize, and validate the listing automatically.
            </Text>

            <View style={[styles.inputWrap, { borderColor: loading ? colors.primary : colors.border, backgroundColor: colors.card }]}>
              <Feather name="link" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Paste product URL here…"
                placeholderTextColor={colors.mutedForeground}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {url.length > 0 && (
                <TouchableOpacity onPress={() => setUrl("")}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: url.trim() ? colors.primary : colors.muted, opacity: loading ? 0.7 : 1 }]}
              onPress={handleImport}
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="download" size={16} color={url.trim() ? "#fff" : colors.mutedForeground} />
              )}
              <Text style={[styles.primaryBtnText, { color: url.trim() ? "#fff" : colors.mutedForeground }]}>
                {loading ? "AI Processing…" : "Import & Analyze"}
              </Text>
            </TouchableOpacity>

            {loading && (
              <View style={[styles.loadingSteps, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {[
                  "Fetching product data from supplier…",
                  "Running AI validation & optimization…",
                  "Generating SEO title & description…",
                  "Checking prohibited items list…",
                ].map((s, i) => (
                  <View key={i} style={styles.loadingStep}>
                    <ActivityIndicator size="small" color={colors.primary} style={{ transform: [{ scale: 0.7 }] }} />
                    <Text style={[styles.loadingStepText, { color: colors.mutedForeground }]}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.supportedLabel, { color: colors.mutedForeground }]}>Supported suppliers:</Text>
            <View style={styles.supplierPills}>
              {["AliExpress", "CJ Dropshipping", "Alibaba", "1688", "Zendrop"].map((s) => (
                <View key={s} style={[styles.supplierPill, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Text style={[styles.supplierPillText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 32 }]}>How It Works</Text>
            {[
              { icon: "link", title: "Paste URL", desc: "Copy the product link from any supported supplier platform." },
              { icon: "cpu", title: "AI Processes", desc: "Our AI validates, rewrites, and SEO-optimizes the listing." },
              { icon: "sliders", title: "Set Your Markup", desc: "Choose your selling price. We show projected profit margin." },
              { icon: "zap", title: "Auto-Fulfillment", desc: "When a customer orders, the supplier is notified automatically." },
            ].map((step, i) => (
              <View key={i} style={[styles.howStep, { borderColor: colors.border }]}>
                <View style={[styles.howIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name={step.icon as any} size={18} color={colors.primary} />
                </View>
                <View style={styles.howContent}>
                  <Text style={[styles.howTitle, { color: colors.foreground }]}>{step.title}</Text>
                  <Text style={[styles.howDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </>
        ) : imported ? (
          <>
            <View style={[styles.aiScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.aiScoreLeft}>
                <View style={[styles.aiScoreCircle, { borderColor: "#10B981" }]}>
                  <Text style={styles.aiScoreNum}>{imported.aiScore}</Text>
                  <Text style={styles.aiScoreLabel}>AI Score</Text>
                </View>
              </View>
              <View style={styles.aiScoreRight}>
                <Text style={[styles.aiScoreTitle, { color: colors.foreground }]}>AI Analysis Complete</Text>
                <Text style={[styles.aiScoreNote, { color: colors.mutedForeground }]}>{imported.aiNotes}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Product Preview</Text>
            <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.productThumb, { backgroundColor: colors.muted }]}>
                <Feather name="package" size={32} color={colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: colors.foreground }]}>{imported.title}</Text>
                <View style={styles.productMeta}>
                  <View style={[styles.metaPill, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={[styles.metaText, { color: colors.primary }]}>{imported.category}</Text>
                  </View>
                  <View style={[styles.metaPill, { backgroundColor: "#FEF9C3" }]}>
                    <Text style={[styles.metaText, { color: "#D97706" }]}>{imported.estimatedDelivery}</Text>
                  </View>
                </View>
                <Text style={[styles.supplierName, { color: colors.mutedForeground }]}>via {imported.supplier}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Set Your Markup</Text>
            <View style={[styles.markupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.markupRow}>
                {["10", "20", "30", "40", "50"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.markupBtn, { backgroundColor: markup === m ? colors.primary : colors.muted, borderColor: markup === m ? colors.primary : colors.border }]}
                    onPress={() => setMarkup(m)}
                  >
                    <Text style={[styles.markupBtnText, { color: markup === m ? "#fff" : colors.foreground }]}>{m}%</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.pricingRows}>
                {[
                  { label: "Supplier Cost", value: `₦${imported.supplierPrice.toLocaleString()}`, note: "" },
                  { label: "Your Markup", value: `+₦${(finalPrice - imported.supplierPrice - platformFee).toLocaleString()}`, note: markup + "%" },
                  { label: "Platform Fee", value: `-₦${platformFee.toLocaleString()}`, note: "10%" },
                  { label: "Selling Price", value: `₦${finalPrice.toLocaleString()}`, note: "", bold: true },
                  { label: "Your Profit", value: `₦${vendorProfit.toLocaleString()}`, note: "per sale", green: true },
                ].map((row, i) => (
                  <View key={i} style={[styles.pricingRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.pricingLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {row.note ? <Text style={[styles.pricingNote, { color: colors.mutedForeground }]}>{row.note}</Text> : null}
                      <Text style={[styles.pricingValue, {
                        color: row.green ? "#10B981" : row.bold ? colors.primary : colors.foreground,
                        fontWeight: (row.bold || row.green) ? "700" : "500",
                        fontSize: row.bold ? 18 : 14,
                      }]}>{row.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={() => { setStep("input"); setImported(null); }}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: "#10B981", flex: 1 }]}
                onPress={handlePublish}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Publish to Marketplace</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 0 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  body: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  sectionSub: { fontSize: 13, lineHeight: 20 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 14 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  loadingSteps: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  loadingStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingStepText: { fontSize: 13 },
  supportedLabel: { fontSize: 12, marginBottom: 8 },
  supplierPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  supplierPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  supplierPillText: { fontSize: 12, fontWeight: "500" },
  howStep: { flexDirection: "row", gap: 14, paddingVertical: 14, borderBottomWidth: 1, alignItems: "flex-start" },
  howIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  howContent: { flex: 1 },
  howTitle: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  howDesc: { fontSize: 13, lineHeight: 18 },
  aiScoreCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 16, gap: 16, alignItems: "flex-start" },
  aiScoreLeft: { alignItems: "center" },
  aiScoreCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
  },
  aiScoreNum: { fontSize: 20, fontWeight: "800", color: "#10B981" },
  aiScoreLabel: { fontSize: 9, color: "#10B981", marginTop: 1 },
  aiScoreRight: { flex: 1 },
  aiScoreTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  aiScoreNote: { fontSize: 12, lineHeight: 18 },
  productCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  productThumb: { width: 90, height: 90, alignItems: "center", justifyContent: "center" },
  productInfo: { flex: 1, padding: 12 },
  productTitle: { fontSize: 14, fontWeight: "600", lineHeight: 20, marginBottom: 8 },
  productMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 6 },
  metaPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metaText: { fontSize: 11, fontWeight: "600" },
  supplierName: { fontSize: 11 },
  markupCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  markupRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  markupBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  markupBtnText: { fontSize: 13, fontWeight: "600" },
  pricingRows: {},
  pricingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderTopWidth: 1,
  },
  pricingLabel: { fontSize: 13 },
  pricingNote: { fontSize: 11 },
  pricingValue: { fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  secondaryBtn: {
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  secondaryBtnText: { fontWeight: "600", fontSize: 15 },
  successBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: "700" },
  successSub: { fontSize: 14, lineHeight: 22, textAlign: "center" },
});
