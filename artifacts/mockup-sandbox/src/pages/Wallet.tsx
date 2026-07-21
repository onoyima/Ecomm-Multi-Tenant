import { useState } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, ArrowLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatPrice, VENDOR_STATS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TRANSACTIONS = [
  { id: "t1", type: "credit", amount: 25000, description: "Wallet Top Up", date: "May 12, 2026", status: "completed" },
  { id: "t2", type: "debit", amount: 85000, description: "Order #ord-001", date: "May 10, 2026", status: "completed" },
  { id: "t3", type: "credit", amount: 18500, description: "Sale proceeds - Adidas Dress", date: "May 8, 2026", status: "completed" },
  { id: "t4", type: "debit", amount: 5000, description: "Withdrawal", date: "May 5, 2026", status: "completed" },
  { id: "t5", type: "credit", amount: 32000, description: "Wallet Top Up", date: "May 1, 2026", status: "pending" },
];

export function Wallet({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const balance = user?.walletBalance ?? VENDOR_STATS.walletBalance;
  const withdrawable = VENDOR_STATS.withdrawable;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">My Wallet</h1>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
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

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">₦0</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{formatPrice(VENDOR_STATS.walletBalance)}</p>
            <p className="text-sm text-muted-foreground">Total Deposits</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <History size={18} />
            <h3 className="font-semibold">Transaction History</h3>
          </div>
          <div className="space-y-3">
            {TRANSACTIONS.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "credit" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  {t.type === "credit" ? (
                    <ArrowDownLeft size={18} className="text-success" />
                  ) : (
                    <ArrowUpRight size={18} className="text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === "credit" ? "text-success" : "text-destructive"}`}>
                    {t.type === "credit" ? "+" : "-"}{formatPrice(t.amount)}
                  </p>
                  <p className={`text-xs ${t.status === "pending" ? "text-warning" : "text-muted-foreground"}`}>
                    {t.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
