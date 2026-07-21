import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, ShoppingBag, Box, Star, DollarSign, Package, Plus, AlertTriangle,
  MapPin, BarChart3, ArrowUpRight, Settings, Upload, Truck, LayoutDashboard,
  LogOut, Menu, X, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useVendorStats, useProducts, formatPrice, type Product } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SIDEBAR_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, isExternal: true },
  { key: "dropshipping", label: "Dropshipping Import", icon: ShoppingBag, isRoute: true },
  { key: "add-product", label: "Add Product", icon: Plus, isRoute: true },
  { key: "products", label: "Products", icon: Box },
  { key: "vendor-orders", label: "Orders", icon: Package, isRoute: true },
  { key: "earnings", label: "Earnings", icon: DollarSign, isRoute: true },
];

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function VendorDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: vendorStats = {} as any } = useVendorStats();
  const { data: allProducts = [] } = useProducts({ perPage: 100 });

  const maxRev = Math.max(...(vendorStats.monthlyRevenue || []), 1);
  const lowStockProducts = allProducts.filter((p) => p.stock <= 15);

  const stats = [
    { label: "Total Revenue", value: formatPrice(vendorStats.totalRevenue ?? 0), icon: DollarSign, color: "#10B981", change: "+18%" },
    { label: "Orders", value: (vendorStats.totalOrders ?? 0).toString(), icon: ShoppingBag, color: "#5B4EFF", change: "+12%" },
    { label: "Products", value: (vendorStats.totalProducts ?? 0).toString(), icon: Box, color: "#FF6B35", change: "+3" },
    { label: "Rating", value: (vendorStats.avgRating ?? 0).toString(), icon: Star, color: "#FFB800", change: "+0.2" },
  ];

  const quickActions = [
    { icon: Plus, label: "Add Product", color: "#5B4EFF", action: () => onNavigate("/add-product") },
    { icon: BarChart3, label: "AI Insights", color: "#FF6B35", action: () => toast.info("AI Insights coming soon") },
    { icon: AlertTriangle, label: "Stock Alerts", color: "#EF4444", badge: lowStockProducts.length.toString(), action: () => toast.info("Checking stock alerts...") },
    { icon: MapPin, label: "Shipping Zones", color: "#10B981", action: () => toast.info("Shipping zones coming soon") },
    { icon: Truck, label: "Deliveries", color: "#8B5CF6", action: () => toast.info("Deliveries panel coming soon") },
    { icon: Upload, label: "Bulk Import", color: "#F59E0B", action: () => toast.info("Bulk import coming soon") },
  ];

  const topProducts = (vendorStats.topProducts ?? []).map((title: string) => allProducts.find((p) => p.title === title)).filter(Boolean) as Product[];

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("/vendor")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">ShopDrop</span>
            </div>
            <button className="lg:hidden p-1 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSidebarOpen(false);
                  if (item.isExternal) onNavigate("/marketplace");
                  else if ((item as any).isRoute) onNavigate(`/${item.key}`);
                  else setTab(item.key);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === item.key && !item.isExternal
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border space-y-1">
            <button onClick={() => onNavigate("/help")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Settings size={18} /> Settings
            </button>
            <button onClick={() => { logout(); onNavigate("/marketplace"); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 gap-3">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold hidden sm:block">{user?.businessName || "Vendor Dashboard"}</h1>
              <Badge className="bg-primary/10 text-primary border-0">Vendor</Badge>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-md hover:bg-muted">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
              </button>

              <div className="flex items-center gap-2 p-1.5 rounded-lg">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "V"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{user?.name || "Vendor"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
          <motion.div
            className="bg-gradient-to-r from-[#3A2FD9] to-[#5B4EFF] rounded-2xl p-6 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">Vendor Dashboard</p>
              </div>
              <Button variant="secondary" className="bg-white/15 text-white border-0 hover:bg-white/25">
                <DollarSign size={16} className="mr-1" /> Withdraw
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Wallet Balance</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(vendorStats.walletBalance ?? 0)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Withdrawable</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(vendorStats.withdrawable ?? 0)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 col-span-2 sm:col-span-1">
                <p className="text-white/60 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold mt-1">{vendorStats.pendingOrders ?? 0}</p>
              </div>
            </div>
          </motion.div>

          {(vendorStats.pendingOrders ?? 0) > 0 && (
            <motion.div
              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
                You have <strong>{vendorStats.pendingOrders} pending orders</strong> that need attention
              </p>
              <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-700" onClick={() => setTab("orders")}>
                View Orders
              </Button>
            </motion.div>
          )}

          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <Card className="border-border/50">
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
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Revenue (6 months)</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">+18% this month</Badge>
                </div>
                <div className="flex items-end justify-between h-48 gap-2">
                  {(vendorStats.monthlyRevenue ?? []).map((rev: number, i: number) => {
                    const h = Math.max(12, (rev / maxRev) * 100);
                    const isLast = i === (vendorStats.monthlyRevenue ?? []).length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs text-muted-foreground">{isLast ? `₦${(rev / 1000).toFixed(0)}k` : ""}</span>
                        <div
                          className="w-full rounded-lg transition-all duration-500"
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

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((a) => (
                    <motion.button
                      key={a.label}
                      onClick={a.action}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top Products</h3>
                <Button variant="ghost" size="sm">See all <ArrowUpRight size={14} className="ml-1" /></Button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {topProducts.slice(0, 3).map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">#{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">₦{(p.price / 1000).toFixed(0)}k · Best seller</p>
                    </div>
                    <TrendingUp size={16} className="text-success flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

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
        </TabsContent>

        <TabsContent value="products" className="space-y-4 mt-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">All Products ({allProducts.length})</h3>
                <Button size="sm"><Plus size={14} className="mr-1" /> Add Product</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.slice(0, 8).map((p) => {
                    const status = p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "Active";
                    const statusColor = p.stock === 0 ? "destructive" : p.stock <= 5 ? "secondary" : "default";
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="text-sm font-medium">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{p.vendorName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(p.price)}</TableCell>
                        <TableCell><span className={p.stock <= 5 ? "text-destructive font-medium" : ""}>{p.stock}</span></TableCell>
                        <TableCell>
                          <Badge variant={statusColor as any} className="capitalize">{status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm"><Settings size={14} /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Recent Orders</h3>
              <div className="text-center py-12 text-muted-foreground">
                <Package size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p>Order management coming soon with backend integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
    </div>
    </div>
  );
}
