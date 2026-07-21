import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Video } from "expo-av";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useProducts, useCategories, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { CATEGORY_IMAGES, ASSET_IMAGES } from "@/constants/images";

const { width } = Dimensions.get("window");
const CAT_CARD_W = 140;

type CatImageKey = keyof typeof CATEGORY_IMAGES;

const CAT_IMAGE_MAP: Record<string, CatImageKey> = {
  Fashion: "fashion",
  Electronics: "electronics",
  Beauty: "beauty",
  Home: "home",
  Food: "food",
};

const BANNERS = [
  {
    title: "Elevated\nStreetwear",
    sub: "New arrivals. Up to 40% off.",
    cta: "Shop Fashion",
    cat: "Fashion",
    image: CATEGORY_IMAGES.fashion,
    overlay: "rgba(0,0,0,0.45)",
    video: require("../../assets/gif_assets/black_friday_ad.mp4"),
  },
  {
    title: "Latest Tech\nGadgets",
    sub: "iPhone 15, smartwatches & more.",
    cta: "Shop Electronics",
    cat: "Electronics",
    image: CATEGORY_IMAGES.electronics,
    overlay: "rgba(0,0,30,0.55)",
    video: require("../../assets/gif_assets/futuristic_electronics_ad.mp4"),
  },
  {
    title: "Glow Up\nSkincare",
    sub: "Premium beauty — AI picks for you.",
    cta: "Shop Beauty",
    cat: "Beauty",
    image: CATEGORY_IMAGES.beauty,
    overlay: "rgba(60,0,60,0.4)",
    video: require("../../assets/gif_assets/fresh_grocery_ad.mp4"),
  },
  {
    title: "Cyber\nMonday Deals",
    sub: "Massive savings on top brands.",
    cta: "Shop Deals",
    cat: "Electronics",
    image: ASSET_IMAGES.cyberMonday,
    overlay: "rgba(0,0,0,0.5)",
    video: require("../../assets/gif_assets/electronics_advertise_ad.mp4"),
  },
  {
    title: "Fresh\nFinds",
    sub: "Discover new products daily.",
    cta: "Explore Now",
    cat: "Home",
    image: ASSET_IMAGES.categories,
    overlay: "rgba(0,0,0,0.4)",
    video: require("../../assets/gif_assets/food_delivery_ad.mp4"),
  },
  {
    title: "Cozy\nAutumn Wears",
    sub: "Warm styles for the season.",
    cta: "Shop Fashion",
    cat: "Fashion",
    image: ASSET_IMAGES.autumWears,
    overlay: "rgba(40,20,0,0.5)",
    video: require("../../assets/gif_assets/toys_ad.mp4"),
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addItem, totalItems } = useCart();
  const { items: recentlyViewed } = useRecentlyViewed();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const topPad = Platform.OS === "web" ? 80 : insets.top;

  const { data: categories = [] } = useCategories();
  const { data: allProducts = [] } = useProducts();
  const trending = allProducts.slice(0, 4);
  const featured = allProducts.slice(2, 6);

  const filteredProducts = selectedCat
    ? allProducts.filter((p) => p.category === selectedCat)
    : allProducts;

  const banner = BANNERS[activeBanner];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning 👋</Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name?.split(" ")[0] ?? "Shopper"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
            onPress={() => router.push("/notifications")}
          >
            <Feather name="bell" size={20} color={colors.foreground} />
            <View style={[styles.notifDot, { backgroundColor: colors.accent }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/ai-chat")}
          >
            <Feather name="cpu" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={[styles.searchTrigger, { backgroundColor: colors.muted, borderColor: colors.border }]}
        onPress={() => router.push("/(customer)/search")}
      >
        <Feather name="search" size={17} color={colors.mutedForeground} />
        <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
          Search 50,000+ products...
        </Text>
        <View style={[styles.aiPill, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="cpu" size={12} color={colors.primary} />
          <Text style={[styles.aiPillText, { color: colors.primary }]}>AI</Text>
        </View>
      </TouchableOpacity>

      {/* Hero Banner — video + image */}
      <View style={styles.bannerWrap}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setSelectedCat(banner.cat)}
          style={styles.bannerCard}
        >
          <View style={[styles.bannerBg, { borderRadius: 20, overflow: "hidden" }]}>
            {banner.video && (
              <Video
                source={banner.video}
                style={StyleSheet.absoluteFill}
                resizeMode={"cover" as any}
                shouldPlay
                isLooping
                isMuted
              />
            )}
            <Image
              source={banner.image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={[banner.overlay, "transparent"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.bannerGradient}
            >
              <TouchableOpacity
                style={[styles.flashBadge, { backgroundColor: colors.accent }]}
                onPress={(e) => { e.stopPropagation(); router.push("/flash-sales"); }}
              >
                <Text style={styles.flashText}>🔥 Flash Sale</Text>
              </TouchableOpacity>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSub}>{banner.sub}</Text>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>{banner.cta}</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>

        {/* Dots */}
        <View style={styles.dots}>
          {BANNERS.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveBanner(i)}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeBanner ? colors.primary : colors.border,
                  width: i === activeBanner ? 20 : 7,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Categories — image cards */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Shop by Category</Text>
          <TouchableOpacity onPress={() => setSelectedCat(null)}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item }) => {
            const imgKey = CAT_IMAGE_MAP[item.name];
            const isActive = selectedCat === item.name;
            return (
              <TouchableOpacity
                style={[styles.catCard, { borderColor: isActive ? colors.primary : "transparent" }]}
                onPress={() => setSelectedCat(isActive ? null : item.name)}
              >
                {imgKey ? (
                  <ImageBackground
                    source={CATEGORY_IMAGES[imgKey]}
                    style={styles.catCardBg}
                    imageStyle={{ borderRadius: 14 }}
                resizeMode={"cover" as any}
                  >
                    <LinearGradient
                      colors={["rgba(0,0,0,0.45)", "transparent"]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      style={styles.catCardGrad}
                    >
                      {isActive && (
                        <View style={[styles.catCheckBadge, { backgroundColor: colors.primary }]}>
                          <Feather name="check" size={10} color="#fff" />
                        </View>
                      )}
                      <Text style={styles.catCardText}>{item.name}</Text>
                    </LinearGradient>
                  </ImageBackground>
                ) : (
                  <View style={[styles.catCardBg, { backgroundColor: item.color + "22", borderRadius: 14, alignItems: "center", justifyContent: "flex-end", paddingBottom: 8 }]}>
                    <Ionicons name={item.icon as any} size={26} color={item.color} style={{ marginBottom: 4 }} />
                    <Text style={[styles.catCardTextAlt, { color: colors.foreground }]}>{item.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Category image feature grid (Fashion + Electronics + Beauty) */}
      <View style={[styles.section, { paddingHorizontal: 20 }]}>
        <View style={styles.featGrid}>
          {/* Large left — home */}
          <TouchableOpacity
            style={[styles.featLarge, { borderColor: colors.border }]}
            onPress={() => setSelectedCat("Home")}
          >
            <ImageBackground
              source={CATEGORY_IMAGES.home}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 16 }}
              resizeMode="cover"
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0.3 }}
                style={styles.featOverlay}
              >
                <Text style={styles.featLabel}>Home &{"\n"}Living</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* Right column — food + electronics */}
          <View style={styles.featCol}>
            <TouchableOpacity
              style={[styles.featSmall, { borderColor: colors.border }]}
              onPress={() => setSelectedCat("Food")}
            >
              <ImageBackground
                source={CATEGORY_IMAGES.food}
                style={{ flex: 1 }}
                imageStyle={{ borderRadius: 16 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.5)", "transparent"]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.featOverlay}
                >
                  <Text style={styles.featLabel}>Food</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featSmall, { borderColor: colors.border }]}
              onPress={() => setSelectedCat("Electronics")}
            >
              <ImageBackground
                source={CATEGORY_IMAGES.electronics}
                style={{ flex: 1 }}
                imageStyle={{ borderRadius: 16 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.6)", "transparent"]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.featOverlay}
                >
                  <Text style={styles.featLabel}>Electronics</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Image Showcase — using unused asset images */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name="image" size={16} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>In the Spotlight</Text>
          </View>
        </View>
        <FlatList
          data={[
            { key: "watch", img: ASSET_IMAGES.watch, label: "Luxury Watches" },
            { key: "perfume", img: ASSET_IMAGES.perfume, label: "Premium Fragrances" },
            { key: "jewery", img: ASSET_IMAGES.jewery, label: "Stylish Jewelry" },
            { key: "burger", img: ASSET_IMAGES.burger, label: "Gourmet Meals" },
            { key: "gym", img: ASSET_IMAGES.gym, label: "Fitness Gear" },
            { key: "toys", img: ASSET_IMAGES.toys, label: "Toys & Fun" },
            { key: "footware", img: ASSET_IMAGES.footware, label: "Premium Footwear" },
            { key: "furniture", img: ASSET_IMAGES.furniture, label: "Home Decor" },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ width: 90, gap: 6 }} onPress={() => router.push("/(customer)/home")}>
              <ImageBackground
                source={item.img}
                style={styles.showCircle}
                imageStyle={{ borderRadius: 45 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.5)"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1, borderRadius: 45 }}
                />
              </ImageBackground>
              <Text style={[styles.showLabel, { color: colors.foreground }]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Trending */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name="trending-up" size={16} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Now</Text>
          </View>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={trending}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAddToCart={(p) =>
                addItem({ productId: p.id, title: p.title, price: p.price, quantity: 1, image: p.image, vendorName: p.vendorName })
              }
            />
          )}
        />
      </View>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recently Viewed</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/recently-viewed")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentlyViewed.slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                compact
                onAddToCart={(p) =>
                  addItem({ productId: p.id, title: p.title, price: p.price, quantity: 1, image: p.image, vendorName: p.vendorName })
                }
              />
            )}
          />
        </View>
      )}

      {/* AI Pick banner */}
      <View style={[styles.aiPickBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
        <View style={styles.aiPickLeft}>
          <LinearGradient colors={["#5B4EFF", "#7C3AED"]} style={styles.aiPickIcon}>
            <Feather name="cpu" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.aiPickTitle, { color: colors.foreground }]}>AI Picks for You</Text>
            <Text style={[styles.aiPickSub, { color: colors.mutedForeground }]}>
              Personalized based on your browsing
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.aiPickBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/ai-chat")}
        >
          <Text style={styles.aiPickBtnText}>Chat AI</Text>
          <Feather name="arrow-right" size={13} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCat ? `${selectedCat} Products` : "Featured for You"}
          </Text>
          {selectedCat && (
            <TouchableOpacity onPress={() => setSelectedCat(null)}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.productGrid}>
          {(selectedCat ? filteredProducts : featured).map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onAddToCart={(p) =>
                addItem({ productId: p.id, title: p.title, price: p.price, quantity: 1, image: p.image, vendorName: p.vendorName })
              }
            />
          ))}
        </View>
      </View>

      {/* All Products */}
      {!selectedCat && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Products</Text>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {allProducts.slice(4, 9).map((item) => (
              <ProductCard key={item.id} product={item} horizontal />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
  },
  greeting: { fontSize: 13 },
  userName: { fontSize: 22, fontWeight: "700" },
  headerRight: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  notifDot: {
    position: "absolute", top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
  },
  searchTrigger: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 20, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, height: 48, marginBottom: 16,
  },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  aiPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  aiPillText: { fontSize: 11, fontWeight: "600" },
  bannerWrap: { marginHorizontal: 20, marginBottom: 8 },
  bannerCard: { borderRadius: 20, overflow: "hidden", height: 200 },
  bannerBg: { width: "100%", height: "100%" },
  bannerGradient: {
    flex: 1, borderRadius: 20, padding: 20,
    justifyContent: "flex-end",
  },
  flashBadge: {
    alignSelf: "flex-start", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  flashText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  bannerTitle: { fontSize: 24, fontWeight: "800", color: "#fff", lineHeight: 28, marginBottom: 4 },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 12 },
  bannerCta: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start",
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  bannerCtaText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10, marginBottom: 8 },
  dot: { height: 7, borderRadius: 4 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  catCard: {
    width: CAT_CARD_W, height: 90, borderRadius: 16,
    overflow: "hidden", borderWidth: 2,
  },
  catCardBg: { width: CAT_CARD_W - 4, height: 86, borderRadius: 14 },
  catCardGrad: {
    flex: 1, borderRadius: 14,
    justifyContent: "flex-end", padding: 8, position: "relative",
  },
  catCheckBadge: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  catCardText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  catCardTextAlt: { fontSize: 12, fontWeight: "600" },
  featGrid: { flexDirection: "row", gap: 10, height: 200 },
  featLarge: { flex: 1.1, borderRadius: 16, overflow: "hidden" },
  featCol: { flex: 0.9, gap: 10 },
  featSmall: { flex: 1, borderRadius: 16, overflow: "hidden" },
  featOverlay: { flex: 1, borderRadius: 16, justifyContent: "flex-end", padding: 10 },
  featLabel: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  aiPickBanner: {
    marginHorizontal: 20, marginBottom: 24, borderRadius: 16,
    padding: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", borderWidth: 1,
  },
  aiPickLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  aiPickIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  aiPickTitle: { fontSize: 15, fontWeight: "600" },
  aiPickSub: { fontSize: 11, marginTop: 2 },
  aiPickBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  aiPickBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  productGrid: {
    flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 12,
  },
  showCircle: { width: 90, height: 90, borderRadius: 45, overflow: "hidden" },
  showLabel: { textAlign: "center", fontSize: 11 },
});
