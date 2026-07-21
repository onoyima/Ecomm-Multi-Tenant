import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Store, Package, Star, Loader2, Plus, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { suppliers as suppliersApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function SupplierManagement({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", contactEmail: "", phone: "" });

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await suppliersApi.list();
      const d = (res as any).data ?? res;
      setSuppliers(Array.isArray(d) ? d : d.data || []);
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const resetForm = () => {
    setForm({ name: "", contactEmail: "", phone: "" });
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!form.name || !form.contactEmail) {
      toast.error("Name and email are required");
      return;
    }
    setSuppliers((prev) => [...prev, { id: Date.now().toString(), ...form, reliabilityScore: 0, totalOrders: 0, status: "active" }]);
    toast.success("Supplier added (local only - admin role required for API)");
    resetForm();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">{suppliers.length} suppliers</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus size={14} /> Add Supplier
          </Button>
        )}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Add Supplier</h2>
            <button onClick={resetForm} className="p-1 rounded-md hover:bg-muted"><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add Supplier</Button>
          </div>
        </motion.div>
      )}

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <Store size={48} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">No suppliers added yet</p>
            <p className="text-sm text-muted-foreground">Add a supplier to get started</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div className="grid sm:grid-cols-2 gap-4" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {suppliers.map((s) => (
              <motion.div key={s.id} variants={fadeUp} layout>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Store size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <Badge variant={s.status === "active" ? "default" : "secondary"} className="capitalize text-[10px]">{s.status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{s.reliabilityScore ?? 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{s.contactEmail}</span>
                      {s.phone && <span>{s.phone}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2">
                      <span className="flex items-center gap-1"><Package size={12} /> {s.totalOrders ?? 0} orders</span>
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> Score: {s.reliabilityScore ?? 0}</span>
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
