import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Package, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lowStockAlerts, type LowStockAlert } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

export function LowStockAlerts({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await lowStockAlerts.list({ resolved: "0" });
      const d = (res as any).data ?? res;
      setAlerts(Array.isArray(d) ? d : d.data || []);
    } catch { toast.error("Failed to load alerts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string) => {
    try {
      await lowStockAlerts.resolve(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Alert resolved");
    } catch { toast.error("Failed to resolve"); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={14} className="mr-1" /> Refresh</Button>
      </div>
      <div className="flex items-center gap-3"><AlertTriangle size={24} className="text-amber-500" /><h1 className="text-xl font-bold">Low Stock Alerts</h1></div>
      {alerts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200"><CardContent className="p-4 text-amber-800 text-sm">{alerts.length} product{alerts.length > 1 ? "s" : ""} running low on stock</CardContent></Card>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12"><span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" /></div>
      ) : alerts.length === 0 ? (
        <Card><CardContent className="p-12 text-center space-y-2"><CheckCircle size={40} className="mx-auto text-green-500" /><p className="font-semibold">All stocked up!</p><p className="text-sm text-muted-foreground">No low stock alerts at this time</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(a => (
            <Card key={a.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Package size={18} className="text-red-500" /></div>
                <div><p className="font-medium text-sm">Product #{a.productId.slice(0, 8)}</p><p className="text-xs text-muted-foreground">Stock: {a.currentStock} (threshold: {a.threshold})</p></div>
              </div>
              <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleResolve(a.id)}><CheckCircle size={14} className="mr-1" /> Resolve</Button>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
