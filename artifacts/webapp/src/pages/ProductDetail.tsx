import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, ShoppingCart, Heart, Truck, Shield, Clock,
  Minus, Plus, Share2, Check, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProducts, useProduct, formatPrice } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const TRUST_BADGES = [
  { icon: Truck, text: "Free delivery over ₦50,000", color: "text-success" },
  { icon: Shield, text: "Secure payment", color: "text-primary" },
  { icon: Clock, text: "7-day returns", color: "text-accent" },
];

export function ProductDetail({ id, onNavigate }: { id: string; onNavigate: (path: string) => void }) {
  const { addItem } = useCart();
  const { data: product, isLoading } = useProduct(id);
  const { data: relatedFromHook = [] } = useProducts(
    product?.category ? { category: product.category, perPage: 5 } : { perPage: 5 }
  );
  const relatedProducts = relatedFromHook.filter((p) => p.id !== id).slice(0, 4);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlisted, setWishlisted] = useState(() => {
    try { const w = localStorage.getItem("wishlist"); return w ? JSON.parse(w).includes(id) : false; } catch { return false; }
  });
  const [imgZoom, setImgZoom] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading product...</div>
    );
  }

  if (!product) {
    return (
      <motion.div
        className="max-w-7xl mx-auto px-4 py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Package size={36} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">This product may have been removed or is no longer available.</p>
        <Button onClick={() => onNavigate("/marketplace")}>Back to Marketplace</Button>
      </motion.div>
    );
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAdd = () => {
    const variantStr = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ");
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: qty,
      image: product.image,
      vendorName: product.vendorName,
      variant: variantStr || undefined,
    });
    toast.success("Added to cart!");
  };

  const toggleWishlist = () => {
    setWishlisted((v: boolean) => {
      const next = !v;
      try {
        const raw = localStorage.getItem("wishlist");
        const arr: string[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem(
          "wishlist",
          JSON.stringify(next ? [id, ...arr.filter((i) => i !== id)] : arr.filter((i) => i !== id))
        );
      } catch { /* ignore */ }
      toast.success(next ? "Added to wishlist!" : "Removed from wishlist");
      return next;
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, text: product.description });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.button
        onClick={() => onNavigate("/marketplace")}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </motion.button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="aspect-square rounded-2xl overflow-hidden bg-muted cursor-crosshair relative"
            onMouseEnter={() => setImgZoom(true)}
            onMouseLeave={() => setImgZoom(false)}
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: imgZoom ? "scale(1.5)" : "scale(1)" }}
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground border-0 text-sm px-3 py-1 shadow-lg">
                -{discount}% OFF
              </Badge>
            )}
            {product.stock <= 5 && (
              <Badge variant="secondary" className="absolute top-4 right-4 bg-warning/90 text-white border-0 shadow-lg">
                Only {product.stock} left
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.vendorName}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-gold text-gold" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              {product.aiOptimized && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">AI Optimized</Badge>
              )}
              {product.isDropshipping && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-0">Dropshipping</Badge>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
            {discount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Save {formatPrice(product.originalPrice! - product.price)}
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && product.variants.map((v) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-medium mb-2">
                {v.label}: <span className="text-primary">{selectedVariants[v.label] || "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <Button
                    key={opt}
                    variant={selectedVariants[v.label] === opt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.label]: opt }))}
                    className="relative"
                  >
                    {opt}
                    {selectedVariants[v.label] === opt && (
                      <Check size={12} className="ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          ))}

          <Separator />

          {/* Quantity + Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center border border-border rounded-xl">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-muted rounded-l-xl transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="px-6 font-medium min-w-[3rem] text-center tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-3 hover:bg-muted rounded-r-xl transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <Button size="lg" className="flex-1 gap-2" onClick={handleAdd}>
              <ShoppingCart size={18} /> Add to Cart — {formatPrice(product.price * qty)}
            </Button>
            <Button variant="outline" size="lg" onClick={toggleWishlist}>
              <Heart size={18} className={wishlisted ? "fill-destructive text-destructive" : ""} />
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 size={18} />
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {TRUST_BADGES.map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-sm">
                <badge.icon size={16} className={badge.color + " flex-shrink-0"} />
                <span className="text-muted-foreground text-xs leading-tight">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p, i) => (
              <motion.div
                key={p.id}
                className="group cursor-pointer"
                onClick={() => {
                  const raw = localStorage.getItem("recently_viewed");
                  const viewed: string[] = raw ? JSON.parse(raw) : [];
                  const updated = [p.id, ...viewed.filter((id) => id !== p.id)].slice(0, 20);
                  localStorage.setItem("recently_viewed", JSON.stringify(updated));
                  onNavigate(`/product/${p.id}`);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-medium text-sm truncate">{p.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} className="fill-gold text-gold" />
                  <span className="text-xs text-muted-foreground">{p.rating}</span>
                </div>
                <p className="text-primary font-bold mt-1">{formatPrice(p.price)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
