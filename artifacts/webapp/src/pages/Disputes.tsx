import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShieldAlert, Plus, Loader2, X, Check,
  AlertTriangle, Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { disputes as disputesApi, orders as ordersApi } from "@workspace/api-client-react";
import { toast } from "sonner";

const STATUS_STYLE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "destructive" },
  resolved: { label: "Resolved", variant: "outline" },
  escalated: { label: "Escalated", variant: "default" },
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function Disputes({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ orderId: "", subject: "", description: "" });

  useEffect(() => {
    loadDisputes();
    loadOrders();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await disputesApi.list();
      const data = (res as any).data ?? res;
      setDisputes(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersApi.list();
      const data = (res as any).data ?? res;
      const list = Array.isArray(data) ? data : data.data || [];
      setOrders(list);
    } catch {}
  };

  const resetForm = () => {
    setForm({ orderId: "", subject: "", description: "" });
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!form.orderId || !form.subject || !form.description) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await disputesApi.create({
        orderId: Number(form.orderId),
        subject: form.subject,
        description: form.description,
      });
      toast.success("Dispute created");
      resetForm();
      loadDisputes();
    } catch {
      toast.error("Failed to create dispute");
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold">Disputes</h1>
          {disputes.filter((d) => d.status === "open").length > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {disputes.filter((d) => d.status === "open").length} open
            </Badge>
          )}
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus size={14} /> New Dispute
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
            <h2 className="font-semibold">Open a Dispute</h2>
            <button onClick={resetForm} className="p-1 rounded-md hover:bg-muted">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <Select value={form.orderId} onValueChange={(v) => setForm({ ...form, orderId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((o) => (
                  <SelectItem key={o.id} value={o.id.toString()}>
                    Order #{o.orderNumber || o.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <Textarea
              placeholder="Describe the issue in detail..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting} className="gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
              Submit Dispute
            </Button>
          </div>
        </motion.div>
      )}

      {disputes.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Scale size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No disputes</h2>
          <p className="text-muted-foreground">All transactions are running smoothly</p>
          <Button onClick={() => setShowForm(true)} className="gap-1">
            <Plus size={14} /> Open Dispute
          </Button>
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {disputes.map((d) => {
              const st = STATUS_STYLE[d.status] || { label: d.status, variant: "outline" as const };
              return (
                <motion.div key={d.id} variants={fadeUp} layout>
                  <Card>
                    <CardContent className="p-0">
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                          <ShieldAlert size={16} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">Order #{d.orderId || d.order_id}</p>
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </div>
                          <p className="text-sm mt-1">{d.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.description}</p>
                          {d.resolution && (
                            <p className="text-xs text-green-600 mt-1">Resolution: {d.resolution}</p>
                          )}
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {d.createdAt || d.created_at ? new Date(d.createdAt || d.created_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
