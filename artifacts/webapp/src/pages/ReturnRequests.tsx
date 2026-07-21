import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, RotateCcw, Plus, Loader2, X, Check,
  Package, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { returnRequests as returnRequestsApi, orders as ordersApi } from "@workspace/api-client-react";
import { toast } from "sonner";

const STATUS_STYLE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  refunded: { label: "Refunded", variant: "outline" },
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function ReturnRequests({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ orderId: "", productId: "", reason: "" });

  const isVendor = user?.role === "vendor";

  useEffect(() => {
    loadReturns();
    if (!isVendor) loadOrders();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await returnRequestsApi.list();
      const data = (res as any).data ?? res;
      setReturns(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load return requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersApi.list();
      const data = (res as any).data ?? res;
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch {}
  };

  const resetForm = () => {
    setForm({ orderId: "", productId: "", reason: "" });
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!form.orderId || !form.productId || !form.reason) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await returnRequestsApi.create({
        orderId: form.orderId,
        productId: form.productId,
        reason: form.reason,
      });
      toast.success("Return request submitted");
      resetForm();
      loadReturns();
    } catch {
      toast.error("Failed to create return request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await returnRequestsApi.updateStatus(id, { status });
      toast.success(`Return request ${status}`);
      loadReturns();
    } catch {
      toast.error("Failed to update status");
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
          <h1 className="text-2xl font-bold">{isVendor ? "Return Requests" : "My Returns"}</h1>
          {returns.filter((r) => r.status === "pending").length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {returns.filter((r) => r.status === "pending").length} pending
            </Badge>
          )}
        </div>
        {!isVendor && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus size={14} /> New Return
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
            <h2 className="font-semibold">Request a Return</h2>
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
              placeholder="Product ID"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            />
            <Textarea
              placeholder="Reason for return..."
              rows={4}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting} className="gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              Submit
            </Button>
          </div>
        </motion.div>
      )}

      {returns.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <RotateCcw size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No return requests</h2>
          <p className="text-muted-foreground">
            {isVendor ? "No customers have requested returns yet" : "You haven't requested any returns"}
          </p>
          {!isVendor && (
            <Button onClick={() => setShowForm(true)} className="gap-1">
              <Plus size={14} /> Request Return
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {returns.map((r) => {
              const st = STATUS_STYLE[r.status] || { label: r.status, variant: "outline" as const };
              return (
                <motion.div key={r.id} variants={fadeUp} layout>
                  <Card>
                    <CardContent className="p-0">
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">Order #{r.orderId || r.order_id}</p>
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Product ID: {r.productId || r.product_id}</p>
                          <p className="text-sm mt-1">{r.reason}</p>
                          {r.vendorNotes && (
                            <p className="text-xs text-muted-foreground mt-1">Vendor notes: {r.vendorNotes}</p>
                          )}
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                        {isVendor && r.status === "pending" && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50 gap-1"
                              onClick={() => handleStatusUpdate(r.id.toString(), "approved")}
                            >
                              <ThumbsUp size={12} /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 gap-1"
                              onClick={() => handleStatusUpdate(r.id.toString(), "rejected")}
                            >
                              <ThumbsDown size={12} /> Reject
                            </Button>
                          </div>
                        )}
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
