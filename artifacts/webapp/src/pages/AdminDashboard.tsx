import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Store, ShoppingBag, DollarSign, AlertTriangle, ShieldCheck,
  BarChart3, Search, ChevronRight, UserCheck, UserX, LayoutDashboard,
  Settings, LogOut, Menu, X, Bell, Package, User, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminStats, formatPrice } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const SIDEBAR_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, isExternal: true },
  { key: "vendors", label: "Vendors", icon: Store },
  { key: "users", label: "Users", icon: Users },
  { key: "disputes", label: "Disputes", icon: ShieldCheck },
  { key: "orders", label: "Orders", icon: Package },
  { key: "vendor-approval", label: "Vendor Approval", icon: UserCheck, isRoute: true },
  { key: "product-moderation", label: "Product Moderation", icon: ShoppingBag, isRoute: true },
  { key: "user-management", label: "User Management", icon: Users, isRoute: true },
  { key: "revenue-dashboard", label: "Revenue", icon: DollarSign, isRoute: true },
  { key: "fraud", label: "Fraud Monitoring", icon: ShieldCheck, isRoute: true },
  { key: "commissions", label: "Commissions", icon: DollarSign, isRoute: true },
  { key: "escrow", label: "Escrow", icon: Package, isRoute: true },
  { key: "payouts", label: "Payouts", icon: DollarSign, isRoute: true },
  { key: "supplier-management", label: "Suppliers", icon: Store, isRoute: true },
  { key: "content-moderation", label: "Content Moderation", icon: ShieldCheck, isRoute: true },
  { key: "global-discounts", label: "Global Discounts", icon: ShoppingBag, isRoute: true },
  { key: "health-dashboard", label: "Health Dashboard", icon: BarChart3, isRoute: true },
];

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const MOCK_VENDORS = [
  { store: "Kicks Hub NG", owner: "Michael Smith", status: "active", revenue: 245000, orders: 128, rating: 4.8, email: "michael@kickshub.ng" },
  { store: "TechMall NG", owner: "Sarah Johnson", status: "active", revenue: 890000, orders: 312, rating: 4.9, email: "sarah@techmall.ng" },
  { store: "GlowUp Beauty", owner: "Amara Obi", status: "active", revenue: 156000, orders: 203, rating: 4.6, email: "amara@glowup.ng" },
  { store: "HomeGoods NG", owner: "John Ade", status: "pending", revenue: 0, orders: 0, rating: 0, email: "john@homegoods.ng" },
  { store: "FitLife Store", owner: "Tunde Bakare", status: "suspended", revenue: 89000, orders: 67, rating: 3.2, email: "tunde@fitlife.ng" },
];

export function AdminDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: adminStats = {} as any } = useAdminStats();

  const maxRev = Math.max(...(adminStats.monthlyRevenue || []), 1);

  const stats = [
    { label: "Total Revenue", value: formatPrice(adminStats.totalRevenue ?? 0), icon: DollarSign, color: "#10B981", change: "+14%" },
    { label: "Active Vendors", value: (adminStats.totalVendors ?? 0).toString(), icon: Store, color: "#5B4EFF", change: "+3" },
    { label: "Total Users", value: (adminStats.totalUsers ?? 0).toLocaleString(), icon: Users, color: "#FF6B35", change: "+2.5%" },
    { label: "Total Orders", value: (adminStats.totalOrders ?? 0).toLocaleString(), icon: ShoppingBag, color: "#8B5CF6", change: "+8%" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("/admin")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">ShopDrop</span>
            </div>
            <button className="lg:hidden p-1 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Sidebar nav */}
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

          {/* Sidebar footer */}
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

        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 gap-3">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold hidden sm:block">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search users, vendors..." className="pl-9 h-9 w-48 lg:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <button className="relative p-2 rounded-md hover:bg-muted">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
              </button>

              <div className="flex items-center gap-2 p-1.5 rounded-lg">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{user?.name || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="disputes">Disputes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}>
                        <s.icon size={20} style={{ color: s.color }} />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">{s.change}</Badge>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="grid sm:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeUp}>
              <Card className="border-border/50 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <Store size={20} className="text-amber-500" />
                  <div className="flex-1">
                    <p className="font-semibold">{adminStats.pendingVendors ?? 0} pending vendors</p>
                    <p className="text-sm text-muted-foreground">Awaiting approval</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="border-border/50 border-red-500/30 bg-red-50/50 dark:bg-red-950/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-destructive" />
                  <div className="flex-1">
                    <p className="font-semibold">{adminStats.activeDisputes ?? 0} active disputes</p>
                    <p className="text-sm text-muted-foreground">Need resolution</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="border-border/50 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <ShoppingBag size={20} className="text-blue-500" />
                  <div className="flex-1">
                    <p className="font-semibold">{adminStats.pendingReturns ?? 0} pending returns</p>
                    <p className="text-sm text-muted-foreground">Awaiting processing</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Revenue Trends</h3>
                  <select className="text-sm bg-background border border-border rounded-lg px-3 py-1.5">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                  </select>
                </div>
                <div className="flex items-end justify-between h-48 gap-2">
                  {(adminStats.monthlyRevenue ?? []).map((rev: number, i: number) => {
                    const h = Math.max(12, (rev / maxRev) * 100);
                    const isLast = i === (adminStats.monthlyRevenue ?? []).length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs text-muted-foreground">{isLast ? `₦${(rev / 1000000).toFixed(1)}M` : ""}</span>
                        <div
                          className="w-full rounded-lg transition-all duration-500"
                          style={{ height: `${h}%`, backgroundColor: isLast ? "hsl(var(--primary))" : "hsl(var(--muted))", minHeight: 8 }}
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
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {(adminStats.recentUsers ?? []).map((u: any, i: number) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.date}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] capitalize">{u.type}</Badge>
                    </motion.div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2">View all users</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Vendor Management</h3>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_VENDORS.map((v) => (
                    <TableRow key={v.store}>
                      <TableCell className="font-medium">{v.store}</TableCell>
                      <TableCell>{v.owner}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === "active" ? "default" : v.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{v.revenue > 0 ? formatPrice(v.revenue) : "—"}</TableCell>
                      <TableCell>{v.orders > 0 ? v.orders : "—"}</TableCell>
                      <TableCell>{v.rating > 0 ? v.rating : "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4 mt-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">All Vendors</h3>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_VENDORS.map((v) => (
                    <TableRow key={v.store}>
                      <TableCell className="font-medium">{v.store}</TableCell>
                      <TableCell>{v.owner}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.email}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === "active" ? "default" : v.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{v.revenue > 0 ? formatPrice(v.revenue) : "—"}</TableCell>
                      <TableCell>{v.orders > 0 ? v.orders : "—"}</TableCell>
                      <TableCell>{v.rating > 0 ? v.rating : "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"><UserCheck size={14} /></Button>
                          <Button variant="ghost" size="sm"><UserX size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">All Users ({(adminStats.totalUsers ?? 0).toLocaleString()})</h3>
              <div className="text-center py-12 text-muted-foreground">
                <Users size={40} className="mx-auto mb-3" />
                <p>User management coming soon with backend integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4 mt-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Active Disputes ({adminStats.activeDisputes ?? 0})</h3>
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck size={40} className="mx-auto mb-3" />
                <p>Dispute management coming soon with backend integration</p>
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
