import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProducts, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

// TODO: Fetch SEO score + keyword suggestions from backend when available
const { width } = Dimensions.get("window");

const KEYWORD_SUGGESTIONS = [
  "best price", "Nigeria", "original", "2026 collection", "fast delivery in Lagos",
  "affordable", "premium quality", "shop online", "buy now", "hot selling",
  "trending", "authentic", "limited edition", "free shipping", "top rated",
];

const OVERALL_SCORE = 72;

export default function SEODashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const { data: allProducts = [] } = useProducts();
  const seoProducts = allProducts.slice(0, 6).map((p) => ({
    ...p,
    seoScore: Math.floor(Math.random() * 40) + 55,
    issues: [
      "Missing meta description",
      "Low keyword density",
      "Image alt text missing",
      "Title too long",
      "Poor readability score",
    ].slice(0, Math.floor(Math.random() * 4) + 1),
  }));

  const [selectedProduct, setSelectedProduct] = useState<typeof seoProducts[0] | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  const handleSelect = (p: typeof seoProducts[0]) => {
    setSelectedProduct(p);
    setMetaTitle(p.title);
    setMetaDesc(p.description.slice(0, 120));
    setMetaKeywords(p.tags.join(", "));
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#FFB800";
    return "#EF4444";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#2D1B69", "#5B4EFF"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="search" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>SEO Dashboard</Text>
            <Text style={styles.headerSub}>Optimise your product listings</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor(OVERALL_SCORE) }]}>
            <Text style={[styles.scoreNum, { color: scoreColor(OVERALL_SCORE) }]}>{OVERALL_SCORE}</Text>
            <Text style={[styles.scoreUnit, { color: scoreColor(OVERALL_SCORE) }]}>/100</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>Overall SEO Score</Text>
            <Text style={styles.scoreSub}>
              {OVERALL_SCORE >= 80 ? "Great! Your listings are well-optimised." :
               OVERALL_SCORE >= 60 ? "Room for improvement. Review issues below." :
               "Poor optimisation. Take action to improve visibility."}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {selectedProduct ? (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedProduct(null)}>
              <Feather name="arrow-left" size={16} color={colors.primary} />
              <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to product list</Text>
            </TouchableOpacity>

            <View style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.editorTitle, { color: colors.foreground }]}>Meta Tag Editor</Text>

              <Text style={[styles.editorLabel, { color: colors.mutedForeground }]}>Meta Title</Text>
              <TextInput
                style={[styles.editorInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                value={metaTitle}
                onChangeText={setMetaTitle}
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.editorHint, { color: colors.mutedForeground }]}>{metaTitle.length}/60 characters</Text>

              <Text style={[styles.editorLabel, { color: colors.mutedForeground }]}>Meta Description</Text>
              <TextInput
                style={[styles.editorInput, styles.editorTextArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                value={metaDesc}
                onChangeText={setMetaDesc}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.editorHint, { color: colors.mutedForeground }]}>{metaDesc.length}/160 characters</Text>

              <Text style={[styles.editorLabel, { color: colors.mutedForeground }]}>Keywords (comma-separated)</Text>
              <TextInput
                style={[styles.editorInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                value={metaKeywords}
                onChangeText={setMetaKeywords}
                placeholderTextColor={colors.mutedForeground}
              />

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.serpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.serpTitle, { color: colors.mutedForeground }]}>SERP Preview</Text>
              <Text style={styles.serpUrl}>https://marketplace.ng/product/{selectedProduct.id}</Text>
              <Text style={[styles.serpMetaTitle, { color: colors.primary }]}>
                {metaTitle || selectedProduct.title}
              </Text>
              <Text style={styles.serpMetaDesc}>
                {metaDesc || selectedProduct.description.slice(0, 120)}…
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Keyword Suggestions</Text>
            <View style={styles.keywordGrid}>
              {KEYWORD_SUGGESTIONS.map((kw) => (
                <TouchableOpacity
                  key={kw}
                  style={[styles.keywordPill, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
                  onPress={() => setMetaKeywords((prev) => (prev ? prev + ", " + kw : kw))}
                >
                  <Text style={[styles.keywordText, { color: colors.primary }]}>+ {kw}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Products — SEO Scores</Text>
            {seoProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.productScoreRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSelect(p)}
              >
                <View style={styles.productScoreLeft}>
                  <View style={[styles.productScoreCircle, { borderColor: scoreColor(p.seoScore) }]}>
                    <Text style={[styles.productScoreNum, { color: scoreColor(p.seoScore) }]}>{p.seoScore}</Text>
                  </View>
                  <View style={styles.productScoreInfo}>
                    <Text style={[styles.productScoreName, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
                    <Text style={[styles.productScoreCat, { color: colors.mutedForeground }]}>{p.category}</Text>
                  </View>
                </View>
                <View style={styles.productScoreRight}>
                  <Text style={[styles.productScoreIssues, { color: p.issues.length > 2 ? colors.destructive : colors.mutedForeground }]}>
                    {p.issues.length} issues
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  scoreCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16 },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 24, fontWeight: "800" as const },
  scoreUnit: { fontSize: 10, fontWeight: "600" as const, textAlign: "center" },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 16, fontWeight: "700" as const, color: "#fff", marginBottom: 4 },
  scoreSub: { fontSize: 12, lineHeight: 18, color: "rgba(255,255,255,0.8)" },
  body: { padding: 20, gap: 14 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backBtnText: { fontSize: 14, fontWeight: "600" as const },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 4 },
  productScoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  productScoreLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  productScoreCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  productScoreNum: { fontSize: 14, fontWeight: "700" as const },
  productScoreInfo: { flex: 1 },
  productScoreName: { fontSize: 14, fontWeight: "600" as const },
  productScoreCat: { fontSize: 11, marginTop: 1 },
  productScoreRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  productScoreIssues: { fontSize: 12, fontWeight: "500" as const },
  editorCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  editorTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 8 },
  editorLabel: { fontSize: 12, fontWeight: "500" as const, marginTop: 6 },
  editorInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  editorTextArea: { minHeight: 70, textAlignVertical: "top" },
  editorHint: { fontSize: 11, textAlign: "right" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  saveBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
  serpCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  serpTitle: { fontSize: 11, fontWeight: "600" as const, textTransform: "uppercase", marginBottom: 4 },
  serpUrl: { fontSize: 12, color: "#10B981" },
  serpMetaTitle: { fontSize: 16, fontWeight: "500" as const, textDecorationLine: "underline" },
  serpMetaDesc: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  keywordGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  keywordPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  keywordText: { fontSize: 12, fontWeight: "500" as const },
});
