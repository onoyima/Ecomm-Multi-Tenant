import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Gift, Percent, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { coupons as couponsApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function Coupons({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await couponsApi.list();
      const data = (res as any).data ?? res;
      setCoupons(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-center">
        <h1 className="text-2xl font-bold mb-4">My Coupons</h1>
        <p>Please login to view your available coupons.</p>
        <Button onClick={() => onNavigate("/login")}>Login</Button>
      </div>
    );
  }

  const activeCoupons = coupons.filter((c) => c.is_active || c.isActive);
  const expiredCoupons = coupons.filter((c) => !(c.is_active || c.isActive));

  const formatDiscount = (coupon: any) => {
    if (coupon.type === "percentage") return `${coupon.value}%`;
    if (coupon.type === "fixed") return `₦${coupon.value.toLocaleString()}`;
    return coupon.value;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">My Coupons</h1>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-20">Loading coupons...</div>
      ) : (
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available">Available ({activeCoupons.length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({expiredCoupons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {activeCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No available coupons</p>
              </div>
            ) : (
              <motion.div className="space-y-4" variants={stagger} initial="initial" animate="animate">
                {activeCoupons.map((coupon) => (
                  <motion.div key={coupon.id} variants={fadeUp}>
                    <Card className="border-border/50 border-primary/20 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 flex flex-col items-center justify-center sm:w-40 shrink-0">
                            <Percent size={24} className="mb-1" />
                            <span className="text-2xl font-bold">{formatDiscount(coupon)}</span>
                            <span className="text-xs text-white/70">OFF</span>
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg font-bold tracking-wider">{coupon.code}</span>
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[10px]">
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{coupon.description || `Min Order: ₦${coupon.minOrderAmount || coupon.min_order_amount || 0}`}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Clock size={12} />
                                  <span>{coupon.expires_at || coupon.expiresAt ? `Expires ${new Date(coupon.expires_at || coupon.expiresAt).toLocaleDateString()}` : "No expiry"}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 gap-1"
                                onClick={() => handleCopy(coupon.code)}
                              >
                                <Copy size={12} /> Copy Code
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="mt-6">
            {expiredCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No expired coupons</p>
              </div>
            ) : (
              <motion.div className="space-y-4" variants={stagger} initial="initial" animate="animate">
                {expiredCoupons.map((coupon) => (
                  <motion.div key={coupon.id} variants={fadeUp}>
                    <Card className="border-border/50 opacity-60">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-muted text-muted-foreground p-6 flex flex-col items-center justify-center sm:w-40 shrink-0">
                            <Percent size={24} className="mb-1" />
                            <span className="text-2xl font-bold">{formatDiscount(coupon)}</span>
                            <span className="text-xs text-muted-foreground/60">OFF</span>
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg font-bold tracking-wider line-through">{coupon.code}</span>
                                  <Badge variant="secondary" className="text-[10px]">Expired</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{coupon.description || `Min Order: ₦${coupon.minOrderAmount || coupon.min_order_amount || 0}`}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Clock size={12} />
                                  <span>{coupon.expires_at || coupon.expiresAt ? `Expired ${new Date(coupon.expires_at || coupon.expiresAt).toLocaleDateString()}` : "Expired"}</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" disabled className="shrink-0 gap-1">
                                <XCircle size={12} /> Expired
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
