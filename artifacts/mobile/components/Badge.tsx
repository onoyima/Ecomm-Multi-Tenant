import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Variant = "default" | "success" | "warning" | "destructive" | "primary" | "muted";

interface Props {
  label: string;
  variant?: Variant;
  size?: "sm" | "md";
}

export function Badge({ label, variant = "default", size = "md" }: Props) {
  const colors = useColors();

  const bg: Record<Variant, string> = {
    default: colors.muted,
    success: "#DCFCE7",
    warning: "#FEF9C3",
    destructive: "#FEE2E2",
    primary: colors.primary + "20",
    muted: colors.muted,
  };

  const fg: Record<Variant, string> = {
    default: colors.mutedForeground,
    success: "#16A34A",
    warning: "#CA8A04",
    destructive: "#DC2626",
    primary: colors.primary,
    muted: colors.mutedForeground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bg[variant] }, size === "sm" && styles.sm]}>
      <Text style={[styles.text, { color: fg[variant] }, size === "sm" && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, Variant> = {
    pending: "warning",
    confirmed: "primary",
    processing: "primary",
    shipped: "default",
    delivered: "success",
    cancelled: "destructive",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return <Badge label={labels[status] ?? status} variant={variantMap[status] ?? "default"} />;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: "flex-start",
  },
  sm: { paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: "600" as const },
  textSm: { fontSize: 10 },
});
