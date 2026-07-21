import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrder } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const colors = useColors();
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(star);
          }}
          activeOpacity={0.7}
        >
          <Feather
            name="star"
            size={42}
            color={star <= value ? colors.gold : colors.border}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const RATING_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent!"];

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { data: order } = useOrder(orderId ?? "");
  const items = order?.items ?? [];

  const handleSubmit = () => {
    const unrated = items.filter((_, i) => !ratings[i.toString()]);
    if (unrated.length > 0) {
      Alert.alert("Rate All Items", "Please rate all items before submitting");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Thank You!", "Your reviews have been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Write Reviews</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Share your experience for Order #{orderId}
        </Text>

        {items.map((item, i) => (
          <View key={i} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>Qty: {item.qty}</Text>
              </View>
            </View>

            <StarRating value={ratings[i.toString()] ?? 0} onChange={(v) => setRatings((r) => ({ ...r, [i.toString()]: v }))} />

            {ratings[i.toString()] > 0 && (
              <Text style={[styles.ratingLabel, { color: colors.gold }]}>
                {RATING_LABELS[ratings[i.toString()] ?? 0]}
              </Text>
            )}

            <TextInput
              style={[styles.reviewInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
              value={reviews[i.toString()] ?? ""}
              onChangeText={(t) => setReviews((r) => ({ ...r, [i.toString()]: t }))}
              placeholder="Share details about your experience (optional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
            />
          </View>
        ))}

        {/* Vendor Rating */}
        <View style={[styles.vendorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.vendorTitle, { color: colors.foreground }]}>Rate Vendor Service</Text>
          <StarRating value={ratings["vendor"] ?? 0} onChange={(v) => setRatings((r) => ({ ...r, vendor: v }))} />
          <View style={styles.serviceItems}>
            {["Fast Shipping", "Good Packaging", "Accurate Description"].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.serviceTag, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Feather name="check" size={12} color={colors.success} />
                <Text style={[styles.serviceTagText, { color: colors.foreground }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Feather name={loading ? "loader" : "send"} size={17} color={loading ? colors.mutedForeground : "#fff"} />
          <Text style={[styles.submitBtnText, { color: loading ? colors.mutedForeground : "#fff" }]}>
            {loading ? "Submitting..." : "Submit Reviews"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  content: { padding: 16, gap: 16 },
  subtitle: { fontSize: 14, textAlign: "center", paddingVertical: 8 },
  itemCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemImg: { width: 56, height: 56, borderRadius: 12 },
  itemTitle: { fontSize: 14, fontWeight: "600" as const },
  itemQty: { fontSize: 12, marginTop: 3 },
  stars: { flexDirection: "row", justifyContent: "center" },
  ratingLabel: { textAlign: "center", fontSize: 16, fontWeight: "700" as const },
  reviewInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: "top" },
  vendorCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, alignItems: "center" },
  vendorTitle: { fontSize: 16, fontWeight: "600" as const },
  serviceItems: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  serviceTag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  serviceTagText: { fontSize: 12 },
  footer: { padding: 16, borderTopWidth: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  submitBtnText: { fontSize: 16, fontWeight: "600" as const },
});
