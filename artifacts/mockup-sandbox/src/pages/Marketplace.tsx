import { useState } from "react";
import { Search, TrendingUp, Star, Clock, ShoppingCart, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, PRODUCTS, TRENDING_PRODUCTS, FEATURED_PRODUCTS, formatPrice, type Product } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

function ProductGridCard({ product, onNavigate, onAddToCart }: { product: Product; onNavigate: (path: string) => void; onAddToCart: (p: Product) => void }) {
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onNavigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground border-0">
            -{discount}%
          </Badge>
        )}
        {product.stock <= 5 && (
          <Badge variant="secondary" className="absolute top-3 right-3 bg-warning/90 text-white border-0">
            Only {product.stock} left
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Button
          size="sm"
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        >
          <ShoppingCart size={14} className="mr-1" /> Add
        </Button>
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.vendorName}</p>
        <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">{product.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-gold text-gold" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Marketplace({ onNavigate, searchQuery, onSearchChange }: {
  onNavigate: (path: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const { addItem } = useCart();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");

  const filtered = PRODUCTS
    .filter((p) => !selectedCat || p.category === selectedCat)
    .filter((p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const handleAdd = (p: Product) => {
    addItem({ productId: p.id, title: p.title, price: p.price, quantity: 1, image: p.image, vendorName: p.vendorName });
    toast.success("Added to cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-border/50 p-6 sm:p-10">
        <div className="relative z-10 max-w-xl">
          <Badge className="mb-3 bg-primary/20 text-primary border-0">
            <Zap size={12} className="mr-1" /> Flash Sale
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Elevated Streetwear</h2>
          <p className="text-muted-foreground mb-4">New arrivals. Up to 40% off. Limited time only.</p>
          <Button className="bg-accent hover:bg-accent/90">
            Shop Now <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Shop by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCat === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCat(null)}
          >
            All
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c.id}
              variant={selectedCat === c.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCat(selectedCat === c.name ? null : c.name)}
              style={{ borderColor: selectedCat === c.name ? undefined : c.color + "40" }}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            <h3 className="text-lg font-semibold">Trending Now</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {TRENDING_PRODUCTS.map((p) => (
            <ProductGridCard key={p.id} product={p} onNavigate={onNavigate} onAddToCart={handleAdd} />
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <h3 className="text-lg font-semibold">Featured Products</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-background border border-border rounded-lg px-3 py-1.5"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.slice(0, 10).map((p) => (
            <ProductGridCard key={p.id} product={p} onNavigate={onNavigate} onAddToCart={handleAdd} />
          ))}
        </div>
      </div>

      {/* All Products */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Products ({filtered.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <ProductGridCard key={p.id} product={p} onNavigate={onNavigate} onAddToCart={handleAdd} />
          ))}
        </div>
      </div>
    </div>
  );
}
