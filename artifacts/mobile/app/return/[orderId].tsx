import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrder, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const RETURN_REASONS = [
  { id: "wrong_item", label: "Wrong item delivered", icon: "package" },
  { id: "damaged", label: "Item arrived damaged", icon: "alert-triangle" },
  { id: "not_as_described", label: "Not as described", icon: "info" },
  { id: "defective", label: "Defective/Not working", icon: "x-octagon" },
  { id: "changed_mind", label: "Changed my mind", icon: "rotate-ccw" },
  { id: "late_delivery", label: "Arrived too late", icon: "clock" },
];

export default function ReturnScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"items" | "reason" | "refund">("items");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: order } = useOrder(orderId ?? "");
  const items = order?.items ?? [];

  const toggleItem = (i: number) => {
    setSelectedItems((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const refundAmount = selectedItems.reduce((sum, i) => sum + (items[i]?.price ?? 0) * (items[i]?.qty ?? 1), 0);

  const handleSubmit = () => {
    if (!reason) { Alert.alert("Select Reason", "Please select a return reason"); return; }
    if (!bankName || !accountNumber || !accountName) { Alert.alert("Missing Info", "Fill in all bank details for refund"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Return Requested",
        `Your return request has been submitted. You'll receive ₦${refundAmount.toLocaleString()} within 5-7 business days.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    }, 1500);
  };

  const STEPS = ["items", "reason", "refund"] as const;
  const stepIdx = STEPS.indexOf(step);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => step === "items" ? router.back() : setStep(STEPS[stepIdx - 1]!)} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Return / Refund</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {["Select Items", "Reason", "Refund Info"].map((label, i) => (
          <React.Fragment key={label}>
            <View style={styles.stepChip}>
              <View style={[styles.stepNum, { backgroundColor: i <= stepIdx ? colors.primary : colors.muted }]}>
                <Text style={[styles.stepNumText, { color: i <= stepIdx ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: i <= stepIdx ? colors.primary : colors.mutedForeground }]}>{label}</Text>
            </View>
            {i < 2 && <View style={[styles.stepConnector, { backgroundColor: i < stepIdx ? colors.primary : colors.border }]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
        {step === "items" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Which items are you returning?</Text>
            {items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: selectedItems.includes(i) ? colors.primary : colors.border }]}
                onPress={() => toggleItem(i)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                </View>
                <View style={[styles.checkbox, { borderColor: selectedItems.includes(i) ? colors.primary : colors.border, backgroundColor: selectedItems.includes(i) ? colors.primary : "transparent" }]}>
                  {selectedItems.includes(i) && <Feather name="check" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === "reason" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Why are you returning?</Text>
            {RETURN_REASONS.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.reasonCard, { backgroundColor: colors.card, borderColor: reason === r.id ? colors.primary : colors.border }]}
                onPress={() => setReason(r.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.reasonIcon, { backgroundColor: reason === r.id ? colors.primary + "20" : colors.muted }]}>
                  <Feather name={r.icon as any} size={18} color={reason === r.id ? colors.primary : colors.mutedForeground} />
                </View>
                <Text style={[styles.reasonLabel, { color: colors.foreground }]}>{r.label}</Text>
                {reason === r.id && <Feather name="check-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TextInput
              style={[styles.descInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Additional details (optional)..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
          </>
        )}

        {step === "refund" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Refund Details</Text>

            <View style={[styles.refundAmount, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
              <Text style={[styles.refundLabel, { color: colors.success }]}>Refund Amount</Text>
              <Text style={[styles.refundValue, { color: colors.success }]}>{formatPrice(refundAmount)}</Text>
              <Text style={[styles.refundNote, { color: colors.mutedForeground }]}>Estimated 5-7 business days</Text>
            </View>

            {[
              { label: "Bank Name", value: bankName, setter: setBankName, placeholder: "e.g. GTBank, Access Bank" },
              { label: "Account Number", value: accountNumber, setter: setAccountNumber, placeholder: "10-digit account number", keyboardType: "numeric" as const },
              { label: "Account Name", value: accountName, setter: setAccountName, placeholder: "As it appears on your bank statement" },
            ].map((field) => (
              <View key={field.label} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={field.keyboardType}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        {step !== "refund" ? (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary, opacity: step === "items" && selectedItems.length === 0 ? 0.5 : 1 }]}
            onPress={() => step === "items" ? (selectedItems.length > 0 ? setStep("reason") : null) : setStep("refund")}
            disabled={step === "items" && selectedItems.length === 0}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <Feather name="arrow-right" size={17} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Feather name={loading ? "loader" : "check-circle"} size={17} color={loading ? colors.mutedForeground : "#fff"} />
            <Text style={[styles.nextBtnText, { color: loading ? colors.mutedForeground : "#fff" }]}>
              {loading ? "Submitting..." : "Submit Return Request"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  stepIndicator: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  stepChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 12, fontWeight: "700" as const },
  stepText: { fontSize: 12, fontWeight: "500" as const },
  stepConnector: { flex: 1, height: 2, marginHorizontal: 8 },
  content: { padding: 16, gap: 12 },
  stepTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 4 },
  itemCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 12 },
  itemImg: { width: 52, height: 52, borderRadius: 10 },
  itemTitle: { fontSize: 14, fontWeight: "500" as const },
  itemPrice: { fontSize: 13, fontWeight: "600" as const, marginTop: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  reasonCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  reasonIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reasonLabel: { flex: 1, fontSize: 14 },
  descInput: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 80, textAlignVertical: "top", fontSize: 14 },
  refundAmount: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 8 },
  refundLabel: { fontSize: 13, marginBottom: 4 },
  refundValue: { fontSize: 32, fontWeight: "700" as const },
  refundNote: { fontSize: 12, marginTop: 6 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: "600" as const },
  fieldInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 50, fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
});
