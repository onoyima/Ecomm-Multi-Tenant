import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Award, ArrowDownLeft, ArrowUpRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { wallet, type WalletTransaction } from "@workspace/api-client-react";
import { useVendorStats, formatPrice } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function SellerEarnings({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const { data: vendorStats } = useVendorStats();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wallet.transactions({ perPage: 20 }).then((res) => {
      setTransactions(res.data);
    }).catch(() => {
      toast.error("Failed to load transactions");
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <motion.div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-white/80 mb-1">Total Earned (All Time)</p>
        <p className="text-4xl font-bold mb-5">{formatPrice(vendorStats?.totalRevenue ?? 0)}</p>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1">
            <p className="text-xs text-white/70 mb-1">Available</p>
            <p className="text-lg font-semibold">{formatPrice(vendorStats?.withdrawable ?? 0)}</p>
          </div>
          <div className="w-px h-9 bg-white/30" />
          <div className="flex-1">
            <p className="text-xs text-white/70 mb-1">In Escrow</p>
            <p className="text-lg font-semibold">{formatPrice(22500)}</p>
          </div>
        </div>
        <Button className="bg-white text-emerald-600 hover:bg-white/90" onClick={() => toast.info("Withdrawal initiated!")}>
          <Download size={16} className="mr-1" /> Withdraw Funds
        </Button>
      </motion.div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Award size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold">Established Vendor</p>
              <p className="text-xs text-muted-foreground">10% commission rate · {vendorStats?.totalOrders ?? 0} orders</p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-yellow-500" style={{ width: "65%" }} />
          </div>
          <p className="text-xs text-muted-foreground">852 more orders to reach Top Vendor (5% commission)</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2">
          <h3 className="font-bold mb-3">Payout Schedule</h3>
          {[
            { label: "Schedule", value: "After delivery confirmation" },
            { label: "Next Payout", value: "May 15, 2026" },
            { label: "Amount", value: formatPrice(22500) },
            { label: "Destination", value: "GTBank ****4521" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold mb-4">Transaction History</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  t.type === "credit" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                }`}>
                  {t.type === "credit" ? (
                    <ArrowDownLeft size={16} className="text-green-600" />
                  ) : (
                    <ArrowUpRight size={16} className="text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                </div>
                <span className={`text-sm font-bold ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "credit" ? "+" : "-"}{formatPrice(t.amount)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
