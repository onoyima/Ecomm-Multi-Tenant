import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// TODO: Wire to FAQ/help API when available
const FAQS: FAQ[] = [
  { id: "f1", question: "How do I place an order?", answer: "Browse products, add items to your cart, and proceed to checkout. Choose your preferred payment method and confirm your order. You'll receive an order confirmation via email.", category: "Orders" },
  { id: "f2", question: "Can I cancel or modify my order?", answer: "Orders can be cancelled within 30 minutes of placement if they haven't been processed yet. Go to My Orders and tap the cancel button. Modifications require cancelling and re-ordering.", category: "Orders" },
  { id: "f3", question: "How long does delivery take?", answer: "Standard delivery takes 3-7 business days. Express delivery (where available) takes 1-2 business days. Delivery times vary by location and vendor.", category: "Shipping" },
  { id: "f4", question: "What are the shipping costs?", answer: "Shipping costs depend on your location, the vendor, and delivery method. Most items have free shipping for orders above ₦25,000. Check the product page for details.", category: "Shipping" },
  { id: "f5", question: "What payment methods do you accept?", answer: "We accept Paystack (card, bank transfer, USSD), wallet balance, and pay on delivery (selected locations). All payments are processed securely.", category: "Payments" },
  { id: "f6", question: "Is my payment information secure?", answer: "Yes. All payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your card details on our servers.", category: "Payments" },
  { id: "f7", question: "What is your return policy?", answer: "You can return items within 14 days of delivery. Items must be unused and in original packaging. Some items (like intimate wear) are non-returnable. Start a return from your orders page.", category: "Returns" },
  { id: "f8", question: "How do I get a refund?", answer: "Refunds are processed within 5-7 business days after we receive the returned item. Refunds go to your original payment method or ShopDrop wallet. You'll be notified via email.", category: "Returns" },
  { id: "f9", question: "How do I create an account?", answer: "Tap 'Sign Up' on the login screen, enter your email/phone and create a password. You can also sign up with Google for faster registration.", category: "Account" },
  { id: "f10", question: "How do I reset my password?", answer: "Go to the login screen and tap 'Forgot Password'. Enter your registered email address and we'll send you a password reset link.", category: "Account" },
  { id: "f11", question: "How do I become a vendor?", answer: "Go to your profile and tap 'Become a Vendor'. Complete the application form with your business details. Our team will review and approve within 2-3 business days.", category: "Account" },
  { id: "f12", question: "How do I track my order?", answer: "Go to My Orders and tap on any order to see its status. Shipped orders include a tracking number you can use on the carrier's website. You can also receive SMS updates.", category: "Orders" },
];

const CATEGORIES = ["Orders", "Payments", "Returns", "Account", "Shipping"];

const CATEGORY_ICONS: Record<string, string> = {
  Orders: "package",
  Payments: "credit-card",
  Returns: "rotate-ccw",
  Account: "user",
  Shipping: "truck",
};

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Help Center</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchField, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search for answers..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <View style={styles.categoriesRow}>
            {["All", ...CATEGORIES].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.muted, borderColor: selectedCategory === cat ? colors.primary : colors.border }]}
                onPress={() => setSelectedCategory(cat)}
              >
                {cat !== "All" && (
                  <Feather name={CATEGORY_ICONS[cat] as any} size={13} color={selectedCategory === cat ? "#fff" : colors.mutedForeground} />
                )}
                <Text style={[styles.categoryChipText, { color: selectedCategory === cat ? "#fff" : colors.mutedForeground }]}>
                  {cat === "All" ? "All" : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* FAQ List */}
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => {
            const isOpen = expandedId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqCard, { backgroundColor: colors.card, borderColor: isOpen ? colors.primary : colors.border }]}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <View style={[styles.faqCategory, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name={CATEGORY_ICONS[faq.category] as any} size={12} color={colors.primary} />
                    <Text style={[styles.faqCategoryText, { color: colors.primary }]}>{faq.category}</Text>
                  </View>
                </View>
                <View style={styles.faqQuestionRow}>
                  <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{faq.question}</Text>
                  <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
                </View>
                {isOpen && (
                  <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.noResults}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={[styles.noResultsTitle, { color: colors.foreground }]}>No results found</Text>
            <Text style={[styles.noResultsDesc, { color: colors.mutedForeground }]}>Try a different search term</Text>
          </View>
        )}

        {/* Contact Support */}
        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.contactTitle, { color: colors.foreground }]}>Contact Support</Text>
          <Text style={[styles.contactDesc, { color: colors.mutedForeground }]}>Can't find what you're looking for? Reach out to us.</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.primary} />
              <Text style={[styles.contactBtnLabel, { color: colors.foreground }]}>Email</Text>
              <Text style={[styles.contactBtnValue, { color: colors.mutedForeground }]}>support@shopdrop.ng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="phone" size={18} color={colors.primary} />
              <Text style={[styles.contactBtnLabel, { color: colors.foreground }]}>Phone</Text>
              <Text style={[styles.contactBtnValue, { color: colors.mutedForeground }]}>+234 800 SHOPDROP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="message-circle" size={18} color={colors.primary} />
              <Text style={[styles.contactBtnLabel, { color: colors.foreground }]}>Live Chat</Text>
              <Text style={[styles.contactBtnValue, { color: colors.mutedForeground }]}>Available 24/7</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  searchInput: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44 },
  searchField: { flex: 1, fontSize: 14 },
  content: { padding: 16, gap: 12 },
  categoriesScroll: { marginBottom: 4 },
  categoriesRow: { flexDirection: "row", gap: 8, paddingVertical: 8 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  categoryChipText: { fontSize: 13, fontWeight: "500" as const },
  faqCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  faqCategory: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  faqCategoryText: { fontSize: 11, fontWeight: "600" as const },
  faqQuestionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { fontSize: 14, fontWeight: "500" as const, flex: 1, lineHeight: 22 },
  faqAnswer: { fontSize: 13, lineHeight: 22, marginTop: 4 },
  noResults: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 8 },
  noResultsTitle: { fontSize: 16, fontWeight: "600" as const },
  noResultsDesc: { fontSize: 13 },
  contactCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginTop: 8 },
  contactTitle: { fontSize: 16, fontWeight: "700" as const },
  contactDesc: { fontSize: 13, lineHeight: 20 },
  contactOptions: { gap: 10 },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  contactBtnLabel: { fontSize: 14, fontWeight: "600" as const, flex: 1 },
  contactBtnValue: { fontSize: 12 },
});
