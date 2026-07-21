import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { recentlyViewed as recentlyViewedApi } from "@workspace/api-client-react";
import { toast } from "sonner";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

export function RecentlyViewed({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { addItem } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    setLoading(true);
    try {
      const res = await recentlyViewedApi.list();
      const data = (res as any).data ?? res;
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load recently viewed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (p: any) => {
    addItem({
      productId: p.id.toString(),
      title: p.title || p.name,
      price: p.price,
      quantity: 1,
      image: p.images?.[0]?.url || p.images?.[0] || p.thumbnail || "",
      vendorName: p.vendor?.shop_name || p.vendor?.name || "Vendor",
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
          <h1 className="text-2xl font-bold">Recently Viewed ({items.length})</h1>
        </div>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Eye size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No recently viewed items</h2>
          <p className="text-muted-foreground">Start browsing to see products here</p>
          <Button onClick={() => onNavigate("/marketplace")}>Start Shopping</Button>
        </motion.div>
      ) : (
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
          {items.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <Card className="group border-border/50 hover:border-primary/30 transition-all overflow-hidden">
                <div className="relative">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.images?.[0]?.url || p.images?.[0] || p.thumbnail || ""}
                      alt={p.title || p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {(p.stock === 0 || p.stockQuantity === 0) && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{p.vendor?.shop_name || p.vendor?.name || "Vendor"}</p>
                  <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">{p.title || p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                    {p.comparePrice || p.compare_price ? (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(p.comparePrice || p.compare_price)}</span>
                    ) : null}
                  </div>
                  {p.averageRating ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-xs">{"★".repeat(Math.round(p.averageRating))}</span>
                      <span className="text-xs text-muted-foreground">({p.reviewCount || 0})</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 mt-3">
                    {(p.stock ?? p.stockQuantity ?? 1) > 0 && (
                      <Button size="sm" className="flex-1 gap-1" onClick={() => handleAddToCart(p)}>
                        <ShoppingCart size={14} /> Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
