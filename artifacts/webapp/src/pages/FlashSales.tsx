import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Tag, ShoppingCart, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { flashSales as flashSalesApi } from "@workspace/api-client-react";
import { toast } from "sonner";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

function Countdown({ endsAt }: { endsAt: string }) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [endsAt]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <Clock size={14} />
      <span>{String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}</span>
    </div>
  );
}

export function FlashSales({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { addItem } = useCart();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashSales();
  }, []);

  const loadFlashSales = async () => {
    setLoading(true);
    try {
      const res = await flashSalesApi.list();
      const data = (res as any).data ?? res;
      setSales(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load flash sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any, salePrice: number) => {
    addItem({
      productId: product.id.toString(),
      title: product.title || product.name,
      price: salePrice,
      quantity: 1,
      image: product.images?.[0]?.url || product.images?.[0] || "",
      vendorName: product.vendor?.shop_name || product.vendor?.name || "Vendor",
    });
    toast.success("Added to cart!");
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
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Flash Sales</h1>
        </div>
      </motion.div>

      {sales.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Zap size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No active flash sales</h2>
          <p className="text-muted-foreground">Check back soon for amazing deals</p>
          <Button onClick={() => onNavigate("/marketplace")}>Browse Products</Button>
        </motion.div>
      ) : (
        <motion.div className="space-y-6" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {sales.map((sale) => (
              <motion.div key={sale.id} variants={fadeUp}>
                <Card className="border-orange-200 dark:border-orange-900/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Zap size={18} className="text-orange-500" />
                          <h2 className="text-lg font-bold">{sale.title}</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{sale.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className="bg-orange-500 text-white text-sm px-3 py-1">
                          {sale.discountPercentage || sale.discount_percentage}% OFF
                        </Badge>
                        {sale.endsAt || sale.ends_at ? (
                          <Countdown endsAt={sale.endsAt || sale.ends_at} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {(sale.products && sale.products.length > 0) ? (
                    <CardContent className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sale.products.map((sp: any) => {
                        const product = sp.product || sp;
                        const salePrice = sp.salePrice || sp.sale_price || product.price;
                        const originalPrice = product.comparePrice || product.compare_price || product.price;
                        return (
                          <Card key={sp.id} className="border-border/50 overflow-hidden">
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img
                                src={product.images?.[0]?.url || product.images?.[0] || ""}
                                alt={product.title || product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground truncate">{product.title || product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-primary text-sm">{formatPrice(salePrice)}</span>
                                <span className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                              </div>
                              <Button size="sm" className="w-full mt-2 gap-1" onClick={() => handleAddToCart(product, salePrice)}>
                                <ShoppingCart size={12} /> Add to Cart
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  ) : (
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                      No products in this flash sale yet.
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
