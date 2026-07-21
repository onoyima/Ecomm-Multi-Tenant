import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { kyc as kycApi } from "@workspace/api-client-react";

const DOC_TYPES = [
  { id: "nin", label: "National ID (NIN)", icon: "credit-card", desc: "National Identification Number slip" },
  { id: "bvn", label: "BVN Verification", icon: "hash", desc: "Bank Verification Number" },
  { id: "drivers", label: "Driver's License", icon: "truck", desc: "Valid Nigerian driver's license" },
  { id: "passport", label: "International Passport", icon: "globe", desc: "Valid international passport" },
];

export default function KYCScreen({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [step, setStep] = useState<"type" | "docs" | "review">("type");
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await kycApi.status();
        const data = (res as any).data ?? res;
        setKycStatus(data.status ?? null);
      } catch {
        setKycStatus(null);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);

  const pickImage = async (setter: (v: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!docType || !frontImg) {
      Alert.alert("Error", "Please complete all steps");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("document_type", docType);
      formData.append("document", {
        uri: frontImg,
        type: "image/jpeg",
        name: `kyc_${docType}.jpg`,
      } as any);
      await kycApi.uploadDocument(formData);
      Alert.alert("Success", "KYC documents submitted for review");
      if (onNavigate) onNavigate("/(tabs)/profile");
      else router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to submit KYC documents");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = kycStatus === "verified";

  if (statusLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isVerified) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>KYC Verification</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.verifiedContainer}>
          <View style={[styles.verifiedCircle, { backgroundColor: colors.success + "20" }]}>
            <Feather name="check-circle" size={60} color={colors.success} />
          </View>
          <Text style={[styles.verifiedTitle, { color: colors.foreground }]}>Identity Verified</Text>
          <Text style={[styles.verifiedSub, { color: colors.mutedForeground }]}>
            Your identity has been successfully verified. You enjoy full platform benefits.
          </Text>
          <View style={[styles.benefitsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {["Higher withdrawal limits", "Verified seller badge", "Priority dispute resolution", "Access to exclusive deals"].map((b) => (
              <View key={b} style={[styles.benefitItem, { borderBottomColor: colors.border }]}>
                <Feather name="check" size={14} color={colors.success} />
                <Text style={[styles.benefitText, { color: colors.foreground }]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => step === "type" ? router.back() : setStep(step === "docs" ? "type" : "docs")}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>KYC Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step Bar */}
      <View style={[styles.stepBar, { backgroundColor: colors.muted }]}>
        {["Choose ID", "Upload Docs", "Review"].map((s, i) => {
          const idx = ["type", "docs", "review"].indexOf(step);
          return (
            <View key={s} style={styles.stepBarItem}>
              <View style={[styles.stepBarDot, { backgroundColor: i <= idx ? colors.primary : colors.border }]}>
                {i < idx ? <Feather name="check" size={10} color="#fff" /> : <Text style={[styles.stepBarNum, { color: i <= idx ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepBarLabel, { color: i <= idx ? colors.primary : colors.mutedForeground }]}>{s}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
        {step === "type" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Select ID Type</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Choose a valid government-issued ID to verify your identity
            </Text>
            {DOC_TYPES.map((dt) => (
              <TouchableOpacity
                key={dt.id}
                style={[styles.docTypeCard, { backgroundColor: colors.card, borderColor: docType === dt.id ? colors.primary : colors.border }]}
                onPress={() => setDocType(dt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.docTypeIcon, { backgroundColor: docType === dt.id ? colors.primary + "20" : colors.muted }]}>
                  <Feather name={dt.icon as any} size={22} color={docType === dt.id ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docTypeLabel, { color: colors.foreground }]}>{dt.label}</Text>
                  <Text style={[styles.docTypeDesc, { color: colors.mutedForeground }]}>{dt.desc}</Text>
                </View>
                <View style={[styles.radio, { borderColor: docType === dt.id ? colors.primary : colors.border }]}>
                  {docType === dt.id && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === "docs" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Upload Documents</Text>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Document Number</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                value={docNumber}
                onChangeText={setDocNumber}
                placeholder="Enter your document number"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            {[
              { label: "Front of Document", desc: "Clear photo of the front side", value: frontImg, setter: setFrontImg, required: true },
              { label: "Back of Document", desc: "Clear photo of the back side", value: backImg, setter: setBackImg, required: false },
              { label: "Selfie with ID", desc: "Hold your ID next to your face", value: selfie, setter: setSelfie, required: true },
            ].map((doc) => (
              <View key={doc.label} style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: doc.value ? colors.success : colors.border }]}>
                <View style={styles.uploadHeader}>
                  <Text style={[styles.uploadLabel, { color: colors.foreground }]}>
                    {doc.label} {doc.required && <Text style={{ color: colors.destructive }}>*</Text>}
                  </Text>
                  <Text style={[styles.uploadDesc, { color: colors.mutedForeground }]}>{doc.desc}</Text>
                </View>
                {doc.value ? (
                  <View style={styles.uploadedImg}>
                    <Image source={{ uri: doc.value }} style={styles.docPreview} contentFit="cover" />
                    <TouchableOpacity style={[styles.reuploadBtn, { backgroundColor: colors.muted }]} onPress={() => pickImage(doc.setter)}>
                      <Feather name="refresh-cw" size={14} color={colors.foreground} />
                      <Text style={[styles.reuploadText, { color: colors.foreground }]}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    onPress={() => pickImage(doc.setter)}
                  >
                    <Feather name="upload" size={22} color={colors.mutedForeground} />
                    <Text style={[styles.uploadBtnText, { color: colors.mutedForeground }]}>Tap to Upload</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {step === "review" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review Submission</Text>
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { label: "Document Type", value: DOC_TYPES.find((d) => d.id === docType)?.label ?? docType },
                { label: "Document Number", value: docNumber },
                { label: "Front Photo", value: frontImg ? "Uploaded ✓" : "Missing" },
                { label: "Back Photo", value: backImg ? "Uploaded ✓" : "Skipped" },
                { label: "Selfie", value: selfie ? "Uploaded ✓" : "Missing" },
              ].map((row, i, arr) => (
                <View key={row.label} style={[styles.reviewRow, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  <Text style={[styles.reviewValue, { color: row.value.includes("✓") ? colors.success : colors.foreground }]}>{row.value}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.disclaimerBox, { backgroundColor: colors.muted }]}>
              <Feather name="shield" size={16} color={colors.primary} />
              <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                Your data is encrypted and securely stored. It will only be used for identity verification.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        {step !== "review" ? (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: docType ? colors.primary : colors.muted }]}
            onPress={() => step === "type" ? (docType ? setStep("docs") : null) : setStep("review")}
            disabled={!docType}
          >
            <Text style={[styles.nextBtnText, { color: docType ? "#fff" : colors.mutedForeground }]}>Continue</Text>
            <Feather name="arrow-right" size={17} color={docType ? "#fff" : colors.mutedForeground} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: loading ? colors.muted : colors.success }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Feather name={loading ? "loader" : "send"} size={17} color={loading ? colors.mutedForeground : "#fff"} />
            <Text style={[styles.nextBtnText, { color: loading ? colors.mutedForeground : "#fff" }]}>
              {loading ? "Submitting..." : "Submit for Verification"}
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
  stepBar: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  stepBarItem: { flex: 1, alignItems: "center", gap: 5 },
  stepBarDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepBarNum: { fontSize: 12, fontWeight: "700" as const },
  stepBarLabel: { fontSize: 10, fontWeight: "500" as const, textAlign: "center" },
  content: { padding: 16, gap: 14 },
  stepTitle: { fontSize: 20, fontWeight: "700" as const, marginBottom: 4 },
  stepDesc: { fontSize: 14, lineHeight: 21 },
  docTypeCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  docTypeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  docTypeLabel: { fontSize: 14, fontWeight: "600" as const },
  docTypeDesc: { fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioFill: { width: 12, height: 12, borderRadius: 6 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: "600" as const },
  fieldInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 50, fontSize: 14 },
  uploadBox: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10 },
  uploadHeader: { gap: 3 },
  uploadLabel: { fontSize: 14, fontWeight: "600" as const },
  uploadDesc: { fontSize: 12 },
  uploadBtn: { height: 100, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
  uploadBtnText: { fontSize: 13 },
  uploadedImg: { flexDirection: "row", alignItems: "center", gap: 12 },
  docPreview: { width: 80, height: 60, borderRadius: 8 },
  reuploadBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  reuploadText: { fontSize: 13 },
  reviewCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13 },
  reviewLabel: { fontSize: 13 },
  reviewValue: { fontSize: 13, fontWeight: "600" as const },
  disclaimerBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: 14 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 20 },
  verifiedContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  verifiedCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  verifiedTitle: { fontSize: 26, fontWeight: "700" as const, marginBottom: 10 },
  verifiedSub: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  benefitsList: { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  benefitItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5 },
  benefitText: { fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  nextBtnText: { fontSize: 16, fontWeight: "600" as const },
});
