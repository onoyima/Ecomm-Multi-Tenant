import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, useWalletTransactions, useWalletTopUp, useWalletWithdraw } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const QUICK_AMOUNTS = [1000, 5000, 10000, 20000, 50000];

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<"topup" | "history">("history");
  const { data: transactions = [], isLoading } = useWalletTransactions();
  const topUp = useWalletTopUp();
  const withdraw = useWalletWithdraw();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <LinearGradient colors={["#5B4EFF", "#3A2FD9"]} style={styles.hero}>
        <Text style={styles.heroLabel}>Wallet Balance</Text>
        <Text style={styles.heroBalance}>{formatPrice(user?.walletBalance ?? 0)}</Text>
        <View style={styles.heroRow}>
          {[
            { icon: "arrow-down", label: "Top Up", action: () => setTab("topup") },
            { icon: "arrow-up", label: "Withdraw", action: () => {
              const amt = parseInt(amount, 10);
              if (!amt || amt <= 0) { Alert.alert("Enter Amount", "Enter a valid amount to withdraw"); return; }
              withdraw.mutate({ amount: amt, bankAccount: "bank_transfer" });
            } },
            { icon: "send", label: "Transfer", action: () => {} },
            { icon: "clock", label: "History", action: () => setTab("history") },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.heroAction} onPress={a.action}>
              <View style={styles.heroActionIcon}>
                <Feather name={a.icon as any} size={18} color="#5B4EFF" />
              </View>
              <Text style={styles.heroActionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
        {(["history", "topup"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && [styles.activeTab, { backgroundColor: colors.background }]]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "history" ? "Transaction History" : "Top Up"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "topup" ? (
        <View style={{ padding: 16 }}>
          <View style={[styles.topupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.topupTitle, { color: colors.foreground }]}>Add Funds</Text>
            <View style={[styles.amountInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.mutedForeground }]}>₦</Text>
              <TextInput
                style={[styles.amountText, { color: colors.foreground }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.quickAmount, { borderColor: colors.border, backgroundColor: colors.muted }]}
                  onPress={() => setAmount(a.toString())}
                >
                  <Text style={[styles.quickAmountText, { color: colors.foreground }]}>{formatPrice(a)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.topupBtn, { backgroundColor: topUp.isPending ? colors.muted : colors.primary }]}
              onPress={() => {
                const amt = parseInt(amount, 10);
                if (!amt || amt <= 0) { Alert.alert("Enter Amount", "Enter a valid amount to top up"); return; }
                topUp.mutate(amt);
              }}
              disabled={topUp.isPending}
            >
              <Feather name="credit-card" size={17} color="#fff" />
              <Text style={styles.topupBtnText}>{topUp.isPending ? "Processing..." : "Pay via Paystack"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ padding: 16 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : transactions.length === 0 ? (
            <Text style={[styles.txDesc, { color: colors.mutedForeground, textAlign: "center", marginTop: 20 }]}>No transactions yet</Text>
          ) : transactions.map((t: any) => (
            <View
              key={t.id}
              style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[
                styles.txIcon,
                { backgroundColor: t.type === "credit" ? "#DCFCE7" : "#FEE2E2" },
              ]}>
                <Feather
                  name={t.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                  size={16}
                  color={t.type === "credit" ? "#16A34A" : "#DC2626"}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txDesc, { color: colors.foreground }]}>{t.description || t.desc}</Text>
                <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : t.date}</Text>
              </View>
              <Text style={[
                styles.txAmount,
                { color: t.type === "credit" ? colors.success : colors.destructive },
              ]}>
                {t.type === "credit" ? "+" : "-"}{formatPrice(t.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 24, paddingBottom: 32 },
  heroLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 6 },
  heroBalance: { fontSize: 40, fontWeight: "700" as const, color: "#fff", marginBottom: 24 },
  heroRow: { flexDirection: "row", justifyContent: "space-around" },
  heroAction: { alignItems: "center", gap: 8 },
  heroActionIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  heroActionLabel: { fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: "500" as const },
  tabs: {
    flexDirection: "row", margin: 16, borderRadius: 12, padding: 3,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10 },
  activeTab: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: "600" as const },
  topupCard: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 16 },
  topupTitle: { fontSize: 18, fontWeight: "600" as const },
  amountInput: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 60,
  },
  currencySymbol: { fontSize: 22, fontWeight: "600" as const },
  amountText: { flex: 1, fontSize: 30, fontWeight: "700" as const },
  quickAmounts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickAmount: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  quickAmountText: { fontSize: 13 },
  topupBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 14,
  },
  topupBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8,
  },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontWeight: "500" as const },
  txDate: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "700" as const },
});
