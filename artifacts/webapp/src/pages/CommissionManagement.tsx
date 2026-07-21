import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Percent, TrendingUp, Award, Edit2, Check, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";
import { commissions as commissionsApi } from "@workspace/api-client-react";

const TIER_ICONS: Record<string, typeof TrendingUp> = { New: TrendingUp, Established: TrendingUp, Top: Award };

export function CommissionManagement({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [tiers, setTiers] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const [tiersRes, tiersDetail] = await Promise.all([
        commissionsApi.tiers(),
        commissionsApi.list(),
      ]);
      const tiersData = (tiersRes as any).data ?? tiersRes;
      setTiers(Array.isArray(tiersData) ? tiersData : tiersData.data || []);
      const listData = (tiersDetail as any).data ?? tiersDetail;
      setOverrides(Array.isArray(listData) ? listData : listData.data || []);
    } catch (err) {
      console.error("Failed to load commissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => { const t = tiers.find((t) => t.id === id); if (t) { setEditingTier(id); setEditRate(String(t.rate)); } };
  const handleSave = (id: string) => {
    const rate = parseInt(editRate, 10);
    if (isNaN(rate) || rate < 0 || rate > 100) { toast.error("Invalid Rate", { description: "Commission rate must be between 0 and 100" }); return; }
    setTiers((prev) => prev.map((t) => t.id === id ? { ...t, rate } : t));
    setEditingTier(null);
    setEditRate("");
    toast.success("Commission rate updated");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commissions</h1>
          <p className="text-sm text-muted-foreground">Tier-based structure</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : tiers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No commission tiers configured</p>
      ) : tiers.map((tier) => {
        const Icon = TIER_ICONS[tier.name] || Percent;
        return (
          <Card key={tier.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{tier.name}</p>
                  {editingTier === tier.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={editRate} onChange={(e) => setEditRate(e.target.value)} className="w-20 h-8 text-sm text-center" type="number" />
                      <span className="text-sm text-muted-foreground">%</span>
                      <Button size="sm" variant="ghost" className="text-green-600 h-8 w-8 p-0" onClick={() => handleSave(tier.id)}><Check size={14} /></Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground h-8 w-8 p-0" onClick={() => { setEditingTier(null); setEditRate(""); }}><X size={14} /></Button>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-primary">{tier.rate}% commission</p>
                  )}
                </div>
                <Badge variant="secondary">{tier.vendorCount} vendors</Badge>
              </div>

              <div className="flex border-y border-border py-3">
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground">Min Orders</p>
                  <p className="text-sm font-semibold mt-1">{tier.minOrders > 0 ? tier.minOrders : "—"}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground">Min Revenue</p>
                  <p className="text-sm font-semibold mt-1">{tier.minRevenue > 0 ? formatPrice(tier.minRevenue) : "—"}</p>
                </div>
              </div>

              {editingTier !== tier.id && (
                <button onClick={() => handleEdit(tier.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
                  <Edit2 size={12} /> Edit Rate
                </button>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div>
        <h2 className="text-lg font-bold mb-1">Vendor Overrides</h2>
        <p className="text-sm text-muted-foreground mb-4">Custom rates for specific vendors</p>
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendor overrides configured</p>
          ) : overrides.map((ov) => (
            <Card key={ov.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-600">{ov.vendorName.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{ov.vendorName}</p>
                  <p className="text-xs text-muted-foreground">Default: {ov.defaultRate}%</p>
                </div>
                <span className="text-lg font-bold text-yellow-600">{ov.currentRate}%</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}