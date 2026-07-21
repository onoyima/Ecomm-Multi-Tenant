import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Star, Clock, ShoppingCart, Heart, Zap, ArrowRight,
  Search, Filter, ChevronDown, X, Loader2, Eye, Truck, Tag, Copy, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useProducts, useCategories,
  formatPrice, type Product
} from "@/data/mockData";
import { getActiveFlashSales, type FlashSale } from "@/data/flashSales";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
] as const;

function useLocalStorageArray(key: string) {
  const [items, setItems] = useState<string[]>(() => {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; } catch { return []; }
  });
  const update = useCallback((fn: (prev: string[]) => string[]) => {
    setItems((prev) => {
      const next = fn(prev);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);
  return [items, update] as const;
}

function formatSold(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k+ sold";
  return n + "+ sold";
}

function DiscountBadge({ percent }: { percent: number }) {
  if (percent <= 0) return null;
  return (
    <Badge className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground border-0 shadow-lg text-[10px] font-bold px-1 py-0.5 leading-none">
      -{percent}%
    </Badge>
  );
}

function ProductGridCard({
  product, onNavigate, onAddToCart, isWishlisted, onToggleWishlist,
}: {
  product: Product; onNavigate: (path: string) => void; onAddToCart: (p: Product) => void;
  isWishlisted: boolean; onToggleWishlist: (id: string) => void;
}) {
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleClick = () => {
    try {
      const raw = localStorage.getItem("recently_viewed");
      const viewed: string[] = raw ? JSON.parse(raw) : [];
      const updated = [product.id, ...viewed.filter((id) => id !== product.id)].slice(0, 20);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
    } catch { /* ignore */ }
    onNavigate(`/product/${product.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className="relative overflow-hidden aspect-square bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && <DiscountBadge percent={discount} />}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm opacity-0 group-hover:opacity-100"
        >
          <Heart size={11} className={isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"} />
        </button>
        {product.freeShipping && (
          <Badge variant="secondary" className="absolute bottom-1.5 left-1.5 bg-background/80 backdrop-blur-sm text-[9px] border-0 px-1 py-0 leading-none">
            <Truck size={8} className="mr-0.5" /> Free
          </Badge>
        )}
        <Button
          size="sm"
          className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md translate-y-1 group-hover:translate-y-0 h-6 text-[10px] px-1.5"
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        >
          <ShoppingCart size={10} className="mr-0.5" /> Add
        </Button>
      </div>
      <CardContent className="p-2 space-y-0.5">
        <p className="text-[10px] text-muted-foreground truncate leading-none">{product.vendorName}</p>
        <h3 className="font-medium text-[11px] leading-tight line-clamp-2 min-h-[1.8rem]">{product.title}</h3>
        <div className="flex items-center gap-1">
          <Star size={8} className="fill-gold text-gold" />
          <span className="text-[10px] font-medium">{product.rating}</span>
          <span className="text-[10px] text-muted-foreground">{formatSold(product.soldCount)}</span>
        </div>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-xs font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              {discount > 0 && (
                <span className="text-[10px] font-semibold text-accent">-{discount}%</span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CountdownTimer({ endsAt, size = "sm" }: { endsAt: number; size?: "sm" | "lg" }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((endsAt - Date.now()) / 1000)));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (size === "lg") {
    return (
      <div className="flex items-center gap-1 font-mono font-bold tabular-nums">
        {d > 0 && <><span className="bg-background/20 px-1.5 py-0.5 rounded text-base">{d}d</span><span className="text-base">:</span></>}
        <span className="bg-background/20 px-1.5 py-0.5 rounded text-base">{pad(h)}</span>
        <span className="text-base">:</span>
        <span className="bg-background/20 px-1.5 py-0.5 rounded text-base">{pad(m)}</span>
        <span className="text-base">:</span>
        <span className="bg-background/20 px-1.5 py-0.5 rounded text-base">{pad(s)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Clock size={10} className="text-accent" />
      <span className="font-mono text-[10px] font-bold tabular-nums text-accent">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}

function FlashProductCard({
  flashSale, onNavigate, onAddToCart, isWishlisted, onToggleWishlist,
}: {
  flashSale: FlashSale & { product: Product }; onNavigate: (path: string) => void;
  onAddToCart: (p: Product) => void; isWishlisted: boolean; onToggleWishlist: (id: string) => void;
}) {
  const { product, discountPercent, label, endsAt } = flashSale;

  const handleClick = () => {
    try {
      const raw = localStorage.getItem("recently_viewed");
      const viewed: string[] = raw ? JSON.parse(raw) : [];
      const updated = [product.id, ...viewed.filter((id) => id !== product.id)].slice(0, 20);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
    } catch { /* ignore */ }
    onNavigate(`/product/${product.id}`);
  };

  return (
    <div className="flex-shrink-0 w-[190px]">
      <Card
        className="group overflow-hidden border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
        onClick={handleClick}
      >
        <div className="relative overflow-hidden aspect-square bg-muted">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <Badge className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground border-0 shadow-lg text-[10px] font-bold px-1 py-0.5 leading-none">
            -{discountPercent}%
          </Badge>
          <Badge className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground border-0 shadow-lg text-[9px] px-1 py-0 leading-none">
            <Zap size={8} className="mr-0.5" /> {label}
          </Badge>
          <Button
            size="sm"
            className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md h-6 text-[10px] px-1.5"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            <ShoppingCart size={10} className="mr-0.5" /> Add
          </Button>
        </div>
        <CardContent className="p-2 space-y-0.5">
          <h3 className="font-medium text-[11px] leading-tight line-clamp-2 min-h-[1.8rem]">{product.title}</h3>
          <div className="flex items-center gap-1">
            <Star size={8} className="fill-gold text-gold" />
            <span className="text-[10px] font-medium">{product.rating}</span>
            <span className="text-[10px] text-muted-foreground">{formatSold(product.soldCount)}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-accent">{formatPrice(flashSale.salePrice)}</span>
            <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.originalPrice || product.price)}</span>
          </div>
          <CountdownTimer endsAt={endsAt} />
        </CardContent>
      </Card>
    </div>
  );
}

function AutoScrollRow({ children, speed = 30 }: { children: React.ReactNode; speed?: number }) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex gap-2.5"
        animate={isPaused ? { x: "0%" } : { x: ["0%", "-50%"] }}
        transition={isPaused ? {} : { duration: speed, ease: "linear", repeat: Infinity }}
      >
        <div className="flex gap-2.5 shrink-0">
          {children}
        </div>
        <div className="flex gap-2.5 shrink-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

const HERO_SLIDES = [
  { video: "/assets/gif_assets/black_friday_ad.mp4", image: "/assets/black_Friday.png", label: "Black Friday — Up to 70% Off Everything!" },
  { video: "/assets/gif_assets/fresh_grocery_ad.mp4", image: "/assets/food.png", label: "Fresh Groceries Delivered to Your Doorstep" },
  { video: "/assets/gif_assets/toys_ad.mp4", image: "/assets/toys.png", label: "Toy Bonanza — Fun for All Ages!" },
  { video: "/assets/gif_assets/food_delivery_ad.mp4", image: "/assets/burger.png", label: "Gourmet Meals — Order Now & Save 20%" },
  { video: "/assets/gif_assets/futuristic_electronics_ad.mp4", image: "/assets/tech.png", label: "Latest Electronics — Premium Tech Deals" },
  { video: "/assets/gif_assets/electronics_advertise_ad.mp4", image: "/assets/tech.png", label: "Smart Devices — Future Is Here" },
];

function HeroCarousel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [current, setCurrent] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        setLoadedVideos((v) => new Set(v).add(next));
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative rounded-xl overflow-hidden h-[260px] sm:h-[320px] md:h-[380px] group cursor-pointer bg-muted border border-border/30" onClick={() => onNavigate("/marketplace")}>
      {loadedVideos.has(current) ? (
        <video
          key={current}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={slide.video} type="video/mp4" />
        </video>
      ) : (
        <img
          src={slide.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading={current === 0 ? "eager" : "lazy"}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <span className="inline-flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2">
          <Zap size={10} /> Featured
        </span>
        <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-bold drop-shadow-lg max-w-xl">{slide.label}</h2>
        <Button size="sm" className="mt-2 sm:mt-3 bg-white text-foreground hover:bg-white/90 transition-colors shadow-lg text-xs sm:text-sm">
          Shop Now <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); setLoadedVideos((v) => new Set(v).add(i)); }}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function Marketplace({
  onNavigate, searchQuery, onSearchChange,
}: {
  onNavigate: (path: string) => void; searchQuery: string; onSearchChange: (q: string) => void;
}) {
  const { addItem } = useCart();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [visibleCount, setVisibleCount] = useState(24);
  const [wishlist, setWishlist] = useLocalStorageArray("wishlist");
  const [recentlyViewedIds] = useLocalStorageArray("recently_viewed");

  const { data: allProducts = [] } = useProducts({ perPage: 100 });
  const { data: categories = [] } = useCategories();
  const TRENDING_PRODUCTS = allProducts.slice(0, 8);
  const FEATURED_PRODUCTS = allProducts.slice(2, 11);

  const activeFlashSales = getActiveFlashSales(allProducts);

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  const filtered = allProducts
    .filter((p) => !selectedCat || p.category === selectedCat)
    .filter(
      (p) =>
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "popular") return b.soldCount - a.soldCount;
      return 0;
    });

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remainingCount = filtered.length - visibleCount;

  const handleAdd = (p: Product) => {
    addItem({ productId: p.id, title: p.title, price: p.price, quantity: 1, image: p.image, vendorName: p.vendorName });
    toast.success("Added to cart!");
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        toast.success("Removed from wishlist");
        return prev.filter((i) => i !== id);
      }
      toast.success("Added to wishlist!");
      return [id, ...prev];
    });
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 24);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}"!`);
  };

  return (
    <>
      {/* Fixed Left Vertical Ads (screen edge) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-3 w-[130px] pl-2 pointer-events-none">
        <div className="relative rounded-lg overflow-hidden h-[280px] group cursor-pointer bg-muted border border-border/30 pointer-events-auto shadow-md" onClick={() => onNavigate("/marketplace")}>
          <div className="absolute inset-0 w-full h-full">
            <img src="/assets/tech.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/assets/gif_assets/futuristic_electronics_ad.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-flex items-center gap-1 bg-accent/90 text-white text-[8px] font-bold px-1 py-0.5 rounded mb-1">
              <Play size={6} fill="white" /> AD
            </span>
            <p className="text-white text-[10px] font-bold leading-tight">Electronics Up to 50% Off</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden h-[200px] group cursor-pointer bg-muted border border-border/30 pointer-events-auto shadow-md" onClick={() => onNavigate("/marketplace")}>
          <div className="absolute inset-0 w-full h-full">
            <img src="/assets/tech.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/assets/gif_assets/electronics_advertise_ad.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-flex items-center gap-1 bg-accent/90 text-white text-[8px] font-bold px-1 py-0.5 rounded mb-1">
              AD
            </span>
            <p className="text-white text-[10px] font-bold leading-tight">Smart Devices Sale</p>
          </div>
        </div>
      </div>

      {/* Fixed Right Vertical Ads (screen edge) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-3 w-[130px] pr-2 pointer-events-none">
        <div className="relative rounded-lg overflow-hidden h-[280px] group cursor-pointer bg-muted border border-border/30 pointer-events-auto shadow-md" onClick={() => onNavigate("/marketplace")}>
          <div className="absolute inset-0 w-full h-full">
            <img src="/assets/burger.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/assets/gif_assets/food_delivery_ad.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-flex items-center gap-1 bg-accent/90 text-white text-[8px] font-bold px-1 py-0.5 rounded mb-1">
              <Play size={6} fill="white" /> AD
            </span>
            <p className="text-white text-[10px] font-bold leading-tight">Food Delivery — Free Delivery</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden h-[200px] group cursor-pointer bg-muted border border-border/30 pointer-events-auto shadow-md" onClick={() => onNavigate("/marketplace")}>
          <div className="absolute inset-0 w-full h-full">
            <img src="/assets/black_Friday.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/assets/gif_assets/black_friday_ad.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-flex items-center gap-1 bg-accent/90 text-white text-[8px] font-bold px-1 py-0.5 rounded mb-1">
              AD
            </span>
            <p className="text-white text-[10px] font-bold leading-tight">Black Friday Deals</p>
          </div>
        </div>
      </div>

      {/* Main Content — pad for fixed ads on xl+ */}
      <div className="w-full px-2 sm:px-3 lg:px-4 xl:px-[140px] py-4 space-y-5">
      {/* ===== COUPON BANNER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-lg overflow-hidden bg-gradient-to-r from-accent via-accent/90 to-primary/80 p-4 sm:p-5"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Tag size={14} className="text-white" />
              <span className="text-white/80 text-[11px] font-medium uppercase tracking-wide">Limited Offer</span>
            </div>
            <h2 className="text-white text-lg sm:text-xl font-bold">Big Savings Zone</h2>
            <p className="text-white/80 text-xs mt-0.5">Extra discounts on top of already low prices</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["SHOP20", "FREESHIP", "DEALS15"].map((code) => (
              <button
                key={code}
                onClick={() => copyCoupon(code)}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-2.5 py-1 text-white text-xs font-mono font-bold transition-colors"
              >
                {code}
                <Copy size={10} />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== FLASH SALES ===== */}
      {activeFlashSales.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Zap size={14} className="text-accent" />
              </div>
              <h3 className="text-sm font-bold">Flash Sale</h3>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-0 text-[10px] px-1 py-0">
                {activeFlashSales.length} deals
              </Badge>
              {activeFlashSales.length > 0 && (
                <CountdownTimer endsAt={Math.min(...activeFlashSales.map(f => f.endsAt))} size="lg" />
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-accent gap-1 h-7 shrink-0" onClick={() => onNavigate("/marketplace")}>
              View All <ArrowRight size={12} />
            </Button>
          </div>
          <AutoScrollRow speed={35}>
            {activeFlashSales.map((fs) => (
              <FlashProductCard
                key={fs.productId}
                flashSale={fs}
                onNavigate={onNavigate}
                onAddToCart={handleAdd}
                isWishlisted={isWishlisted(fs.product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </AutoScrollRow>
        </motion.div>
      )}

      {/* ===== HERO CAROUSEL (after flash sales) ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <HeroCarousel onNavigate={onNavigate} />
      </motion.div>

      {/* ===== SHOP BY CATEGORY ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <h3 className="text-sm font-bold mb-2">Shop by Category</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {categories.map((c) => {
            const isActive = selectedCat === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(isActive ? null : c.name)}
                className={`relative rounded-lg overflow-hidden aspect-[4/3] group transition-all ${
                  isActive ? "ring-2 ring-primary shadow-sm" : "hover:shadow-sm"
                }`}
              >
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap ${
                  isActive ? "text-accent" : "text-white"
                }`}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ===== RECENTLY VIEWED ===== */}
      {recentlyViewedProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye size={14} className="text-primary" />
            <h3 className="text-sm font-bold">Recently Viewed</h3>
          </div>
          <AutoScrollRow speed={40}>
            {recentlyViewedProducts.slice(0, 10).map((p) => (
              <div
                key={p.id}
                className="flex-shrink-0 w-24 cursor-pointer group"
                onClick={() => onNavigate(`/product/${p.id}`)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
                <p className="text-[10px] font-medium truncate">{p.title}</p>
                <p className="text-[10px] text-primary font-bold">{formatPrice(p.price)}</p>
              </div>
            ))}
          </AutoScrollRow>
        </motion.div>
      )}

      {/* ===== TRENDING NOW (auto-slide) ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-accent" />
            <h3 className="text-sm font-bold">Trending Now</h3>
          </div>
        </div>
        <AutoScrollRow speed={35}>
          {TRENDING_PRODUCTS.map((p) => (
            <div key={p.id} className="flex-shrink-0 w-[155px]">
              <ProductGridCard
                product={p} onNavigate={onNavigate} onAddToCart={handleAdd}
                isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist}
              />
            </div>
          ))}
        </AutoScrollRow>
      </motion.div>

      {/* ===== TODAY'S DEALS ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-destructive" />
            <h3 className="text-sm font-bold">Today's Deals</h3>
            <Badge variant="destructive" className="text-[9px] px-1 py-0 leading-none">Limited</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setVisibleCount(24); }}
                className="text-[11px] bg-background border border-border rounded-lg px-2 py-1 pr-5 appearance-none cursor-pointer hover:border-primary/30 transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5">
          {FEATURED_PRODUCTS.map((p) => (
            <ProductGridCard
              key={p.id} product={p} onNavigate={onNavigate} onAddToCart={handleAdd}
              isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </motion.div>

      {/* ===== MORE TO LOVE ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-primary" />
            <h3 className="text-sm font-bold">More to Love</h3>
            <span className="text-[11px] text-muted-foreground">({filtered.length} items)</span>
          </div>
          {selectedCat && (
            <Button variant="ghost" size="sm" className="text-xs h-6 gap-1" onClick={() => setSelectedCat(null)}>
              <X size={12} /> Clear
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? `No products matching "${searchQuery}".` : "No products in this category yet."}
            </p>
            {(searchQuery || selectedCat) && (
              <Button variant="outline" size="sm" onClick={() => { onSearchChange(""); setSelectedCat(null); }}>
                <X size={14} className="mr-1" /> Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5">
              {visibleProducts.map((p) => (
                <ProductGridCard
                  key={p.id} product={p} onNavigate={onNavigate} onAddToCart={handleAdd}
                  isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-5">
                <Button variant="outline" size="sm" onClick={handleLoadMore} className="gap-2 min-w-[140px]">
                  <Loader2 size={13} /> Load More ({remainingCount} left)
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  </>
  );
}
