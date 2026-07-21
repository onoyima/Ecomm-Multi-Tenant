import { useState } from "react";
import { TrendingUp, ShoppingBag, Box, Star, DollarSign, Package, Plus, AlertTriangle, MapPin, Camera, BarChart3, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VENDOR_STATS, PRODUCTS, formatPrice } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const maxRev = Math.max(...VENDOR_STATS.monthlyRevenue);
const lowStockProducts = PRODUCTS.filter((p) => p.stock <= 15);

export function VendorDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();

  const stats = [
    { label: "Total Revenue", value: formatPrice(VENDOR_STATS.totalRevenue), icon: DollarSign, color: "#10B981", change: "+18%" },
    { label: "Orders", value: VENDOR_STATS.totalOrders.toString(), icon: ShoppingBag, color: "#5B4EFF", change: "+12%" },
    { label: "Products", value: VENDOR_STATS.totalProducts.toString(), icon: Box, color: "#FF6B35", change: "+3" },
    { label: "Rating", value: VENDOR_STATS.avgRating.toString(), icon: Star, color: "#FFB800", change: "+0.2" },
  ];

  const quickActions = [
    { icon: Plus, label: "Add Product", color: "#5B4EFF", action: () => onNavigate("/add-product") },
    { icon: BarChart3, label: "AI Insights", color: "#FF6B35", action: () => {} },
    { icon: AlertTriangle, label: "Stock Alerts", color: "#EF4444", badge: lowStockProducts.length.toString(), action: () => {} },
    { icon: MapPin, label: "Shipping Zones", color: "#10B981", action: () => {} },
    { icon: Camera, label: "Deliveries", color: "#8B5CF6", action: () => {} },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3A2FD9] to-[#5B4EFF] rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{user?.businessName || user?.name}</h1>
            <p className="text-white/70">Vendor Dashboard</p>
          </div>
          <Button variant="secondary" className="bg-white/15 text-white border-0 hover:bg-white/25">
            <DollarSign size={16} className="mr-1" /> Withdraw
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm">Wallet Balance</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(VENDOR_STATS.walletBalance)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm">Withdrawable</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(VENDOR_STATS.withdrawable)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-white/60 text-sm">Pending Orders</p>
            <p className="text-2xl font-bold mt-1">{VENDOR_STATS.pendingOrders}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                  {s.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Revenue (6 months)</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">+18% this month</Badge>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
              {VENDOR_STATS.monthlyRevenue.map((rev, i) => {
                const h = Math.max(12, (rev / maxRev) * 100);
                const isLast = i === VENDOR_STATS.monthlyRevenue.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{i === VENDOR_STATS.monthlyRevenue.length - 1 ? `₦${(rev / 1000).toFixed(0)}k` : ""}</span>
                    <div
                      className="w-full rounded-lg transition-all"
                      style={{
                        height: `${h}%`,
                        backgroundColor: isLast ? "hsl(var(--primary))" : "hsl(var(--muted))",
                        minHeight: 8,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{MONTHS[i]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ backgroundColor: a.color + "15" }}>
                    <a.icon size={20} style={{ color: a.color }} />
                    {a.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center">{a.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Products</h3>
            <Button variant="ghost" size="sm">See all <ArrowUpRight size={14} className="ml-1" /></Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {VENDOR_STATS.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p}</p>
                  <p className="text-xs text-muted-foreground">Best seller</p>
                </div>
                <TrendingUp size={16} className="text-success flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-border/50 border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-destructive" />
              <h3 className="font-semibold">Low Stock Alerts</h3>
              <Badge variant="destructive" className="ml-auto">{lowStockProducts.length} items</Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-sm text-primary font-bold">{formatPrice(p.price)}</p>
                  </div>
                  <Badge variant={p.stock <= 5 ? "destructive" : "secondary"} className={p.stock <= 5 ? "" : "bg-warning/15 text-warning border-0"}>
                    {p.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
