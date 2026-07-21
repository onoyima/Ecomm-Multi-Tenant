import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Star, ShoppingCart, Loader2, BarChart3, Minus, Plus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { products as productsApi } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function ProductComparison({ onNavigate, initialIds }: { onNavigate: (path: string) => void; initialIds?: string[] }) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialIds && initialIds.length > 0) {
      loadInitialProducts();
    }
  }, []);

  const loadInitialProducts = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        initialIds!.map((id) => productsApi.get(id).catch(() => null))
      );
      setProducts(results.filter(Boolean).map((r: any) => r?.data ?? r));
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await productsApi.list({ q: q.trim() });
      const d = (res as any).data ?? res;
      setSearchResults(Array.isArray(d) ? d : d.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const addToComparison = (product: any) => {
    if (products.length >= 4) {
      toast.error("Maximum 4 products can be compared");
      return;
    }
    if (products.find((p) => p.id === product.id)) {
      toast.error("Product already in comparison");
      return;
    }
    setProducts((prev) => [...prev, product]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFromComparison = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id.toString(),
      title: product.title || product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0]?.url || product.images?.[0] || "",
      vendorName: product.vendor?.shop_name || product.vendor?.name || "Vendor",
    });
    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Compare Products</h1>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products to compare..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
        {searching && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-60 overflow-y-auto">
            <CardContent className="p-2 space-y-1">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToComparison(p)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
                >
                  <img
                    src={p.images?.[0]?.url || p.images?.[0] || ""}
                    alt={p.title || p.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title || p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                  </div>
                  <Plus size={14} className="shrink-0 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <BarChart3 size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No products to compare</h2>
          <p className="text-muted-foreground">Search and add at least 2 products to start comparing</p>
        </div>
      ) : products.length === 1 ? (
        <div className="text-center py-12 space-y-2">
          <AlertCircle size={24} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Add at least one more product to compare</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 sticky left-0 bg-card">Attribute</TableHead>
                {products.map((p) => (
                  <TableHead key={p.id} className="min-w-48 text-center">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => removeFromComparison(p.id)} className="p-1 rounded hover:bg-muted">
                        <X size={14} />
                      </button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Image</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <img
                      src={p.images?.[0]?.url || p.images?.[0] || ""}
                      alt={p.title || p.name}
                      className="w-24 h-24 object-cover rounded-lg mx-auto"
                    />
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Name</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center font-semibold">
                    {p.title || p.name}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Price</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="text-xs text-muted-foreground line-through ml-2">{formatPrice(p.comparePrice)}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Rating</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>{p.averageRating ?? p.average_rating ?? "-"}</span>
                      <span className="text-xs text-muted-foreground">({p.reviewCount ?? p.review_count ?? 0})</span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Category</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center text-muted-foreground">
                    {p.category?.name || "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Vendor</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center text-muted-foreground">
                    {p.vendor?.shop_name || p.vendor?.name || "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Stock</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <Badge variant={(p.stockQuantity ?? p.stock_quantity ?? 0) > 0 ? "default" : "destructive"}>
                      {p.stockQuantity ?? p.stock_quantity ?? 0}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Description</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center text-sm text-muted-foreground">
                    <p className="line-clamp-3">{p.shortDescription || p.description || "-"}</p>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-card">Actions</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <Button size="sm" className="gap-1" onClick={() => handleAddToCart(p)}>
                      <ShoppingCart size={12} /> Add to Cart
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
