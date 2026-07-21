import { useState } from "react";
import { Users, Store, ShoppingBag, DollarSign, AlertTriangle, ShieldCheck, BarChart3, CheckCircle, XCircle, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ADMIN_STATS, formatPrice } from "@/data/mockData";

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const maxRev = Math.max(...ADMIN_STATS.monthlyRevenue);

export function AdminDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    { label: "Total Revenue", value: formatPrice(ADMIN_STATS.totalRevenue), icon: DollarSign, color: "#10B981", change: "+14%" },
    { label: "Active Vendors", value: ADMIN_STATS.totalVendors.toString(), icon: Store, color: "#5B4EFF", change: "+3" },
    { label: "Total Users", value: ADMIN_STATS.totalUsers.toLocaleString(), icon: Users, color: "#FF6B35", change: "+2.5%" },
    { label: "Total Orders", value: ADMIN_STATS.totalOrders.toLocaleString(), icon: ShoppingBag, color: "#8B5CF6", change: "+8%" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users, vendors..." className="pl-9 h-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle size={12} /> {ADMIN_STATS.activeDisputes} disputes
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50">
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
        ))}
      </div>

      {/* Pending Alerts */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border/50 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Store size={20} className="text-amber-500" />
            <div className="flex-1">
              <p className="font-semibold">{ADMIN_STATS.pendingVendors} pending vendors</p>
              <p className="text-sm text-muted-foreground">Awaiting approval</p>
            </div>
            <Button size="sm" variant="outline">Review</Button>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-red-500/30 bg-red-50/50 dark:bg-red-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck size={20} className="text-destructive" />
            <div className="flex-1">
              <p className="font-semibold">{ADMIN_STATS.activeDisputes} active disputes</p>
              <p className="text-sm text-muted-foreground">Need resolution</p>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingBag size={20} className="text-blue-500" />
            <div className="flex-1">
              <p className="font-semibold">{ADMIN_STATS.pendingReturns} pending returns</p>
              <p className="text-sm text-muted-foreground">Awaiting processing</p>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart + Recent Users */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
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
              {ADMIN_STATS.monthlyRevenue.map((rev, i) => {
                const h = Math.max(12, (rev / maxRev) * 100);
                const isLast = i === ADMIN_STATS.monthlyRevenue.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{isLast ? `₦${(rev / 1000000).toFixed(1)}M` : ""}</span>
                    <div
                      className="w-full rounded-lg transition-all"
                      style={{ height: `${h}%`, backgroundColor: isLast ? "hsl(var(--primary))" : "hsl(var(--muted))", minHeight: 8 }}
                    />
                    <span className="text-xs text-muted-foreground">{MONTHS[i]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {ADMIN_STATS.recentUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize">{u.type}</Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-2">View all users</Button>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Management Table */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Vendor Management</h3>
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
              {[
                { store: "Kicks Hub NG", owner: "Michael Smith", status: "active", revenue: 245000, orders: 128, rating: 4.8 },
                { store: "TechMall NG", owner: "Sarah Johnson", status: "active", revenue: 890000, orders: 312, rating: 4.9 },
                { store: "GlowUp Beauty", owner: "Amara Obi", status: "active", revenue: 156000, orders: 203, rating: 4.6 },
                { store: "HomeGoods NG", owner: "John Ade", status: "pending", revenue: 0, orders: 0, rating: 0 },
                { store: "FitLife Store", owner: "Tunde Bakare", status: "suspended", revenue: 89000, orders: 67, rating: 3.2 },
              ].map((v) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
