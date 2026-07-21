import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Users, ShoppingBag, Package, AlertTriangle, Clock, Server, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { health as healthApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function HealthDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = useCallback(async () => {
    try {
      const res = await healthApi.get();
      const d = (res as any).data ?? res;
      setHealth(d);
    } catch {
      toast.error("Failed to load health metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, [loadHealth]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: health?.totalUsers ?? health?.total_users ?? 0, icon: Users, color: "#5B4EFF" },
    { label: "Total Orders", value: health?.totalOrders ?? health?.total_orders ?? 0, icon: ShoppingBag, color: "#FF6B35" },
    { label: "Total Products", value: health?.totalProducts ?? health?.total_products ?? 0, icon: Package, color: "#8B5CF6" },
    { label: "Pending Disputes", value: health?.pendingDisputes ?? health?.pending_disputes ?? 0, icon: AlertTriangle, color: "#EF4444" },
    { label: "Orders Today", value: health?.ordersToday ?? health?.orders_today ?? 0, icon: Clock, color: "#10B981" },
    { label: "Revenue Today", value: formatPrice(health?.revenueToday ?? health?.revenue_today ?? 0), icon: Activity, color: "#F59E0B" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Health</h1>
          <p className="text-sm text-muted-foreground">Auto-refreshes every 30 seconds</p>
        </div>
        <Badge variant="default" className="gap-1"><Activity size={12} /> Live</Badge>
      </div>

      <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server size={18} /> Server Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Server Time:</span>
            <span className="font-medium">{health?.serverTime ?? health?.server_time ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Database size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Database:</span>
            <span className="font-medium capitalize">{health?.dbStatus ?? health?.db_status ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Server size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">PHP Version:</span>
            <span className="font-medium">{health?.phpVersion ?? health?.php_version ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Activity size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Uptime:</span>
            <span className="font-medium">{health?.uptime ?? health?.uptime ?? "—"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
