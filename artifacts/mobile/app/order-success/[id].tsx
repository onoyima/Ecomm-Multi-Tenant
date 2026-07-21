import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

function ConfettiDot({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * width - width / 2).current;
  const rotation = useRef(Math.random() * 720 - 360).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 400] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, x] });
  const opacity = anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${rotation}deg`] });

  return (
    <Animated.View
      style={[styles.confettiDot, { backgroundColor: color, opacity, transform: [{ translateY }, { translateX }, { rotate }] }]}
    />
  );
}

const CONFETTI_COLORS = ["#5B4EFF", "#FF6B35", "#10B981", "#FFB800", "#EC4899", "#3B82F6"];
const CONFETTI_DOTS = Array.from({ length: 24 }, (_, i) => ({
  key: i,
  delay: Math.random() * 600,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
}));

export default function OrderSuccessScreen() {
  const { id, total } = useLocalSearchParams<{ id: string; total: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const checkScale = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(circleScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(contentTranslate, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const orderId = id ?? `ord-${Date.now().toString().slice(-6)}`;
  const formattedTotal = total ? `₦${parseInt(total).toLocaleString()}` : "";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#5B4EFF10", "#5B4EFF00"]} style={styles.topGrad} />

      {/* Confetti */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {CONFETTI_DOTS.map((d) => (
          <ConfettiDot key={d.key} delay={d.delay} color={d.color} />
        ))}
      </View>

      <View style={[styles.content, { paddingTop: (Platform.OS === "web" ? 80 : insets.top) + 40, paddingBottom: insets.bottom + 24 }]}>
        {/* Success Circle */}
        <Animated.View style={[styles.circleWrap, { transform: [{ scale: circleScale }] }]}>
          <View style={[styles.outerRing, { borderColor: colors.success + "30" }]}>
            <View style={[styles.innerCircle, { backgroundColor: colors.success }]}>
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Feather name="check" size={48} color="#fff" />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity: contentOpacity, transform: [{ translateY: contentTranslate }] }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Order Placed!</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your order has been confirmed and will be processed shortly.
          </Text>

          {/* Order Info Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Order Number</Text>
              <Text style={[styles.cardValue, { color: colors.foreground }]}>#{orderId}</Text>
            </View>
            {formattedTotal && (
              <View style={[styles.cardRow, { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
                <Text style={[styles.cardValue, { color: colors.primary, fontWeight: "700" }]}>{formattedTotal}</Text>
              </View>
            )}
            <View style={[styles.cardRow, { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Estimated Delivery</Text>
              <Text style={[styles.cardValue, { color: colors.foreground }]}>3–5 Business Days</Text>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.steps}>
            {[
              { icon: "check-circle", label: "Order Confirmed", done: true },
              { icon: "package", label: "Being Prepared", done: false },
              { icon: "truck", label: "Out for Delivery", done: false },
              { icon: "home", label: "Delivered", done: false },
            ].map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepIcon, { backgroundColor: step.done ? colors.success + "20" : colors.muted }]}>
                  <Feather name={step.icon as any} size={16} color={step.done ? colors.success : colors.mutedForeground} />
                </View>
                {i < 3 && <View style={[styles.stepLine, { backgroundColor: step.done ? colors.success : colors.border }]} />}
              </View>
            ))}
          </View>
          <View style={styles.stepsLabels}>
            {["Confirmed", "Preparing", "Delivery", "Done"].map((l, i) => (
              <Text key={i} style={[styles.stepLabel, { color: i === 0 ? colors.success : colors.mutedForeground }]}>{l}</Text>
            ))}
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, { opacity: contentOpacity }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace(`/order/${orderId}`)}
          >
            <Feather name="package" size={17} color="#fff" />
            <Text style={styles.primaryBtnText}>Track My Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.replace("/(customer)/home")}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 300 },
  confettiContainer: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", height: 400, overflow: "hidden" },
  confettiDot: { position: "absolute", width: 10, height: 10, borderRadius: 3, top: 100 },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 24, justifyContent: "center" },
  circleWrap: { marginBottom: 28 },
  outerRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  innerCircle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  textBlock: { width: "100%", alignItems: "center" },
  title: { fontSize: 30, fontWeight: "700" as const, marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  card: { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 28 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13 },
  cardLabel: { fontSize: 13 },
  cardValue: { fontSize: 13, fontWeight: "600" as const },
  steps: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 10 },
  stepItem: { flex: 1, flexDirection: "row", alignItems: "center" },
  stepIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  stepLine: { flex: 1, height: 2 },
  stepsLabels: { flexDirection: "row", width: "100%", paddingHorizontal: 0, marginTop: 8, marginBottom: 32 },
  stepLabel: { flex: 1, textAlign: "center", fontSize: 11 },
  actions: { width: "100%", gap: 12 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: 16 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
  secondaryBtn: { height: 50, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryBtnText: { fontSize: 15, fontWeight: "500" as const },
});
