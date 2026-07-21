import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Star, Gift, ArrowLeft, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loyaltyPoints, type LoyaltyPoint, type LoyaltyBalance } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const REWARDS = [
  { title: "Free Shipping", points: 500, icon: Gift, color: "text-blue-500", bg: "bg-blue-100" },
  { title: "₦2,000 Coupon", points: 1000, icon: Award, color: "text-green-500", bg: "bg-green-100" },
  { title: "₦5,000 Coupon", points: 2000, icon: Award, color: "text-purple-500", bg: "bg-purple-100" },
  { title: "VIP Access", points: 5000, icon: Star, color: "text-yellow-500", bg: "bg-yellow-100" },
];

const HOW_TO_EARN = [
  { action: "Place an order", points: "1 pt per ₦100", icon: TrendingUp },
  { action: "Write a review", points: "50 pts", icon: Star },
  { action: "Refer a friend", points: "200 pts", icon: Gift },
  { action: "Complete KYC", points: "100 pts", icon: CheckCircle },
];

export function LoyaltyPoints({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [points, setPoints] = useState<LoyaltyPoint[]>([]);
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loyaltyPoints.list(), loyaltyPoints.balance()]).then(([p, b]) => {
      setPoints(p.data ?? []);
      setBalance(b.data);
    }).catch(() => {
      toast.error("Failed to load loyalty data");
    }).finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (item: typeof REWARDS[0]) => {
    try {
      await loyaltyPoints.redeem({ points: item.points });
      toast.success(`Redeemed ${item.title}!`);
      const b = await loyaltyPoints.balance();
      setBalance(b.data);
    } catch {
      toast.error("Redemption failed. Insufficient points?");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/marketplace")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <motion.div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <Award size={24} />
          <h1 className="text-xl font-bold">Loyalty Points</h1>
        </div>
        <p className="text-5xl font-bold mb-1">{balance?.balance ?? 0}</p>
        <p className="text-white/80">points available</p>
      </motion.div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">How to Earn</h2>
          <div className="space-y-3">
            {HOW_TO_EARN.map((h) => (
              <div key={h.action} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <h.icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.action}</p>
                  <p className="text-xs text-muted-foreground">{h.points}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">Redeem Rewards</h2>
          <div className="grid grid-cols-2 gap-3">
            {REWARDS.map((r) => (
              <button key={r.title} onClick={() => handleRedeem(r)} disabled={(balance?.balance ?? 0) < r.points}
                className="p-4 rounded-xl border border-border text-center space-y-2 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`w-10 h-10 rounded-full ${r.bg} flex items-center justify-center mx-auto`}>
                  <r.icon size={18} className={r.color} />
                </div>
                <p className="font-semibold text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.points.toLocaleString()} pts</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">Points History</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" />
            </div>
          ) : points.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award size={32} className="mx-auto mb-2" />
              <p>No points earned yet. Start shopping!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {points.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium">{p.reason}</p>
                    <p className="text-xs text-muted-foreground">{p.createdAt}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">+{p.points}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
