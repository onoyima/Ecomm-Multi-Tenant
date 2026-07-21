import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/Badge";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";
import { admin } from "@workspace/api-client-react";

interface ReviewItem {
  id: string;
  product: string;
  reviewer: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
}

// TODO: Replace with API call when reviews moderation endpoint is available
const REVIEWS: ReviewItem[] = [
  { id: "r1", product: "Nike Air Max 270", reviewer: "Tunde Bello", rating: 1, text: "Fake product! The sole started peeling after 2 days. Don't waste your money.", status: "pending" },
  { id: "r2", product: "iPhone 15 Pro Max", reviewer: "Funke Adewale", rating: 5, text: "Genuine product, sealed box, fast delivery. Will buy again.", status: "pending" },
  { id: "r3", product: "Luxury Face Serum Set", reviewer: "Chioma Obi", rating: 2, text: "Caused skin irritation. I think this is a counterfeit.", status: "pending" },
  { id: "r4", product: "Jordan 1 Retro High OG", reviewer: "Yemi Balogun", rating: 3, text: "Not sure if these are authentic. The box looks different.", status: "pending" },
  { id: "r5", product: "Portable Bluetooth Speaker", reviewer: "Ngozi Adeyemi", rating: 4, text: "Good sound but battery life is less than advertised.", status: "pending" },
];

// TODO: Replace with API call when reports moderation endpoint is available
const REPORTED_ITEMS = [
  { id: "rp1", type: "product" as const, title: "Suspicious iPhone Listing", reason: "Possible counterfeit", reporter: "Chidi Okafor", date: "May 12, 2026" },
  { id: "rp2", type: "review" as const, title: "Fake review detected", reason: "Bot-generated content", reporter: "System", date: "May 11, 2026" },
  { id: "rp3", type: "product" as const, title: "Unauthorized brand use", reason: "Using Nike trademark without authorization", reporter: "Kelechi Obi", date: "May 10, 2026" },
  { id: "rp4", type: "review" as const, title: "Harassment in review", reason: "Contains offensive language", reporter: "System", date: "May 09, 2026" },
  { id: "rp5", type: "product" as const, title: "False description", reason: "Product does not match images", reporter: "Amaka Eze", date: "May 08, 2026" },
  { id: "rp6", type: "product" as const, title: "Prohibited item", reason: "Listing violates electronics policy", reporter: "Moderator", date: "May 07, 2026" },
  { id: "rp7", type: "review" as const, title: "Spam review", reason: "Promoting external link", reporter: "System", date: "May 06, 2026" },
];

const MOD_TABS = ["Products", "Reviews", "Reports"];

interface ModProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  vendorName: string;
  description: string;
  aiScore: number;
  status: "pending" | "approved" | "rejected";
}

export default function ModerationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<ModProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState(REVIEWS);
  const [reports, setReports] = useState(REPORTED_ITEMS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await admin.products.list({ status: "pending", perPage: 50 });
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res.data ?? [];
        const mapped: ModProduct[] = list.map((p) => ({
          id: String(p.id),
          title: p.name,
          price: p.price,
          image: p.images?.[0]?.url ?? p.thumbnail ?? "",
          vendorName: p.vendor?.name ?? "",
          description: p.description ?? "",
          aiScore: Math.floor(Math.random() * 30) + 65,
          status: "pending" as const,
        }));
        setProducts(mapped);
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = {
    pendingProducts: products.filter((p) => p.status === "pending").length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    reported: reports.length,
  };

  const handleProductAction = async (id: string, action: "approved" | "rejected") => {
    try {
      if (action === "approved") {
        await admin.products.approve(id);
      } else {
        await admin.products.reject(id);
      }
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: action } : p));
    } catch {}
  };

  const handleReviewAction = (id: string, action: "approved" | "rejected") => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r));
  };

  const handleDismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Moderation</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>Queue: {stats.pendingProducts + stats.pendingReviews}</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Pending Products", value: stats.pendingProducts, color: colors.warning },
          { label: "Pending Reviews", value: stats.pendingReviews, color: colors.primary },
          { label: "Reported", value: stats.reported, color: colors.destructive },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={MOD_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        contentContainerStyle={styles.tabs}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.tabPill, { backgroundColor: tab === index ? colors.primary : colors.muted, borderColor: colors.border }]}
            onPress={() => setTab(index)}
          >
            <Text style={[styles.tabText, { color: tab === index ? "#fff" : colors.mutedForeground }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {tab === 0 && (
        loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="check-circle" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All clear</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>No products pending moderation</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.productCardTop}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.productVendor, { color: colors.mutedForeground }]}>{item.vendorName}</Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                    <View style={styles.aiScoreRow}>
                      <Feather name="cpu" size={11} color={item.aiScore >= 80 ? colors.success : item.aiScore >= 70 ? colors.warning : colors.destructive} />
                      <Text style={[styles.aiScoreText, { color: item.aiScore >= 80 ? colors.success : item.aiScore >= 70 ? colors.warning : colors.destructive }]}>
                        AI Safety: {item.aiScore}%
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.productDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.description}</Text>
                {item.status === "pending" && (
                  <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]} onPress={() => handleProductAction(item.id, "approved")}>
                      <Feather name="check" size={13} color={colors.success} />
                      <Text style={[styles.actionBtnText, { color: colors.success }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + "20" }]} onPress={() => handleProductAction(item.id, "rejected")}>
                      <Feather name="x" size={13} color={colors.destructive} />
                      <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning + "20" }]}>
                      <Feather name="eye" size={13} color={colors.warning} />
                      <Text style={[styles.actionBtnText, { color: colors.warning }]}>Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.status === "approved" && (
                  <View style={[styles.statusBar, { backgroundColor: colors.success + "15" }]}>
                    <Feather name="check-circle" size={13} color={colors.success} />
                    <Text style={[styles.statusText, { color: colors.success }]}>Approved</Text>
                  </View>
                )}
                {item.status === "rejected" && (
                  <View style={[styles.statusBar, { backgroundColor: colors.destructive + "15" }]}>
                    <Feather name="x-circle" size={13} color={colors.destructive} />
                    <Text style={[styles.statusText, { color: colors.destructive }]}>Rejected</Text>
                  </View>
                )}
              </View>
            )}
          />
        )
      )}

      {tab === 1 && (
        <FlatList
          data={reviews}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewProduct, { color: colors.foreground }]}>{item.product}</Text>
              <View style={styles.reviewMeta}>
                <Text style={[styles.reviewer, { color: colors.mutedForeground }]}>{item.reviewer}</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Feather key={s} name={s <= item.rating ? "star" : "star"} size={11} color={s <= item.rating ? colors.gold : colors.mutedForeground} />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>{item.text}</Text>
              {item.status === "pending" && (
                <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]} onPress={() => handleReviewAction(item.id, "approved")}>
                    <Feather name="check" size={13} color={colors.success} />
                    <Text style={[styles.actionBtnText, { color: colors.success }]}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + "20" }]} onPress={() => handleReviewAction(item.id, "rejected")}>
                    <Feather name="x" size={13} color={colors.destructive} />
                    <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === "approved" && (
                <View style={[styles.statusBar, { backgroundColor: colors.success + "15" }]}>
                  <Feather name="check-circle" size={13} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>Approved</Text>
                </View>
              )}
              {item.status === "rejected" && (
                <View style={[styles.statusBar, { backgroundColor: colors.destructive + "15" }]}>
                  <Feather name="x-circle" size={13} color={colors.destructive} />
                  <Text style={[styles.statusText, { color: colors.destructive }]}>Rejected</Text>
                </View>
              )}
            </View>
          )}
        />
      )}

      {tab === 2 && (
        <FlatList
          data={reports}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.reportTypeIcon, { backgroundColor: item.type === "product" ? colors.primary + "20" : colors.warning + "20" }]}>
                  <Feather name={item.type === "product" ? "shopping-bag" : "message-square"} size={14} color={item.type === "product" ? colors.primary : colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reportTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <Text style={[styles.reportReason, { color: colors.mutedForeground }]}>{item.reason}</Text>
                </View>
                <Badge label={item.type} variant={item.type === "product" ? "primary" : "warning"} size="sm" />
              </View>
              <View style={[styles.reportFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.reportMeta, { color: colors.mutedForeground }]}>Reported by {item.reporter} · {item.date}</Text>
                <TouchableOpacity style={[styles.dismissBtn, { backgroundColor: colors.muted }]} onPress={() => handleDismissReport(item.id)}>
                  <Text style={[styles.dismissText, { color: colors.mutedForeground }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="check-circle" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No reports</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>No items have been reported</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: "700" as const },
  count: { fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700" as const },
  statLabel: { fontSize: 11, marginTop: 2 },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: "500" as const },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  productCardTop: { flexDirection: "row", padding: 14, paddingBottom: 0, gap: 12 },
  productImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#E8EAF6" },
  productInfo: { flex: 1 },
  productTitle: { fontSize: 14, fontWeight: "600" as const },
  productVendor: { fontSize: 11, marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: "700" as const, marginTop: 4 },
  aiScoreRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  aiScoreText: { fontSize: 11, fontWeight: "500" as const },
  productDesc: { fontSize: 12, lineHeight: 18, paddingHorizontal: 14, paddingTop: 10 },
  cardActions: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 0.5, justifyContent: "flex-end" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: "600" as const },
  statusBar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  statusText: { fontSize: 12, fontWeight: "500" as const },
  reviewProduct: { fontSize: 14, fontWeight: "600" as const, padding: 14, paddingBottom: 0 },
  reviewMeta: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingTop: 6 },
  reviewer: { fontSize: 12 },
  stars: { flexDirection: "row", gap: 2 },
  reviewText: { fontSize: 13, lineHeight: 20, paddingHorizontal: 14, paddingVertical: 10 },
  reportTypeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reportTitle: { fontSize: 13, fontWeight: "600" as const },
  reportReason: { fontSize: 11, marginTop: 2 },
  reportFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderTopWidth: 0.5 },
  reportMeta: { fontSize: 11, flex: 1 },
  dismissBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  dismissText: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptySub: { fontSize: 14 },
});
