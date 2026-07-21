import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const FEATURES = [
  { icon: "shopping-bag", text: "50,000+ verified products" },
  { icon: "zap", text: "AI-powered recommendations" },
  { icon: "truck", text: "Fast delivery across Nigeria" },
  { icon: "shield", text: "Secure escrow payments" },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGuest = async () => {
    const guestUser = {
      id: "guest_" + Date.now(),
      name: "Guest",
      email: "guest@shopdrop.app",
      role: "customer" as const,
      walletBalance: 0,
    };
    await AsyncStorage.setItem("@auth_user", JSON.stringify(guestUser));
    router.replace("/");
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const topPad = Platform.OS === "web" ? 80 : insets.top + 20;
  const botPad = Platform.OS === "web" ? 50 : insets.bottom + 24;

  return (
    <LinearGradient colors={["#1A1040", "#3A2FD9", "#5B4EFF"]} style={styles.container}>
      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: botPad }]}>
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={["#FF6B35", "#FF8C42"]} style={styles.logoCircle}>
              <Feather name="shopping-bag" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.logoText}>ShopDrop</Text>
          <Text style={styles.tagline}>Nigeria's AI-Powered Marketplace</Text>
          <Text style={styles.subtitle}>
            Discover, buy, and sell with the power of artificial intelligence
          </Text>
        </Animated.View>

        <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Feather name={f.icon as any} size={16} color="#FF6B35" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuest}
            activeOpacity={0.85}
          >
            <Feather name="user-plus" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.demoHint}>
            Demo: customer@demo.com or vendor@demo.com
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  hero: { alignItems: "center", marginTop: 20 },
  logoContainer: { marginBottom: 16 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  logoText: {
    fontSize: 36, fontWeight: "700" as const, color: "#fff",
    letterSpacing: -1, marginBottom: 6,
  },
  tagline: {
    fontSize: 14, color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5, marginBottom: 16,
  },
  subtitle: {
    fontSize: 16, color: "rgba(255,255,255,0.85)",
    textAlign: "center", lineHeight: 24, paddingHorizontal: 10,
  },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,107,53,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  featureText: { fontSize: 15, color: "rgba(255,255,255,0.9)", fontWeight: "500" as const },
  actions: { gap: 12 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 56, borderRadius: 16,
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  primaryBtnText: { fontSize: 17, fontWeight: "700" as const, color: "#fff" },
  secondaryBtn: {
    height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "600" as const, color: "#fff" },
  guestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 48,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  guestBtnText: { fontSize: 14, fontWeight: "500" as const, color: "rgba(255,255,255,0.7)" },
  demoHint: {
    textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4,
  },
});
