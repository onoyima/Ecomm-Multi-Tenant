import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { wishlist as wishlistApi } from "@workspace/api-client-react";
import { toast } from "sonner";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// Minimal formatter
const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

export function Wishlist({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await wishlistApi.list();
      const data = (res as any).data ?? res;
      if (Array.isArray(data)) {
        setItems(data.map((i: any) => ({
          itemId: i.id,
          ...i.product
        })));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggle = async (itemId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      return;
    }
    try {
      await wishlistApi.remove(itemId);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = (p: any) => {
    addItem({ 
      productId: p.id.toString(), 
      title: p.title, 
      price: p.price, 
      quantity: 1, 
      image: p.images?.[0] || "", 
      vendorName: p.vendor?.shop_name || "Vendor" 
    });
    toast.success("Added to cart!");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-center">
        <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
        <p>Please login to view your wishlist.</p>
        <Button onClick={() => onNavigate("/login")}>Login</Button>
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
          <h1 className="text-2xl font-bold">My Wishlist ({items.length})</h1>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-20">Loading wishlist...</div>
      ) : items.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Heart size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground">Save items you love to your wishlist</p>
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
                      src={p.images?.[0] || ""}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button
                    onClick={() => toggle(p.itemId)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                  >
                    <Heart size={15} className="fill-destructive text-destructive" />
                  </button>
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{p.vendor?.shop_name || "Unknown Vendor"}</p>
                  <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">{p.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                    {p.original_price && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(p.original_price)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {p.stock > 0 && (
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
