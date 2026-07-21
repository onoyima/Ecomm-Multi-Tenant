import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { vendor } from "@workspace/api-client-react";

export default function ProfileEditScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await vendor.getMe();
        setName(data.name ?? user?.name ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? user?.email ?? "");
      } catch {
        // keep defaults from user context
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      Alert.alert("Photo Updated", "Profile photo will be updated after saving.");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing Fields", "Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      await vendor.updateMe({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Profile Updated", "Your personal information has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Personal Info</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePickPhoto}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={[styles.editOverlay, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: colors.primary }]}>Tap to change photo</Text>
        </View>

        {/* Fields */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Basic Info</Text>

          {[
            { label: "Full Name", value: name, setter: setName, icon: "user", placeholder: "Your full name" },
            { label: "Phone Number", value: phone, setter: setPhone, icon: "phone", placeholder: "e.g. 08012345678" },
            { label: "Email Address", value: email, setter: setEmail, icon: "mail", placeholder: "your@email.com", editable: false },
          ].map((field, i) => (
            <View key={field.label} style={[styles.field, i < 2 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
              <View style={styles.fieldLabelRow}>
                <Feather name={field.icon as any} size={14} color={colors.mutedForeground} />
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
              </View>
              <TextInput
                style={[styles.fieldInput, { color: field.editable === false ? colors.mutedForeground : colors.foreground }]}
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                editable={field.editable !== false}
              />
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Additional Info</Text>

          <View style={[styles.field, { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Gender</Text>
            <View style={styles.genderRow}>
              {["Male", "Female", "Other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, { backgroundColor: gender === g ? colors.primary : colors.muted, borderColor: gender === g ? colors.primary : colors.border }]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderBtnText, { color: gender === g ? "#fff" : colors.mutedForeground }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date of Birth</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.foreground }]}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Security</Text>
          <TouchableOpacity style={styles.securityItem}>
            <View style={[styles.securityIcon, { backgroundColor: colors.muted }]}>
              <Feather name="lock" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityLabel, { color: colors.foreground }]}>Change Password</Text>
              <Text style={[styles.securitySub, { color: colors.mutedForeground }]}>Last changed 3 months ago</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.securityItem, { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
            <View style={[styles.securityIcon, { backgroundColor: colors.muted }]}>
              <Feather name="smartphone" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityLabel, { color: colors.foreground }]}>Two-Factor Authentication</Text>
              <Text style={[styles.securitySub, { color: colors.mutedForeground }]}>Not enabled</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: saving ? colors.muted : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name={saving ? "loader" : "check"} size={17} color={saving ? colors.mutedForeground : "#fff"} />
          <Text style={[styles.submitBtnText, { color: saving ? colors.mutedForeground : "#fff" }]}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
  content: { padding: 16, gap: 16 },
  avatarSection: { alignItems: "center", paddingVertical: 8 },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatar: { width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 32, fontWeight: "700" as const, color: "#fff" },
  editOverlay: { position: "absolute", bottom: -4, right: -4, width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  changePhotoText: { fontSize: 13, fontWeight: "500" as const },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  sectionTitle: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.5, textTransform: "uppercase", paddingHorizontal: 16, paddingVertical: 10 },
  field: { paddingHorizontal: 16, paddingVertical: 10 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "500" as const },
  fieldInput: { fontSize: 15, paddingVertical: 4 },
  genderRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  genderBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  genderBtnText: { fontSize: 13, fontWeight: "500" as const },
  securityItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  securityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  securityLabel: { fontSize: 14 },
  securitySub: { fontSize: 12, marginTop: 2 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  submitBtnText: { fontSize: 16, fontWeight: "600" as const },
});
