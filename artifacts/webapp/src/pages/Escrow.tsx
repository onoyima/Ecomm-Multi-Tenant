import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";
import { escrow as escrowApi } from "@workspace/api-client-react";

const STATUS_STYLE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  held: { label: "Held", variant: "default" },
  partially_released: { label: "Partially Released", variant: "secondary" },
  released: { label: "Released", variant: "outline" },
  disputed: { label: "Disputed", variant: "destructive" },
};

export function Escrow({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEscrows();
  }, []);

  const loadEscrows = async () => {
    setLoading(true);
    try {
      const res = await escrowApi.list();
      const data = (res as any).data ?? res;
      setEntries(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load escrows:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalHeld = entries.reduce((sum, e) => sum + ((e.status === "held" || e.status === "partially_released") ? e.amount_held || e.amountHeld : 0), 0);
  const pendingRelease = entries.filter((e) => e.status === "held").reduce((sum, e) => sum + (e.amount_held || e.amountHeld), 0);
  const disputed = entries.filter((e) => e.status === "disputed").reduce((sum, e) => sum + (e.amount_held || e.amountHeld), 0);
  const releasedToday = entries.filter((e) => e.status === "released").reduce((sum, e) => sum + (e.amount_held || e.amountHeld), 0);

  const handleRelease = async (id: string) => {
    try {
      await escrowApi.release(id);
      toast.success("Funds released to vendor");
      loadEscrows();
    } catch (err) {
      toast.error("Failed to release funds");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escrow</h1>
          <p className="text-sm text-muted-foreground">{entries.length} active entries</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Held", value: formatPrice(totalHeld), color: "text-primary" },
          { label: "Pending Release", value: formatPrice(pendingRelease), color: "text-yellow-500" },
          { label: "Disputed", value: formatPrice(disputed), color: "text-destructive" },
          { label: "Released Today", value: formatPrice(releasedToday), color: "text-green-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-2">
              <Lock size={48} className="mx-auto text-muted-foreground" />
              <p className="font-semibold">No escrow entries</p>
              <p className="text-sm text-muted-foreground">Nothing to show</p>
            </CardContent>
          </Card>
        ) : entries.map((item) => {
          const st = STATUS_STYLE[item.status] || { label: item.status, variant: "default" as const };
          return (
            <Card key={item.id}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Order #{item.orderId || item.order_id}</p>
                    <p className="text-xs text-muted-foreground">{item.vendor || item.vendor_name}</p>
                  </div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="flex justify-between px-4 py-3 border-y border-border">
                  <span className="text-sm text-muted-foreground">Amount Held</span>
                  <span className="text-base font-bold">{formatPrice(item.amountHeld || item.amount_held)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">{item.date || item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                  <div className="flex gap-2">
                    {item.status === "held" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRelease(item.id)}>
                        <Unlock size={12} className="mr-1" /> Release
                      </Button>
                    )}
                    {item.status === "partially_released" && (
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => handleRelease(item.id)}>
                        <Unlock size={12} className="mr-1" /> Release Remaining
                      </Button>
                    )}
                    {item.status === "disputed" && (
                      <Button size="sm" variant="destructive">
                        <AlertTriangle size={12} className="mr-1" /> View Dispute
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}