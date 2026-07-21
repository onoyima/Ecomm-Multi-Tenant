import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  endsAt: string;
  size?: "sm" | "md" | "lg";
}

function getTimeLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { h: "00", m: "00", s: "00", expired: true };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    expired: false,
  };
}

export function CountdownTimer({ endsAt, size = "md" }: Props) {
  const colors = useColors();
  const [time, setTime] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <View style={styles.row}>
      {time.expired ? (
        <Text style={[styles.expired, { color: colors.mutedForeground, fontSize: isSm ? 11 : isLg ? 16 : 13 }]}>
          Expired
        </Text>
      ) : (
        <>
          <TimeBlock value={time.h} label="hrs" size={size} />
          <Text style={[styles.sep, { color: colors.accent, fontSize: isSm ? 13 : isLg ? 20 : 16 }]}>:</Text>
          <TimeBlock value={time.m} label="min" size={size} />
          <Text style={[styles.sep, { color: colors.accent, fontSize: isSm ? 13 : isLg ? 20 : 16 }]}>:</Text>
          <TimeBlock value={time.s} label="sec" size={size} />
        </>
      )}
    </View>
  );
}

function TimeBlock({ value, label, size }: { value: string; label: string; size?: "sm" | "md" | "lg" }) {
  const colors = useColors();
  const isSm = size === "sm";
  const isLg = size === "lg";
  return (
    <View style={[styles.block, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: isSm ? 6 : 8, paddingHorizontal: isSm ? 4 : isLg ? 10 : 6, paddingVertical: isSm ? 2 : isLg ? 8 : 4 }]}>
      <Text style={[styles.value, { color: colors.foreground, fontSize: isSm ? 12 : isLg ? 22 : 16 }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontSize: isSm ? 8 : isLg ? 11 : 9 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  block: { alignItems: "center", borderWidth: 1, minWidth: 36 },
  value: { fontWeight: "700", fontVariant: ["tabular-nums"] },
  label: { fontWeight: "500" },
  sep: { fontWeight: "700", marginHorizontal: 1 },
  expired: { fontWeight: "600", fontStyle: "italic" },
});
