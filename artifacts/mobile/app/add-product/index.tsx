import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCategories } from "@/data/mockData";

const PRODUCT_TYPES = [
  { id: "normal", label: "Normal", icon: "package", desc: "Ship from your own inventory" },
  { id: "dropshipping", label: "Dropshipping", icon: "globe", desc: "Import from supplier URL" },
];

export default function AddProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: categories = [] } = useCategories();
  const [type, setType] = useState<"normal" | "dropshipping">("normal");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [supplierUrl, setSupplierUrl] = useState("");
  const [markup, setMarkup] = useState("30");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIOptimize = () => {
    if (!description) {
      Alert.alert("Add Description", "Enter a product description to optimize");
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setDescription(
        description +
        "\n\n[AI Optimized] This premium product delivers exceptional quality and value. Carefully curated to meet the highest standards, it features superior materials and craftsmanship. Perfect for discerning customers who appreciate quality. Ships in secure packaging with a satisfaction guarantee."
      );
      setAiLoading(false);
      Alert.alert("AI Optimization", "Your product description has been enhanced by AI for better visibility and conversion!");
    }, 1500);
  };

  const handleSave = () => {
    if (!title || !price || !category) {
      Alert.alert("Missing Fields", "Fill in title, price, and category");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Product Added!", "Your product has been submitted for review. It will be live within 24 hours.", [
        { text: "View Products", onPress: () => router.back() },
        { text: "Add Another" },
      ]);
    }, 1500);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Product Type */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Product Type</Text>
        <View style={styles.typeRow}>
          {PRODUCT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.typeOption,
                {
                  borderColor: type === t.id ? colors.primary : colors.border,
                  backgroundColor: type === t.id ? colors.primary + "10" : colors.background,
                },
              ]}
              onPress={() => setType(t.id as "normal" | "dropshipping")}
            >
              <Feather name={t.icon as any} size={20} color={type === t.id ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.typeLabel, { color: type === t.id ? colors.primary : colors.foreground }]}>
                {t.label}
              </Text>
              <Text style={[styles.typeDesc, { color: colors.mutedForeground }]}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dropshipping URL */}
      {type === "dropshipping" && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Import from Supplier</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="link" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={supplierUrl}
              onChangeText={setSupplierUrl}
              placeholder="https://aliexpress.com/item/..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={[styles.importBtn, { backgroundColor: colors.primary }]}>
            <Feather name="download" size={16} color="#fff" />
            <Text style={styles.importBtnText}>Import & Auto-Fill</Text>
          </TouchableOpacity>
          <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
            AI will automatically extract product details, images, and variants from the supplier URL
          </Text>
        </View>
      )}

      {/* Product Details */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Product Details</Text>

        {[
          { label: "Product Title *", value: title, set: setTitle, placeholder: "Enter product title...", icon: "tag" },
          { label: "Price (₦) *", value: price, set: setPrice, placeholder: "e.g. 15000", icon: "dollar-sign", numeric: true },
          { label: "Stock Quantity", value: stock, set: setStock, placeholder: "Available stock", icon: "package", numeric: true },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name={f.icon as any} size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={f.numeric ? "numeric" : "default"}
              />
            </View>
          </View>
        ))}

        {/* Category */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category *</Text>
          <View style={styles.catGrid}>
            {categories.slice(0, 6).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.catOption,
                  {
                    borderColor: category === c.name ? colors.primary : colors.border,
                    backgroundColor: category === c.name ? colors.primary + "10" : colors.muted,
                  },
                ]}
                onPress={() => setCategory(c.name)}
              >
                <Text style={[styles.catOptionText, { color: category === c.name ? colors.primary : colors.foreground }]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <View style={styles.descHeader}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Description</Text>
            <TouchableOpacity
              style={[styles.aiBtn, { backgroundColor: colors.primary + "15" }]}
              onPress={handleAIOptimize}
              disabled={aiLoading}
            >
              <Feather name="cpu" size={13} color={colors.primary} />
              <Text style={[styles.aiBtnText, { color: colors.primary }]}>
                {aiLoading ? "Optimizing..." : "AI Optimize"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.textAreaWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your product in detail..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Markup for dropshipping */}
        {type === "dropshipping" && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Profit Markup (%)</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="percent" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={markup}
                onChangeText={setMarkup}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
              AI pricing suggestion: 25-35% markup for this category
            </Text>
          </View>
        )}
      </View>

      {/* Image Upload */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Product Images</Text>
        <TouchableOpacity style={[styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Feather name="camera" size={28} color={colors.mutedForeground} />
          <Text style={[styles.uploadText, { color: colors.foreground }]}>Add Photos</Text>
          <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Up to 8 images</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <Text style={[styles.saveBtnText, { color: colors.mutedForeground }]}>Submitting for Review...</Text>
          ) : (
            <Text style={styles.saveBtnText}>Submit Product</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.reviewNote, { color: colors.mutedForeground }]}>
          Products are reviewed by our team within 24 hours before going live
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 14 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeOption: {
    flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 14, alignItems: "center", gap: 6,
  },
  typeLabel: { fontSize: 14, fontWeight: "600" as const },
  typeDesc: { fontSize: 11, textAlign: "center" },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "500" as const, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 46,
  },
  input: { flex: 1, fontSize: 14 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  catOptionText: { fontSize: 13 },
  descHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  aiBtnText: { fontSize: 12, fontWeight: "600" as const },
  textAreaWrap: { borderRadius: 12, borderWidth: 1, padding: 12 },
  textArea: { fontSize: 14, lineHeight: 21, minHeight: 100 },
  importBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 46, borderRadius: 12, marginTop: 10,
  },
  importBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
  helperText: { fontSize: 11, marginTop: 6, lineHeight: 16 },
  uploadArea: {
    borderRadius: 14, borderWidth: 2, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", padding: 30, gap: 8,
  },
  uploadText: { fontSize: 15, fontWeight: "600" as const },
  uploadSub: { fontSize: 12 },
  saveBtn: {
    height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 16,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  reviewNote: { fontSize: 12, textAlign: "center", marginTop: 10, lineHeight: 18 },
});
