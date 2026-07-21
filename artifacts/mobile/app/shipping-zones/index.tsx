import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

// TODO: Wire to shipping zones API when available

interface Zone {
  id: string;
  name: string;
  regions: string[];
  baseRate: number;
  perKgRate: number;
  estimatedDays: string;
}

const DEFAULT_ZONES: Zone[] = [
  { id: "z1", name: "Lagos Metro", regions: ["Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba"], baseRate: 1500, perKgRate: 200, estimatedDays: "1-2" },
  { id: "z2", name: "South-West", regions: ["Ibadan", "Abeokuta", "Akure", "Osogbo"], baseRate: 2500, perKgRate: 300, estimatedDays: "2-3" },
  { id: "z3", name: "South-South", regions: ["Port Harcourt", "Calabar", "Uyo", "Benin City"], baseRate: 3000, perKgRate: 350, estimatedDays: "3-5" },
  { id: "z4", name: "South-East", regions: ["Enugu", "Awka", "Owerri", "Aba"], baseRate: 3000, perKgRate: 350, estimatedDays: "3-5" },
  { id: "z5", name: "North-Central", regions: ["Abuja", "Jos", "Lafia", "Minna"], baseRate: 3500, perKgRate: 400, estimatedDays: "3-5" },
  { id: "z6", name: "North-East", regions: ["Maiduguri", "Yola", "Bauchi", "Gombe"], baseRate: 4500, perKgRate: 500, estimatedDays: "4-7" },
  { id: "z7", name: "North-West", regions: ["Kano", "Kaduna", "Sokoto", "Katsina"], baseRate: 4000, perKgRate: 450, estimatedDays: "4-6" },
];

const STORAGE_KEY = "@shipping_zones";

export default function ShippingZonesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [zones, setZones] = useState<Zone[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);

  const [name, setName] = useState("");
  const [regions, setRegions] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [perKgRate, setPerKgRate] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");

  const topPad = Platform.OS === "web" ? 80 : insets.top + 16;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try { setZones(JSON.parse(stored)); }
        catch { setZones(DEFAULT_ZONES); }
      } else {
        setZones(DEFAULT_ZONES);
      }
    });
  }, []);

  const persist = (newZones: Zone[]) => {
    setZones(newZones);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newZones));
  };

  const openAdd = () => {
    setEditing(null);
    setName(""); setRegions(""); setBaseRate(""); setPerKgRate(""); setEstimatedDays("");
    setShowForm(true);
  };

  const openEdit = (zone: Zone) => {
    setEditing(zone);
    setName(zone.name);
    setRegions(zone.regions.join(", "));
    setBaseRate(zone.baseRate.toString());
    setPerKgRate(zone.perKgRate.toString());
    setEstimatedDays(zone.estimatedDays);
    setShowForm(true);
  };

  const save = () => {
    if (!name || !regions || !baseRate || !perKgRate || !estimatedDays) {
      Alert.alert("Missing fields", "Please fill all fields");
      return;
    }
    const zone: Zone = {
      id: editing?.id ?? Date.now().toString(),
      name,
      regions: regions.split(",").map((r) => r.trim()).filter(Boolean),
      baseRate: parseInt(baseRate),
      perKgRate: parseInt(perKgRate),
      estimatedDays,
    };
    if (editing) {
      persist(zones.map((z) => (z.id === editing.id ? zone : z)));
    } else {
      persist([...zones, zone]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => {
    Alert.alert("Delete Zone", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => persist(zones.filter((z) => z.id !== id)) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Shipping Zones</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={zones}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openEdit(item)}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.zoneName, { color: colors.foreground }]}>{item.name}</Text>
              <TouchableOpacity onPress={() => remove(item.id)}>
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.regions, { color: colors.mutedForeground }]}>
              {item.regions.join(", ")}
            </Text>
            <View style={styles.cardBottom}>
              <View style={styles.rateRow}>
                <Feather name="dollar-sign" size={13} color={colors.primary} />
                <Text style={[styles.rateText, { color: colors.foreground }]}>
                  ₦{item.baseRate.toLocaleString()} base + ₦{item.perKgRate}/kg
                </Text>
              </View>
              <View style={styles.rateRow}>
                <Feather name="truck" size={13} color={colors.success} />
                <Text style={[styles.rateText, { color: colors.foreground }]}>{item.estimatedDays} days</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {editing ? "Edit Zone" : "Add Zone"}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Field label="Zone Name" value={name} onChange={setName} placeholder="e.g. Lagos Metro" colors={colors} />
            <Field label="Regions (comma-separated)" value={regions} onChange={setRegions} placeholder="Ikeja, VI, Lekki" colors={colors} />
            <Field label="Base Rate (₦)" value={baseRate} onChange={setBaseRate} placeholder="1500" keyboard="numeric" colors={colors} />
            <Field label="Per KG Rate (₦)" value={perKgRate} onChange={setPerKgRate} placeholder="200" keyboard="numeric" colors={colors} />
            <Field label="Estimated Delivery" value={estimatedDays} onChange={setEstimatedDays} placeholder="1-2" colors={colors} />

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
              <Text style={styles.saveBtnText}>{editing ? "Update" : "Add Zone"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, keyboard, colors }: any) {
  return (
    <View style={fieldStyles.field}>
      <Text style={[fieldStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboard ?? "default"}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  field: { gap: 6, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "500" },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, fontSize: 15 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  addBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  zoneName: { fontSize: 16, fontWeight: "700" },
  regions: { fontSize: 13, lineHeight: 18 },
  cardBottom: { flexDirection: "row", gap: 16, marginTop: 4 },
  rateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rateText: { fontSize: 13, fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  saveBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
