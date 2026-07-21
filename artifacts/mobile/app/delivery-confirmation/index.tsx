import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, Dimensions, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");
const SIG_HEIGHT = 180;
const STORAGE_KEY = "@delivery_confirmations";

interface DeliveryRecord {
  id: string;
  orderId: string;
  photoUri: string;
  signaturePoints: string;
  timestamp: string;
  note: string;
}

export default function DeliveryConfirmationScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [note, setNote] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Camera access is required for delivery photos");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const clearSig = () => {
    setPaths([]);
    setCurrentPath("");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        setPaths((prev) => [...prev, currentPath]);
        setCurrentPath("");
      },
    })
  ).current;

  const submit = async () => {
    if (!photoUri || paths.length === 0) {
      Alert.alert("Missing data", "Please capture a photo and provide a signature");
      return;
    }
    const record: DeliveryRecord = {
      id: Date.now().toString(),
      orderId: orderId || `ORD-${Date.now().toString().slice(-6)}`,
      photoUri,
      signaturePoints: paths.join("|"),
      timestamp: new Date().toISOString(),
      note,
    };
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const records: DeliveryRecord[] = stored ? JSON.parse(stored) : [];
    records.push(record);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successWrap, { paddingTop: topPad + 60 }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}>
            <Feather name="check-circle" size={56} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Delivery Confirmed!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Photo and signature have been saved
          </Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: topPad, paddingBottom: 60 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Delivery Confirmation</Text>
      </View>

      {/* Photo Capture */}
      <Text style={[styles.label, { color: colors.mutedForeground }]}>1. Delivery Photo</Text>
      {photoUri ? (
        <View style={styles.photoPreview}>
          <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
          <TouchableOpacity style={styles.retakeBtn} onPress={pickPhoto}>
            <Feather name="camera" size={16} color="#fff" />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.photoPlaceholder, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Feather name="camera" size={40} color={colors.mutedForeground} />
          <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>Capture delivery photo</Text>
          <View style={styles.photoActions}>
            <TouchableOpacity style={[styles.photoBtn, { backgroundColor: colors.primary }]} onPress={pickPhoto}>
              <Feather name="camera" size={16} color="#fff" />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, { backgroundColor: colors.secondary }]} onPress={pickFromGallery}>
              <Feather name="image" size={16} color={colors.foreground} />
              <Text style={[styles.photoBtnText, { color: colors.foreground }]}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Signature Pad */}
      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 24 }]}>2. Customer Signature</Text>
      <View style={[styles.sigContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Svg width={SCREEN_W - 40} height={SIG_HEIGHT} {...panResponder.panHandlers}>
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={colors.foreground} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ))}
          {currentPath ? (
            <Path d={currentPath} stroke={colors.foreground} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ) : null}
        </Svg>
        <TouchableOpacity style={styles.clearSigBtn} onPress={clearSig}>
          <Feather name="rotate-ccw" size={14} color={colors.mutedForeground} />
          <Text style={[styles.clearSigText, { color: colors.mutedForeground }]}>Clear</Text>
        </TouchableOpacity>
      </View>
      {paths.length === 0 && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Draw signature above with your finger</Text>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: photoUri && paths.length > 0 ? 1 : 0.5 }]}
        onPress={submit}
        disabled={!photoUri || paths.length === 0}
      >
        <Feather name="check" size={18} color="#fff" />
        <Text style={styles.submitBtnText}>Confirm Delivery</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  photoPlaceholder: {
    borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed",
    padding: 32, alignItems: "center", gap: 8,
  },
  placeholderText: { fontSize: 14 },
  photoActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  photoBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  photoBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  photoPreview: { borderRadius: 16, overflow: "hidden", position: "relative" },
  photo: { width: "100%", height: 220, borderRadius: 16 },
  retakeBtn: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  retakeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sigContainer: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
    position: "relative", height: SIG_HEIGHT + 32,
  },
  clearSigBtn: {
    position: "absolute", bottom: 6, right: 8,
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  clearSigText: { fontSize: 11, fontWeight: "500" },
  hint: { fontSize: 12, textAlign: "center", marginTop: 6 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 54, borderRadius: 16, marginTop: 32,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  successWrap: { alignItems: "center", gap: 12, paddingHorizontal: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 24, fontWeight: "700" },
  successSub: { fontSize: 15, textAlign: "center" },
  primaryBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, marginTop: 16 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
