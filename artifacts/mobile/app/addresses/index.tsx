import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/data/mockData";

export default function AddressesScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: addresses = [], isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const updateAddress = useUpdateAddress();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const handleSetDefault = (id: string) => {
    updateAddress.mutate({ id, data: { isDefault: true } });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Address", "Remove this delivery address?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAddress.mutate(id) },
    ]);
  };

  const handleAdd = () => {
    if (!fullName || !phone || !street || !city || !state) {
      Alert.alert("Missing Fields", "Fill in all required fields");
      return;
    }
    createAddress.mutate({ label, recipientName: fullName, phone, street, city, state, postalCode: "", country: "NG", isDefault: addresses.length === 0 });
    setAdding(false);
    setFullName(""); setPhone(""); setStreet(""); setCity(""); setState(""); setLabel("Home");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => setAdding(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : addresses.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Feather name="map-pin" size={40} color={colors.mutedForeground} />
            <Text style={[styles.name, { color: colors.mutedForeground, marginTop: 12 }]}>No saved addresses</Text>
          </View>
        ) : addresses.map((addr: any) => (
          <View key={addr.id} style={[styles.card, { backgroundColor: colors.card, borderColor: addr.isDefault ? colors.primary : colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.labelTag, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="home" size={13} color={colors.primary} />
                <Text style={[styles.labelText, { color: colors.primary }]}>{addr.label}</Text>
              </View>
              {addr.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: colors.success + "20" }]}>
                  <Text style={[styles.defaultText, { color: colors.success }]}>Default</Text>
                </View>
              )}
            </View>
            <Text style={[styles.name, { color: colors.foreground }]}>{addr.fullName}</Text>
            <Text style={[styles.phone, { color: colors.mutedForeground }]}>{addr.phone}</Text>
            <Text style={[styles.address, { color: colors.mutedForeground }]}>{addr.street}, {addr.city}, {addr.state}</Text>
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              {!addr.isDefault && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(addr.id)}>
                  <Feather name="check-circle" size={14} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn}>
                <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr.id)}>
                <Feather name="trash-2" size={14} color={colors.destructive} />
                <Text style={[styles.actionText, { color: colors.destructive }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {adding && (
          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={[styles.addFormTitle, { color: colors.foreground }]}>New Address</Text>

            <View style={styles.labelRow}>
              {["Home", "Office", "Other"].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, { backgroundColor: label === l ? colors.primary : colors.muted, borderColor: label === l ? colors.primary : colors.border }]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.labelChipText, { color: label === l ? "#fff" : colors.mutedForeground }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {[
              { label: "Full Name *", value: fullName, setter: setFullName, placeholder: "Recipient's full name" },
              { label: "Phone *", value: phone, setter: setPhone, placeholder: "e.g. 08012345678" },
              { label: "Street Address *", value: street, setter: setStreet, placeholder: "House No. & Street" },
              { label: "City *", value: city, setter: setCity, placeholder: "City" },
              { label: "State *", value: state, setter: setState, placeholder: "State" },
            ].map((f) => (
              <View key={f.label} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  value={f.value}
                  onChangeText={f.setter}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}

            <View style={styles.formActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setAdding(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: createAddress.isPending ? colors.muted : colors.primary }]} onPress={handleAdd} disabled={createAddress.isPending}>
                <Text style={styles.saveBtnText}>{createAddress.isPending ? "Saving..." : "Save Address"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" as const },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 6 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  labelTag: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  labelText: { fontSize: 12, fontWeight: "600" as const },
  defaultBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  defaultText: { fontSize: 11, fontWeight: "600" as const },
  name: { fontSize: 15, fontWeight: "600" as const },
  phone: { fontSize: 13 },
  address: { fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 16, paddingTop: 10, borderTopWidth: 0.5, marginTop: 6 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 13 },
  addForm: { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 12 },
  addFormTitle: { fontSize: 16, fontWeight: "700" as const },
  labelRow: { flexDirection: "row", gap: 8 },
  labelChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  labelChipText: { fontSize: 13, fontWeight: "500" as const },
  field: { gap: 5 },
  fieldLabel: { fontSize: 12 },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, height: 46, fontSize: 14 },
  formActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "500" as const },
  saveBtn: { flex: 2, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
});
