import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// TODO: Wire to backend AI visual search endpoint for real image-based product matching
import { useProducts, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function VisualSearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const { data: allProducts = [] } = useProducts();

  const similarProducts = [...allProducts].sort(() => Math.random() - 0.5).slice(0, 8);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSearchSimilar = () => {
    if (!image) return;
    setSearching(true);
    setTimeout(() => setSearching(false), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Visual Search</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={image ? similarProducts : []}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        ListHeaderComponent={
          <>
            {/* Image Upload */}
            <View style={[styles.uploadSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {image ? (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: image }} style={styles.preview} contentFit="cover" />
                  <TouchableOpacity style={[styles.changeBtn, { backgroundColor: colors.muted }]} onPress={() => setImage(null)}>
                    <Feather name="x" size={16} color={colors.foreground} />
                    <Text style={[styles.changeText, { color: colors.foreground }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadOptions}>
                  <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.muted, borderColor: colors.border }]} onPress={pickImage}>
                    <Feather name="image" size={32} color={colors.primary} />
                    <Text style={[styles.uploadLabel, { color: colors.foreground }]}>Gallery</Text>
                    <Text style={[styles.uploadDesc, { color: colors.mutedForeground }]}>Choose from library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.muted, borderColor: colors.border }]} onPress={takePhoto}>
                    <Feather name="camera" size={32} color={colors.primary} />
                    <Text style={[styles.uploadLabel, { color: colors.foreground }]}>Camera</Text>
                    <Text style={[styles.uploadDesc, { color: colors.mutedForeground }]}>Take a photo</Text>
                  </TouchableOpacity>
                </View>
              )}
              {image && (
                <TouchableOpacity
                  style={[styles.searchBtn, { backgroundColor: searching ? colors.muted : colors.primary }]}
                  onPress={handleSearchSimilar}
                  disabled={searching}
                >
                  <Feather name={searching ? "loader" : "search"} size={18} color={searching ? colors.mutedForeground : "#fff"} />
                  <Text style={[styles.searchBtnText, { color: searching ? colors.mutedForeground : "#fff" }]}>
                    {searching ? "Analyzing..." : "Search Similar"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* AI Analysis */}
            {image && (
              <View style={[styles.aiBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <Feather name="cpu" size={16} color={colors.primary} />
                <Text style={[styles.aiText, { color: colors.foreground }]}>
                  AI identified: Shoes, sneakers, sportswear. Confidence: 94%. Showing visually similar products.
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.productImage} contentFit="cover" />
            <View style={styles.productInfo}>
              <Text style={[styles.productTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
              {item.originalPrice && (
                <Text style={[styles.productOldPrice, { color: colors.mutedForeground }]}>{formatPrice(item.originalPrice)}</Text>
              )}
              <View style={styles.ratingRow}>
                <Feather name="star" size={11} color={colors.gold} />
                <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  content: { padding: 16, gap: 16 },
  uploadSection: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16, marginBottom: 8 },
  uploadOptions: { flexDirection: "row", gap: 12 },
  uploadBtn: { flex: 1, height: 120, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  uploadLabel: { fontSize: 14, fontWeight: "600" as const },
  uploadDesc: { fontSize: 11 },
  previewWrap: { alignItems: "center", gap: 12 },
  preview: { width: "100%", height: 220, borderRadius: 14 },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  changeText: { fontSize: 13, fontWeight: "500" as const },
  searchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14 },
  searchBtnText: { fontSize: 16, fontWeight: "600" as const },
  aiBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  aiText: { flex: 1, fontSize: 13, lineHeight: 20 },
  gridRow: { gap: 12 },
  productCard: { flex: 1, borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  productImage: { width: "100%", height: 150 },
  productInfo: { padding: 10, gap: 4 },
  productTitle: { fontSize: 13, lineHeight: 18 },
  productPrice: { fontSize: 15, fontWeight: "700" as const },
  productOldPrice: { fontSize: 11, textDecorationLine: "line-through" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 11 },
});
