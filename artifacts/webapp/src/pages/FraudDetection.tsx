import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Smartphone, Globe, DollarSign, User, CheckCircle, ShieldOff, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fraud, type FraudAlert, type FraudStats } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const RISK_TABS = ["All", "High Risk", "Medium", "Review"];

const REASON_ICONS: Record<string, typeof Zap> = { "Velocity Check": Zap, "Device Mismatch": Smartphone, "IP Reputation": Globe, "Amount Anomaly": DollarSign };

export function FraudDetection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [tab, setTab] = useState(0);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats>({ flagged: 0, review: 0, blocked: 0, falsePositive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fraud.list(), fraud.stats()]).then(([alertsRes, statsRes]) => {
      setAlerts(alertsRes.data);
      setStats(statsRes.data);
    }).catch(() => {
      toast.error("Failed to load fraud alerts");
    }).finally(() => setLoading(false));
  }, []);

  const filtered = alerts.filter((a) => {
    if (tab === 0) return true;
    if (tab === 1) return a.riskLevel === "high";
    if (tab === 2) return a.riskLevel === "medium";
    if (tab === 3) return a.status === "review";
    return true;
  });

  const handleApprove = async (id: string) => {
    try {
      await fraud.approve(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "false_positive" } : a));
      toast.success("Approved as legitimate");
    } catch { toast.error("Failed to approve"); }
  };
  const handleBlock = async (id: string) => {
    try {
      await fraud.block(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "blocked" } : a));
      toast.success("Transaction blocked");
    } catch { toast.error("Failed to block"); }
  };
  const handleReview = async (id: string) => {
    try {
      await fraud.review(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "review" } : a));
      toast.success("Flagged for review");
    } catch { toast.error("Failed to flag"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fraud Monitoring</h1>
          <p className="text-sm text-muted-foreground">{stats.flagged} flagged today</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Flagged", value: stats.flagged, color: "text-destructive" },
          { label: "Under Review", value: stats.review, color: "text-yellow-500" },
          { label: "Blocked", value: stats.blocked, color: "text-destructive" },
          { label: "False Positives", value: stats.falsePositive, color: "text-green-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        {RISK_TABS.map((t, i) => (
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.transactionId}</span>
                      <Badge variant={item.riskLevel === "high" ? "destructive" : item.riskLevel === "medium" ? "secondary" : "default"} className="text-[10px]">
                        {item.riskLevel === "high" ? "High" : item.riskLevel === "medium" ? "Medium" : "Low"}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold mt-1">{formatPrice(item.amount)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                  {REASON_ICONS[item.reason] ? <Zap size={12} /> : <Shield size={12} />}
                  <span>{item.reason}</span>
                  <span>·</span>
                  <span>{item.timestamp}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <User size={12} className="text-muted-foreground" />
                  <span>{item.customerName}</span>
                </div>
              </div>

              {item.status !== "blocked" && item.status !== "false_positive" && (
                <div className="flex gap-2 justify-end px-4 py-3 border-t border-border bg-muted/30">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(item.id)}>
                    <CheckCircle size={12} className="mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleBlock(item.id)}>
                    <ShieldOff size={12} className="mr-1" /> Block
                  </Button>
                  <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50" onClick={() => handleReview(item.id)}>
                    <Eye size={12} className="mr-1" /> Review
                  </Button>
                </div>
              )}

              {item.status === "false_positive" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-600 text-sm">
                  <CheckCircle size={14} /> Approved as legitimate
                </div>
              )}
              {item.status === "blocked" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 text-sm">
                  <ShieldOff size={14} /> Transaction blocked
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center space-y-2">
              <Shield size={48} className="mx-auto text-muted-foreground" />
              <p className="font-semibold">All clear</p>
              <p className="text-sm text-muted-foreground">No fraud alerts in this category</p>
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </div>
  );
}