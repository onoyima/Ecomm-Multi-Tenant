import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, ArrowLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { wallet, type WalletTransaction } from "@workspace/api-client-react";
import { formatPrice, useVendorStats } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function Wallet({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const { data: vendorStats } = useVendorStats();
  const balance = user?.walletBalance ?? vendorStats?.walletBalance ?? 0;
  const withdrawable = vendorStats?.withdrawable ?? 0;

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">My Wallet</h1>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="bg-gradient-to-br from-[#3A2FD9] to-[#5B4EFF] text-white border-0">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <WalletIcon size={20} className="text-white/70" />
              <span className="text-white/70 text-sm">Available Balance</span>
            </div>
            <p className="text-4xl sm:text-5xl font-bold">{formatPrice(balance)}</p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white/20 text-white hover:bg-white/30 border-0 gap-2">
                <Plus size={16} /> Top Up
              </Button>
              {user?.role === "vendor" && (
                <Button className="bg-accent text-white hover:bg-accent/90 gap-2">
                  <ArrowUpRight size={16} /> Withdraw ({formatPrice(withdrawable)})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="grid sm:grid-cols-3 gap-4" variants={fadeUp} initial="initial" animate="animate">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">₦0</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{formatPrice(vendorStats?.walletBalance ?? 0)}</p>
            <p className="text-sm text-muted-foreground">Total Deposits</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <History size={18} />
              <h3 className="font-semibold">Transaction History</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" />
              </div>
            ) : (
            <div className="space-y-3">
              {transactions.map((t, i) => (
                <motion.div
                  key={t.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "credit" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {t.type === "credit" ? (
                      <ArrowDownLeft size={18} className="text-success" />
                    ) : (
                      <ArrowUpRight size={18} className="text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === "credit" ? "text-success" : "text-destructive"}`}>
                      {t.type === "credit" ? "+" : "-"}{formatPrice(t.amount)}
                    </p>
                    <p className={`text-xs ${t.status === "pending" ? "text-warning" : "text-muted-foreground"}`}>
                      {t.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
