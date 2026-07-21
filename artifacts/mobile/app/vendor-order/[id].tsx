import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderStatusBadge } from "@/components/Badge";
import { useVendorOrders, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const CARRIERS = ["DHL Express", "GIG Logistics", "RedStar Express", "Sendbox", "GIGL", "Fez Delivery"];

export default function VendorOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: vendorOrders = [] } = useVendorOrders();
  const order = vendorOrders.find((o) => o.id === id) ?? vendorOrders[0];
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      setStatus("confirmed");
      setLoading(false);
      Alert.alert("Order Confirmed", "Customer has been notified that their order is confirmed.");
    }, 1000);
  };

  const handleShip = () => {
    if (!trackingNumber || !carrier) {
      Alert.alert("Tracking Required", "Enter tracking number and select carrier before marking as shipped");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      setStatus("shipped");
      setShowTrackingForm(false);
      setLoading(false);
      Alert.alert("Order Shipped!", `Order marked as shipped via ${carrier}. Tracking: ${trackingNumber}`);
    }, 1200);
  };

  const handleMarkDelivered = () => {
    Alert.alert("Confirm Delivery", "Mark this order as delivered? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Delivered",
        onPress: () => {
          setLoading(true);
          setTimeout(() => {
            setStatus("delivered");
            setLoading(false);
            Alert.alert("Delivered!", "Order marked as delivered. Payment will be released from escrow within 24 hours.");
          }, 1000);
        },
      },
    ]);
  };

  const commission = Math.round(order.total * 0.1);
  const vendorPayout = order.total - commission;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Order #{id}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{order.date}</Text>
        </View>
        <OrderStatusBadge status={status} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Status Actions */}
        {status === "pending" && (
          <View style={[styles.actionBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
            <Feather name="clock" size={18} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.foreground }]}>New Order — Action Required</Text>
              <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>Confirm this order within 24 hours</Text>
            </View>
            <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: colors.success }]} onPress={handleConfirm} disabled={loading}>
              <Feather name="check" size={15} color="#fff" />
              <Text style={styles.bannerBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "confirmed" && (
          <View style={[styles.actionBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
            <Feather name="package" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Ready to Ship</Text>
              <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>Pack and ship the order</Text>
            </View>
            <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: colors.primary }]} onPress={() => setShowTrackingForm(true)}>
              <Feather name="truck" size={15} color="#fff" />
              <Text style={styles.bannerBtnText}>Ship Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "shipped" && (
          <View style={[styles.actionBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
            <Feather name="truck" size={18} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.foreground }]}>In Transit</Text>
              <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>Mark as delivered once confirmed</Text>
            </View>
            <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: colors.success }]} onPress={handleMarkDelivered}>
              <Text style={styles.bannerBtnText}>Mark Delivered</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "delivered" && (
          <View style={[styles.actionBanner, { backgroundColor: colors.success + "20", borderColor: colors.success + "40" }]}>
            <Feather name="check-circle" size={18} color={colors.success} />
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Order Completed — Payout Processing</Text>
          </View>
        )}

        {/* Shipping Form */}
        {showTrackingForm && (
          <View style={[styles.shippingForm, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Shipping Details</Text>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Tracking Number *</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                value={trackingNumber}
                onChangeText={setTrackingNumber}
                placeholder="e.g. DHL-NG-12345678"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Carrier *</Text>
              <View style={styles.carrierRow}>
                {CARRIERS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.carrierChip, { backgroundColor: carrier === c ? colors.primary : colors.muted, borderColor: carrier === c ? colors.primary : colors.border }]}
                    onPress={() => setCarrier(c)}
                  >
                    <Text style={[styles.carrierChipText, { color: carrier === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formBtns}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowTrackingForm(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shipBtn, { backgroundColor: loading ? colors.muted : colors.primary }]} onPress={handleShip} disabled={loading}>
                <Feather name="send" size={15} color={loading ? colors.mutedForeground : "#fff"} />
                <Text style={[styles.shipBtnText, { color: loading ? colors.mutedForeground : "#fff" }]}>{loading ? "Processing..." : "Confirm Shipment"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Items</Text>
          {order.items.map((item, i) => (
            <View key={i} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>Qty: {item.qty} · {formatPrice(item.price)}</Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.primary }]}>{formatPrice(item.price * item.qty)}</Text>
            </View>
          ))}
        </View>

        {/* Financials */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financials</Text>
          {[
            { label: "Order Total", value: formatPrice(order.total) },
            { label: "Platform Commission (10%)", value: `-${formatPrice(commission)}`, color: colors.destructive },
            { label: "Shipping Fee", value: formatPrice(order.shippingFee ?? 2500) },
          ].map((row) => (
            <View key={row.label} style={[styles.finRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.finLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.finValue, { color: row.color ?? colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.payoutRow}>
            <Text style={[styles.payoutLabel, { color: colors.foreground }]}>Your Payout</Text>
            <Text style={[styles.payoutValue, { color: colors.success }]}>{formatPrice(vendorPayout)}</Text>
          </View>
          <Text style={[styles.escrowNote, { color: colors.mutedForeground }]}>
            {status === "delivered" ? "✓ Payout processing (24 hrs)" : "Held in escrow until delivery confirmed"}
          </Text>
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ship To</Text>
          <View style={styles.addressRow}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.addressText, { color: colors.foreground }]}>{order.shippingAddress}</Text>
          </View>
        </View>

        {/* Tracking Info (if shipped) */}
        {(status === "shipped" || status === "delivered") && trackingNumber && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tracking Info</Text>
            <View style={[styles.trackingBox, { backgroundColor: colors.muted }]}>
              <Feather name="truck" size={16} color={colors.primary} />
              <View>
                <Text style={[styles.trackingCarrier, { color: colors.foreground }]}>{carrier}</Text>
                <Text style={[styles.trackingNum, { color: colors.mutedForeground }]}>{trackingNumber}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  headerSub: { fontSize: 12 },
  content: { padding: 16, gap: 14 },
  actionBanner: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14 },
  bannerTitle: { fontSize: 14, fontWeight: "600" as const },
  bannerSub: { fontSize: 12, marginTop: 2 },
  bannerBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  bannerBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
  shippingForm: { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 14 },
  formTitle: { fontSize: 16, fontWeight: "700" as const },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12 },
  fieldInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, fontSize: 14 },
  carrierRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  carrierChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  carrierChipText: { fontSize: 12, fontWeight: "500" as const },
  formBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontSize: 14 },
  shipBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 44, borderRadius: 12 },
  shipBtnText: { fontSize: 14, fontWeight: "600" as const },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 12, borderBottomWidth: 0.5, marginBottom: 12 },
  itemImg: { width: 50, height: 50, borderRadius: 10 },
  itemTitle: { fontSize: 13, fontWeight: "500" as const },
  itemMeta: { fontSize: 11, marginTop: 3 },
  itemTotal: { fontSize: 14, fontWeight: "700" as const },
  finRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 0.5 },
  finLabel: { fontSize: 13 },
  finValue: { fontSize: 13, fontWeight: "500" as const },
  payoutRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10 },
  payoutLabel: { fontSize: 16, fontWeight: "700" as const },
  payoutValue: { fontSize: 18, fontWeight: "700" as const },
  escrowNote: { fontSize: 11, textAlign: "right", marginTop: 4 },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  addressText: { flex: 1, fontSize: 14, lineHeight: 21 },
  trackingBox: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 12 },
  trackingCarrier: { fontSize: 13, fontWeight: "600" as const },
  trackingNum: { fontSize: 12 },
});
