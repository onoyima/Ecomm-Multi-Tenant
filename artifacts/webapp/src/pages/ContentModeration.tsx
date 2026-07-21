import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Check, X, Loader2, MessageSquare, Flag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { admin as adminApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function ContentModeration({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.products.list({ status: "pending" });
      const d = (res as any).data ?? res;
      setProducts(Array.isArray(d) ? d : d.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.products.approve(id);
      toast.success("Product approved");
      loadProducts();
    } catch {
      toast.error("Failed to approve product");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.products.reject(id);
      toast.success("Product rejected");
      loadProducts();
    } catch {
      toast.error("Failed to reject product");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <button onClick={() => onNavigate("/admin")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p className="text-sm text-muted-foreground">Review and moderate platform content</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="products" className="gap-1"><Flag size={14} /> Products ({products.length})</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1"><MessageSquare size={14} /> Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          {products.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-2">
                <Flag size={48} className="mx-auto text-muted-foreground" />
                <p className="font-semibold">No products pending moderation</p>
                <p className="text-sm text-muted-foreground">All products have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
              <AnimatePresence>
                {products.map((p) => (
                  <motion.div key={p.id} variants={fadeUp} layout>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                            {p.images?.[0]?.url || p.images?.[0] ? (
                              <img src={p.images?.[0]?.url || p.images?.[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Eye size={16} /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">{p.title || p.name}</p>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.vendor?.shop_name || p.vendor?.name || "Unknown vendor"}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{p.category || p.category_name}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 gap-1" onClick={() => handleApprove(p.id.toString())}>
                              <Check size={12} /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 gap-1" onClick={() => handleReject(p.id.toString())}>
                              <X size={12} /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center space-y-2">
              <MessageSquare size={48} className="mx-auto text-muted-foreground" />
              <p className="font-semibold">Review Moderation Coming Soon</p>
              <p className="text-sm text-muted-foreground">Review moderation will be available in a future update</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
