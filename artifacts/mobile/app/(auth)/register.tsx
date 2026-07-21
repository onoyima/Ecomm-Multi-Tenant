import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { UserRole, useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [loading, setLoading] = useState(false);
  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad }]}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Join thousands of buyers and sellers
      </Text>

      <View style={styles.roleSelector}>
        {(["customer", "vendor"] as UserRole[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.roleOption,
              { borderColor: role === r ? colors.primary : colors.border, backgroundColor: role === r ? colors.primary + "10" : colors.card },
            ]}
            onPress={() => setRole(r)}
          >
            <Feather
              name={r === "customer" ? "shopping-bag" : "briefcase"}
              size={20}
              color={role === r ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.roleText, { color: role === r ? colors.primary : colors.mutedForeground }]}>
              {r === "customer" ? "I want to buy" : "I want to sell"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.form}>
        {[
          { label: "Full Name", value: name, set: setName, icon: "user", placeholder: "Your name", type: "default" },
          { label: "Email", value: email, set: setEmail, icon: "mail", placeholder: "your@email.com", type: "email-address" },
          { label: "Password", value: password, set: setPassword, icon: "lock", placeholder: "Create password", type: "default", secure: true },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{f.label}</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name={f.icon as any} size={17} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={f.type as any}
                autoCapitalize="none"
                secureTextEntry={!!f.secure}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 24, alignSelf: "flex-start" },
  title: { fontSize: 30, fontWeight: "700" as const, marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 24 },
  roleSelector: { flexDirection: "row", gap: 12, marginBottom: 24 },
  roleOption: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 14, borderWidth: 1.5,
  },
  roleText: { fontSize: 13, fontWeight: "600" as const },
  form: { gap: 14 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: "500" as const },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  btn: {
    height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
    marginTop: 8,
  },
  btnText: { fontSize: 17, fontWeight: "700" as const, color: "#fff" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "600" as const },
});
