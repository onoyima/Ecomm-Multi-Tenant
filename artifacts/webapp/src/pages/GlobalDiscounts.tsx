import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Percent, Plus, Trash2, Loader2, Tag, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { globalDiscounts } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function GlobalDiscounts({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", type: "percentage", value: "", startDate: "", endDate: "" });

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await globalDiscounts.list();
      const d = (res as any).data ?? res;
      setDiscounts(Array.isArray(d) ? d : d.data || []);
    } catch {
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDiscounts(); }, [loadDiscounts]);

  const resetForm = () => {
    setForm({ name: "", type: "percentage", value: "", startDate: "", endDate: "" });
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!form.name || !form.value || !form.startDate || !form.endDate) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await globalDiscounts.create({ ...form, value: Number(form.value) });
      toast.success("Discount created");
      resetForm();
      loadDiscounts();
    } catch {
      toast.error("Failed to create discount");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await globalDiscounts.delete(id);
      toast.success("Discount deleted");
      loadDiscounts();
    } catch {
      toast.error("Failed to delete discount");
    }
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
          <h1 className="text-2xl font-bold">Global Discounts</h1>
          <p className="text-sm text-muted-foreground">{discounts.length} active discounts</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus size={14} /> Create Discount
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
            <h2 className="font-semibold">New Discount</h2>
            <button onClick={resetForm} className="p-1 rounded-md hover:bg-muted"><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <Input placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <Input placeholder="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input placeholder="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting} className="gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Percent size={14} />}
              Create
            </Button>
          </div>
        </motion.div>
      )}

      {discounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <Tag size={48} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">No discounts created yet</p>
            <p className="text-sm text-muted-foreground">Create your first global discount</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div className="grid sm:grid-cols-2 gap-4" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {discounts.map((d) => (
              <motion.div key={d.id} variants={fadeUp} layout>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Percent size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{d.name}</p>
                          <Badge variant={d.status === "active" ? "default" : "secondary"} className="capitalize text-[10px]">{d.status || "active"}</Badge>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {d.type === "fixed" ? formatPrice(d.value) : `${d.value}%`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {d.startDate || d.start_date || "-"}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {d.endDate || d.end_date || "-"}</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id.toString())}>
                      <Trash2 size={12} /> Delete
                    </Button>
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
