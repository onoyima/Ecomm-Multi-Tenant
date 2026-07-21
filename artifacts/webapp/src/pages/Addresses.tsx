import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Plus, Pencil, Trash2, Star, Loader2, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addresses as addressesApi } from "@workspace/api-client-react";
import { toast } from "sonner";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function Addresses({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    label: "", recipientName: "", phone: "", street: "", city: "",
    state: "", postalCode: "", country: "",
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressesApi.list();
      const data = (res as any).data ?? res;
      setAddresses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ label: "", recipientName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const openEdit = (a: any) => {
    setForm({
      label: a.label || "",
      recipientName: a.recipientName || a.recipient_name || "",
      phone: a.phone || "",
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      postalCode: a.postalCode || a.postal_code || "",
      country: a.country || "",
    });
    setEditingId(a.id.toString());
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        label: form.label,
        recipientName: form.recipientName,
        phone: form.phone,
        street: form.street,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      };
      if (editingId) {
        await addressesApi.update(editingId, payload);
        toast.success("Address updated");
      } else {
        await addressesApi.create(payload);
        toast.success("Address added");
      }
      resetForm();
      loadAddresses();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await addressesApi.delete(id);
      toast.success("Address deleted");
      setDeletingId(null);
      loadAddresses();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const setDefault = async (id: string) => {
    try {
      await addressesApi.update(id, { isDefault: true });
      toast.success("Default address updated");
      loadAddresses();
    } catch {
      toast.error("Failed to set default address");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">My Addresses</h1>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
            <Plus size={14} /> Add New
          </Button>
        )}
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit Address" : "New Address"}</h2>
            <button onClick={resetForm} className="p-1 rounded-md hover:bg-muted">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Label (e.g. Home)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Input placeholder="Full Name" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          </div>
          <Textarea placeholder="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting} className="gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </motion.div>
      )}

      {addresses.length === 0 && !showForm ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <MapPin size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No saved addresses</h2>
          <p className="text-muted-foreground">Add a delivery address to get started</p>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
            <Plus size={14} /> Add Address
          </Button>
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {addresses.map((a: any) => (
              <motion.div key={a.id} variants={fadeUp} layout>
                <Card className={a.isDefault ? "border-primary/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={16} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{a.label}</span>
                            {a.isDefault && (
                              <Badge variant="secondary" className="text-[10px] h-5 gap-0.5">
                                <Star size={10} className="fill-yellow-500 text-yellow-500" /> Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-0.5">{a.recipientName || a.recipient_name}</p>
                          <p className="text-sm text-muted-foreground">{a.phone}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {a.street}, {a.city}, {a.state} {a.postalCode || a.postal_code}, {a.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!a.isDefault && (
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDefault(a.id.toString())} title="Set as default">
                            <Star size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(a)}>
                          <Pencil size={14} />
                        </Button>
                        {deletingId === a.id.toString() ? (
                          <div className="flex gap-1">
                            <Button variant="destructive" size="icon" className="w-8 h-8" onClick={() => handleDelete(a.id.toString())}>
                              <Check size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDeletingId(null)}>
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => setDeletingId(a.id.toString())}>
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
