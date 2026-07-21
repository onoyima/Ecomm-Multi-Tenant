import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrder } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface TrackingEvent {
  status: string;
  description: string;
  timestamp?: string;
  location: string;
  completed: boolean;
  current?: boolean;
}

const TRACKING_EVENTS: Record<string, TrackingEvent[]> = {
  "ord-001": [
    { status: "Order Placed", description: "Your order was received and payment verified via Paystack", timestamp: "May 10, 2026 · 9:12 AM", location: "ShopDrop Platform", completed: true },
    { status: "Order Confirmed", description: "Vendor Kicks Hub NG confirmed your order", timestamp: "May 10, 2026 · 11:30 AM", location: "Lagos, NG", completed: true },
    { status: "Packed & Dispatched", description: "Your package was sealed and handed to DHL Express", timestamp: "May 11, 2026 · 2:00 PM", location: "Lagos Island Warehouse", completed: true },
    { status: "In Transit", description: "Package in transit via DHL Express · TN: DHL-NG-29847651", timestamp: "May 12, 2026 · 8:45 AM", location: "Lagos Main Hub", completed: true, current: true },
    { status: "Out for Delivery", description: "Driver is on the way to your address", location: "Ikoyi, Lagos", completed: false },
    { status: "Delivered", description: "Package delivered to your address", location: "15 Banana Island Road", completed: false },
  ],
};

function TimelineItem({ event, index, isLast }: { event: TrackingEvent; index: number; isLast: boolean }) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    }, index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  const dotColor = event.completed ? colors.primary : event.current ? colors.accent : colors.border;
  const lineColor = event.completed ? colors.primary : colors.border;

  return (
    <Animated.View style={[styles.timelineItem, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.timelineLeft}>
        <View style={[styles.dot, { backgroundColor: dotColor, borderColor: event.current ? dotColor : "transparent" }]}>
          {event.completed && <Feather name="check" size={10} color="#fff" />}
          {event.current && !event.completed && <View style={[styles.dotPulse, { backgroundColor: colors.accent }]} />}
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
      </View>
      <View style={[styles.timelineContent, !isLast && { paddingBottom: 28 }]}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventStatus, { color: event.completed || event.current ? colors.foreground : colors.mutedForeground, fontWeight: event.current ? "700" : "600" }]}>
            {event.status}
          </Text>
          {event.current && (
            <View style={[styles.currentBadge, { backgroundColor: colors.accent + "20" }]}>
              <View style={[styles.pulseDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.currentBadgeText, { color: colors.accent }]}>Current</Text>
            </View>
          )}
        </View>
        <Text style={[styles.eventDesc, { color: colors.mutedForeground }]}>{event.description}</Text>
        <View style={styles.eventMeta}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.eventLocation, { color: colors.mutedForeground }]}>{event.location}</Text>
        </View>
        {event.timestamp && (
          <View style={styles.eventMeta}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>{event.timestamp}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: order } = useOrder(id ?? "");
  const events = TRACKING_EVENTS[id ?? ""] ?? TRACKING_EVENTS["ord-001"]!;
  const currentIndex = events.findLastIndex((e) => e.completed);
  const progress = events.length ? (currentIndex + 1) / events.length : 0;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress, duration: 1200, useNativeDriver: false }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#5B4EFF", "#3A2FD9"]} style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Feather name="share-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Order ID + Carrier */}
        <View style={styles.trackingInfo}>
          <View style={styles.trackingRow}>
            <Feather name="package" size={15} color="rgba(255,255,255,0.7)" />
            <Text style={styles.trackingLabel}>Order #{id}</Text>
          </View>
          {order?.trackingNumber && (
            <View style={styles.trackingRow}>
              <Feather name="truck" size={15} color="rgba(255,255,255,0.7)" />
              <Text style={styles.trackingLabel}>{order.carrier} · {order.trackingNumber}</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Delivery Progress</Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: "#fff" }]} />
          </View>
          {order?.estimatedDelivery && (
            <Text style={styles.etaText}>
              <Feather name="calendar" size={12} /> Estimated: {order.estimatedDelivery}
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Timeline */}
      <ScrollView contentContainerStyle={[styles.timeline, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Tracking Events</Text>
        {events.map((event, i) => (
          <TimelineItem key={i} event={event} index={i} isLast={i === events.length - 1} />
        ))}

        {/* Help Card */}
        <View style={[styles.helpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="help-circle" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.helpTitle, { color: colors.foreground }]}>Need help with delivery?</Text>
            <Text style={[styles.helpSub, { color: colors.mutedForeground }]}>Contact our support team</Text>
          </View>
          <TouchableOpacity style={[styles.helpBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.helpBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" as const },
  shareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  trackingInfo: { gap: 6, marginBottom: 20 },
  trackingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  trackingLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  progressSection: {},
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  progressPct: { color: "#fff", fontSize: 13, fontWeight: "700" as const },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 3 },
  etaText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  timeline: { padding: 20 },
  timelineTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 24 },
  timelineItem: { flexDirection: "row" },
  timelineLeft: { alignItems: "center", width: 32, marginRight: 14 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, zIndex: 1 },
  dotPulse: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, marginTop: 4, borderRadius: 1 },
  timelineContent: { flex: 1, paddingBottom: 8 },
  eventHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  eventStatus: { fontSize: 15 },
  currentBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  currentBadgeText: { fontSize: 11, fontWeight: "600" as const },
  eventDesc: { fontSize: 13, lineHeight: 19, marginBottom: 6 },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  eventLocation: { fontSize: 11 },
  eventTime: { fontSize: 11 },
  helpCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8 },
  helpTitle: { fontSize: 14, fontWeight: "600" as const },
  helpSub: { fontSize: 12, marginTop: 2 },
  helpBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  helpBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
});
