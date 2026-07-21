import { useState } from "react";
import { ArrowLeft, Star, ShoppingCart, Heart, Truck, Shield, Clock, Minus, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export function ProductDetail({ id, onNavigate }: { id: string; onNavigate: (path: string) => void }) {
  const { addItem } = useCart();
  const product = PRODUCTS.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlisted, setWishlisted] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <Button onClick={() => onNavigate("/marketplace")}>Back to Marketplace</Button>
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const relatedProducts = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    const variantStr = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ");
    addItem({
      productId: product.id, title: product.title, price: product.price,
      quantity: qty, image: product.image, vendorName: product.vendorName,
      variant: variantStr || undefined,
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button onClick={() => onNavigate("/marketplace")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {discount > 0 && (
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground border-0 text-sm px-3 py-1">
              -{discount}% OFF
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.vendorName}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-gold text-gold" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              {product.aiOptimized && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  AI Optimized
                </Badge>
              )}
              {product.isDropshipping && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
                  Dropshipping
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
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
            <div key={v.label}>
              <p className="text-sm font-medium mb-2">{v.label}: <span className="text-primary">{selectedVariants[v.label] || "Select"}</span></p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <Button
                    key={opt}
                    variant={selectedVariants[v.label] === opt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.label]: opt }))}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <Separator />

          {/* Quantity + Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-border rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-muted rounded-l-xl">
                <Minus size={16} />
              </button>
              <span className="px-6 font-medium min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-muted rounded-r-xl">
                <Plus size={16} />
              </button>
            </div>
            <Button size="lg" className="flex-1 gap-2" onClick={handleAdd}>
              <ShoppingCart size={18} /> Add to Cart — {formatPrice(product.price * qty)}
            </Button>
            <Button variant="outline" size="lg" onClick={() => { setWishlisted((v) => !v); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}>
              <Heart size={18} className={wishlisted ? "fill-destructive text-destructive" : ""} />
            </Button>
            <Button variant="outline" size="lg"><Share2 size={18} /></Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <Truck size={16} className="text-success" /> Free delivery over ₦50k
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield size={16} className="text-primary" /> Secure payment
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-accent" /> 7-day returns
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group cursor-pointer" onClick={() => onNavigate(`/product/${p.id}`)}>
                <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="font-medium text-sm truncate">{p.title}</p>
                <p className="text-primary font-bold">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
