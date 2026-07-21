import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Star, Package, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vendorPerformance } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

export function VendorPerformance({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorPerformance.list().then(res => {
      const d = (res as any).data ?? res;
      setVendors(Array.isArray(d) ? d : d.data || []);
    }).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
      <div className="flex items-center gap-3"><TrendingUp size={24} /><h1 className="text-xl font-bold">Vendor Performance</h1></div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" /></div>
      ) : vendors.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Award size={32} className="mx-auto mb-2" /><p>No vendor data available</p></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {vendors.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((v, i) => (
            <Card key={v.vendorId || i}><CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">#{i + 1}</div>
              <div className="flex-1"><p className="font-semibold">{v.shopName || v.vendorId}</p><p className="text-xs text-muted-foreground">Score: {v.score ?? 0}/100</p></div>
              <Badge variant={v.score >= 80 ? "default" : v.score >= 50 ? "secondary" : "destructive"}>{v.score >= 80 ? "Top" : v.score >= 50 ? "Good" : "Needs Work"}</Badge>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
