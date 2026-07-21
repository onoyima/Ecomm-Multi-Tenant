import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OrderStatusBadge } from "@/components/Badge";
import { useOrder, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order } = useOrder(id ?? "");

  if (!order) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Order not found</Text>
      </View>
    );
  }

  const currentStep = STEPS.indexOf(order.status);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Status Header */}
      <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statusTop}>
          <View>
            <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order #{order.id}</Text>
            <Text style={[styles.orderDate, { color: colors.foreground }]}>{order.date}</Text>
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        {/* Progress */}
        {order.status !== "cancelled" && (
          <View style={styles.progress}>
            {STEPS.slice(0, 5).map((step, i) => (
              <React.Fragment key={step}>
                <View style={styles.stepContainer}>
                  <View style={[
                    styles.stepDot,
                    {
                      backgroundColor: i <= currentStep ? colors.primary : colors.border,
                      borderColor: i <= currentStep ? colors.primary : colors.border,
                    },
                  ]}>
                    {i < currentStep && <Feather name="check" size={10} color="#fff" />}
                  </View>
                  <Text style={[styles.stepLabel, { color: i <= currentStep ? colors.primary : colors.mutedForeground }]}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Text>
                </View>
                {i < STEPS.length - 2 && (
                  <View style={[styles.stepLine, { backgroundColor: i < currentStep ? colors.primary : colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        {order.trackingNumber && (
          <View style={[styles.trackingBox, { backgroundColor: colors.muted }]}>
            <Feather name="truck" size={15} color={colors.primary} />
            <View style={styles.trackingInfo}>
              <Text style={[styles.trackingCarrier, { color: colors.foreground }]}>{order.carrier}</Text>
              <Text style={[styles.trackingNumber, { color: colors.mutedForeground }]}>{order.trackingNumber}</Text>
            </View>
            <TouchableOpacity style={[styles.trackBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/tracking/${order.id}`)}>
              <Text style={styles.trackBtnText}>Track</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.estimatedDelivery && (
          <View style={styles.etaRow}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text style={[styles.etaText, { color: colors.mutedForeground }]}>
              Estimated delivery: {order.estimatedDelivery}
            </Text>
          </View>
        )}
      </View>

      {/* Items */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>Qty: {item.qty}</Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Summary</Text>
        {[
          { label: "Subtotal", value: formatPrice(order.total - 2500) },
          { label: "Shipping", value: "₦2,500" },
          { label: "Payment Method", value: order.paymentMethod },
        ].map((r) => (
          <View key={r.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{r.value}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(order.total)}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
        <View style={styles.addressRow}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.addressText, { color: colors.foreground }]}>{order.shippingAddress}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {order.status === "delivered" && (
          <>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/review/${order.id}`)}>
              <Feather name="star" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Write a Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning }]} onPress={() => router.push(`/return/${order.id}`)}>
              <Feather name="rotate-ccw" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Return / Refund</Text>
            </TouchableOpacity>
          </>
        )}
        {["pending", "confirmed"].includes(order.status) && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive }]}>
            <Feather name="x-circle" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
        {order.status === "shipped" && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/tracking/${order.id}`)}>
            <Feather name="truck" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Track Live</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
          <Feather name="message-circle" size={16} color={colors.foreground} />
          <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16 },
  statusCard: {
    margin: 16, borderRadius: 16, borderWidth: 1, padding: 16,
  },
  statusTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  orderId: { fontSize: 12, marginBottom: 4 },
  orderDate: { fontSize: 16, fontWeight: "600" as const },
  progress: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  stepContainer: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 4,
  },
  stepLabel: { fontSize: 9, textAlign: "center" },
  stepLine: { flex: 1, height: 2, marginTop: 10, marginHorizontal: 2 },
  trackingBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 12, marginBottom: 10,
  },
  trackingInfo: { flex: 1 },
  trackingCarrier: { fontSize: 13, fontWeight: "600" as const },
  trackingNumber: { fontSize: 11, marginTop: 1 },
  trackBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  trackBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
  etaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  etaText: { fontSize: 13 },
  section: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 14 },
  itemRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingBottom: 12, borderBottomWidth: 0.5, marginBottom: 12,
  },
  itemImg: { width: 48, height: 48, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: "500" as const },
  itemQty: { fontSize: 11, marginTop: 3 },
  itemPrice: { fontSize: 14, fontWeight: "600" as const },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 0.5,
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: "500" as const },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10 },
  totalLabel: { fontSize: 16, fontWeight: "700" as const },
  totalValue: { fontSize: 18, fontWeight: "700" as const },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  addressText: { flex: 1, fontSize: 14, lineHeight: 22 },
  actions: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 48, borderRadius: 14,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },
});
