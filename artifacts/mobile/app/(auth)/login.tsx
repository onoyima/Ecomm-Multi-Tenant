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
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { socialAuth } from "@workspace/api-client-react";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Login failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setLoading(true);
    try {
      await login(demoEmail, "demo123");
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Social login coming soon", "OAuth client IDs required");
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

      <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Sign in to your ShopDrop account
      </Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="mail" size={17} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="lock" size={17} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw((v) => !v)}>
              <Feather name={showPw ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialSection}>
        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => handleSocialLogin("google")}
        >
          <Feather name="globe" size={18} color="#EA4335" />
          <Text style={[styles.socialBtnText, { color: colors.foreground }]}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => handleSocialLogin("facebook")}
        >
          <Feather name="thumbs-up" size={18} color="#1877F2" />
          <Text style={[styles.socialBtnText, { color: colors.foreground }]}>Continue with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => handleSocialLogin("apple")}
        >
          <Feather name="smartphone" size={18} color={colors.foreground} />
          <Text style={[styles.socialBtnText, { color: colors.foreground }]}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>Quick Demo</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.demoButtons}>
        <TouchableOpacity
          style={[styles.demoBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => quickLogin("customer@demo.com")}
        >
          <Feather name="user" size={16} color={colors.primary} />
          <Text style={[styles.demoBtnText, { color: colors.foreground }]}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.demoBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => quickLogin("vendor@demo.com")}
        >
          <Feather name="briefcase" size={16} color={colors.accent} />
          <Text style={[styles.demoBtnText, { color: colors.foreground }]}>Vendor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.demoBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => quickLogin("admin@demo.com")}
        >
          <Feather name="shield" size={16} color={colors.success} />
          <Text style={[styles.demoBtnText, { color: colors.foreground }]}>Admin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 28, alignSelf: "flex-start" },
  title: { fontSize: 30, fontWeight: "700" as const, marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "500" as const },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  loginBtn: {
    height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
    marginTop: 8,
  },
  loginBtnText: { fontSize: 17, fontWeight: "700" as const, color: "#fff" },
  divider: {
    flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  demoButtons: { flexDirection: "row", gap: 10, marginBottom: 24 },
  demoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, height: 46, borderRadius: 12, borderWidth: 1,
  },
  demoBtnText: { fontSize: 13, fontWeight: "600" as const },
  socialSection: { gap: 10, marginBottom: 20 },
  socialBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 50, borderRadius: 14, borderWidth: 1,
  },
  socialBtnText: { fontSize: 15, fontWeight: "600" as const },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "600" as const },
});
