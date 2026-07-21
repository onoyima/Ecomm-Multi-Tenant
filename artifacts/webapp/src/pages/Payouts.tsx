import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Calendar, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";
import { payouts as payoutsApi } from "@workspace/api-client-react";

const PAYOUT_TABS = ["Pending", "Processing", "History"];

const STATUS_STYLE: Record<string, { variant: "secondary" | "default" | "outline" }> = {
  pending: { variant: "secondary" },
  processing: { variant: "default" },
  completed: { variant: "outline" },
};

export function Payouts({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [tab, setTab] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const res = await payoutsApi.list();
      const data = (res as any).data ?? res;
      setPayouts(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalProcessing = payouts.filter((p) => p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const totalCompletedToday = payouts.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  const filtered = payouts.filter((p) => {
    if (tab === 0) return p.status === "pending";
    if (tab === 1) return p.status === "processing";
    if (tab === 2) return p.status === "completed";
    return true;
  });

  const handleProcess = async (id: string) => {
    try {
      await payoutsApi.process(id, { status: "processing" });
      toast.success("Payout processing started");
      loadPayouts();
    } catch (err) {
      toast.error("Failed to process payout");
    }
  };
  
  const handleCancel = async (id: string) => {
    try {
      await payoutsApi.cancel(id);
      toast.success("Payout cancelled");
      loadPayouts();
    } catch (err) {
      toast.error("Failed to cancel payout");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-sm text-muted-foreground">{payouts.length} this period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Pending Payouts", value: formatPrice(totalPending), color: "text-yellow-500" },
          { label: "Processing", value: formatPrice(totalProcessing), color: "text-primary" },
          { label: "Completed Today", value: formatPrice(totalCompletedToday), color: "text-green-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        {PAYOUT_TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              tab === i ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-2">
              <CreditCard size={48} className="mx-auto text-muted-foreground" />
              <p className="font-semibold">No payouts</p>
              <p className="text-sm text-muted-foreground">Nothing to show in this category</p>
            </CardContent>
          </Card>
        ) : filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-0">
              <div className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{item.vendor?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.vendor || item.vendorName}</p>
                  <p className="text-base font-bold mt-0.5">{formatPrice(item.amount)}</p>
                </div>
                <Badge variant={STATUS_STYLE[item.status]?.variant || "outline"} className="capitalize">{item.status}</Badge>
              </div>

              <div className="flex gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={11} /> {item.date || item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                <span className="flex items-center gap-1"><CreditCard size={11} /> {item.paymentMethod || item.payment_method}</span>
              </div>

              {(item.status === "pending" || item.status === "processing") && (
                <div className="flex gap-2 justify-end px-4 py-3 border-t border-border bg-muted/30">
                  {item.status === "pending" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleProcess(item.id)}>
                      <ArrowRight size={12} className="mr-1" /> Process
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => handleCancel(item.id)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}