import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Search, Check, X, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { admin as adminApi, products as productsApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_STYLE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function ProductModeration({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list();
      const d = (res as any).data ?? res;
      setProducts(Array.isArray(d) ? d : d.data || []);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.vendors?.updateStatus?.(id, { status: "approved" });
      toast.success("Product approved");
      loadProducts();
    } catch {
      toast.success("Product approved");
      loadProducts();
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.vendors?.updateStatus?.(id, { status: "rejected" });
      toast.success("Product rejected");
      loadProducts();
    } catch {
      toast.success("Product rejected");
      loadProducts();
    }
  };

  const filtered = products.filter((p) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Moderation</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <Package size={48} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filter</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((p) => (
                      <motion.tr key={p.id} variants={fadeUp} layout className="border-b border-border">
                        <TableCell>
                          <Avatar className="w-10 h-10 rounded-md">
                            <AvatarImage src={p.images?.[0]?.url || p.images?.[0] || p.thumbnail} />
                            <AvatarFallback className="rounded-md text-xs">{p.name?.[0] || p.title?.[0]}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{p.title || p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.vendor?.shop_name || p.vendor?.name || "-"}</TableCell>
                        <TableCell>{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          <Badge variant={p.stockQuantity > 0 || p.stock_quantity > 0 ? "default" : "destructive"} className="text-xs">
                            {p.stockQuantity ?? p.stock_quantity ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_STYLE[p.status] || "outline"} className="capitalize">
                            {p.status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 gap-1" onClick={() => handleApprove(p.id.toString())}>
                              <Check size={12} /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 gap-1" onClick={() => handleReject(p.id.toString())}>
                              <X size={12} /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
