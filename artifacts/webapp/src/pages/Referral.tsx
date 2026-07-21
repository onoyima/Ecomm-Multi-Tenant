import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Users, Copy, Share2, ArrowLeft, TrendingUp, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { referrals, type Referral, type ReferralStats } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const TIERS = [
  { name: "Bronze", referrals: 1, bonus: 500, color: "text-amber-700", bg: "bg-amber-100" },
  { name: "Silver", referrals: 5, bonus: 3000, color: "text-gray-500", bg: "bg-gray-100" },
  { name: "Gold", referrals: 15, bonus: 10000, color: "text-yellow-500", bg: "bg-yellow-100" },
  { name: "Platinum", referrals: 30, bonus: 25000, color: "text-blue-500", bg: "bg-blue-100" },
];

export function Referral({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [refs, setRefs] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([referrals.list(), referrals.stats()]).then(([r, s]) => {
      setRefs(r.data ?? []);
      setStats(s.data);
    }).catch(() => {
      toast.error("Failed to load referral data");
    }).finally(() => setLoading(false));
  }, []);

  const referralLink = "https://shopdrop.app/ref/" + (refs[0]?.referralCode ?? "your-code");

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/marketplace")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <motion.div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 text-white" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <Gift size={24} />
          <h1 className="text-xl font-bold">Refer & Earn</h1>
        </div>
        <p className="text-white/80 mb-4">Share your referral link and earn rewards when friends join and shop</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 text-sm font-mono truncate">{referralLink}</div>
          <Button className="bg-white text-purple-600 hover:bg-white/90" onClick={handleCopy}>
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        <Button variant="secondary" className="w-full mt-3 gap-2" onClick={() => toast.info("Sharing...")}>
          <Share2 size={16} /> Share with Friends
        </Button>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{stats.totalReferrals}</p><p className="text-xs text-muted-foreground">Referrals</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalEarned)}</p><p className="text-xs text-muted-foreground">Earned</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{stats.totalReferrals - stats.completedCount}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">Reward Tiers</h2>
          <div className="space-y-3">
            {TIERS.map((t) => (
              <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center`}>
                  <Award size={18} className={t.color} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.referrals} referrals → {formatPrice(t.bonus)}</p>
                </div>
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ((stats?.totalReferrals ?? 0) / t.referrals) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold mb-4">Recent Referrals</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" />
            </div>
          ) : refs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users size={32} className="mx-auto mb-2" />
              <p>No referrals yet. Share your link to start earning!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {refs.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium">{r.referredId || "Referral"}</p>
                    <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    r.status === "completed" ? "bg-green-100 text-green-700" :
                    r.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
