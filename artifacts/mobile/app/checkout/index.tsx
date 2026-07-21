import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { orders as ordersApi, guestCheckout } from "@workspace/api-client-react";

const PAYMENT_METHODS = [
  { id: "paystack", label: "Debit/Credit Card", subtitle: "Powered by Paystack", icon: "credit-card" },
  { id: "wallet", label: "Wallet Balance", subtitle: "Pay with wallet", icon: "dollar-sign" },
  { id: "pod", label: "Pay on Delivery", subtitle: "Additional ₦500 risk fee", icon: "truck" },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalAmount, clearCart } = useCart();
  const [address, setAddress] = useState("15 Banana Island Road, Ikoyi, Lagos");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const shipping = totalAmount > 50000 ? 0 : 2500;
  const podFee = paymentMethod === "pod" ? 500 : 0;
  const total = totalAmount + shipping + podFee;

  const handleOrder = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Address", "Enter a delivery address");
      return;
    }
    setLoading(true);
    try {
      const res = await ordersApi.create({ paymentMethod, notes: address });
      const data = (res as any).data ?? res;
      const orderId = data.id || `ord-${Date.now().toString().slice(-6)}`;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      router.replace(`/order-success/${orderId}?total=${total}`);
    } catch (err: any) {
      Alert.alert("Order Failed", err?.message || "Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestOrder = async () => {
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim() || !address.trim()) {
      Alert.alert("Missing Fields", "Please fill in all guest details and delivery address");
      return;
    }
    setLoading(true);
    try {
      const res = await guestCheckout.initiate({
        guestName: guestName,
        guestEmail: guestEmail,
        guestPhone: guestPhone,
        shippingAddress: address,
        items: items.map((i) => ({ productId: String(i.id), quantity: i.quantity })),
        paymentMethod,
      });
      const data = (res as any).data ?? res;
      const orderId = data.orderId || data?.order?.id || `ord-${Date.now().toString().slice(-6)}`;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      router.replace(`/order-success/${orderId}?total=${total}&guest=1`);
    } catch (err: any) {
      Alert.alert("Guest Checkout Failed", err?.message || "Could not place guest order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Guest Checkout Toggle */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.guestToggle}
            onPress={() => setGuestMode((v) => !v)}
          >
            <Feather name={guestMode ? "user-check" : "user"} size={18} color={colors.primary} />
            <Text style={[styles.guestToggleText, { color: colors.foreground }]}>
              {guestMode ? "Checkout as Guest" : "Checkout as Guest"}
            </Text>
            <Feather name={guestMode ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          {guestMode && (
            <View style={{ gap: 12, marginTop: 12 }}>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="user" size={17} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Full name"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="mail" size={17} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  placeholder="Email address"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="phone" size={17} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={guestPhone}
                  onChangeText={setGuestPhone}
                  placeholder="Phone number"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}
        </View>

        {/* Address */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="map-pin" size={17} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={address}
              onChangeText={setAddress}
              multiline
              placeholder="Enter delivery address..."
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <TouchableOpacity style={styles.savedBtn} onPress={() => router.push("/addresses")}>
            <Feather name="bookmark" size={14} color={colors.primary} />
            <Text style={[styles.savedBtnText, { color: colors.primary }]}>Use saved address</Text>
          </TouchableOpacity>
        </View>

        {/* Items summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Items ({items.length})</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === pm.id ? colors.primary : colors.border,
                  backgroundColor: paymentMethod === pm.id ? colors.primary + "08" : colors.background,
                },
              ]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <Feather name={pm.icon as any} size={20} color={paymentMethod === pm.id ? colors.primary : colors.mutedForeground} />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{pm.label}</Text>
                <Text style={[styles.paymentSub, { color: colors.mutedForeground }]}>{pm.subtitle}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                { borderColor: paymentMethod === pm.id ? colors.primary : colors.border },
              ]}>
                {paymentMethod === pm.id && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.summaryRows}>
          {[
            { label: "Subtotal", value: formatPrice(totalAmount) },
            { label: "Shipping", value: shipping === 0 ? "FREE" : formatPrice(shipping) },
            ...(podFee > 0 ? [{ label: "POD Fee", value: formatPrice(podFee) }] : []),
          ].map((r) => (
            <View key={r.label} style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{r.value}</Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(total)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={guestMode ? handleGuestOrder : handleOrder}
          disabled={loading}
        >
          {loading ? (
            <>
              <Feather name="loader" size={18} color={colors.foreground} />
              <Text style={[styles.placeOrderText, { color: colors.foreground }]}>Processing...</Text>
            </>
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.placeOrderText}>{guestMode ? "Place Guest Order" : "Place Order"} · {formatPrice(total)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 14 },
  inputWrap: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 12,
  },
  input: { flex: 1, fontSize: 14, lineHeight: 20 },
  savedBtn: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  savedBtnText: { fontSize: 13, fontWeight: "500" as const },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  itemImg: { width: 44, height: 44, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: "500" as const },
  itemQty: { fontSize: 11, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "600" as const },
  paymentOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 8,
  },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: "600" as const },
  paymentSub: { fontSize: 12, marginTop: 2 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, padding: 16,
  },
  summaryRows: { gap: 4, marginBottom: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13 },
  totalRow: { marginTop: 6 },
  totalLabel: { fontSize: 16, fontWeight: "700" as const },
  totalValue: { fontSize: 18, fontWeight: "700" as const },
  placeOrderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 54, borderRadius: 14,
  },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  guestToggle: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  guestToggleText: { fontSize: 15, fontWeight: "600" as const, flex: 1 },
});
