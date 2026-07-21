import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Store, Search, Check, X, Loader2, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { admin as adminApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_STYLE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function VendorApproval({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.vendors.list();
      const d = (res as any).data ?? res;
      setVendors(Array.isArray(d) ? d : d.data || []);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.vendors.updateStatus(id, { status: "approved" });
      toast.success("Vendor approved");
      loadVendors();
    } catch {
      toast.error("Failed to approve vendor");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.vendors.updateStatus(id, { status: "rejected" });
      toast.success("Vendor rejected");
      loadVendors();
    } catch {
      toast.error("Failed to reject vendor");
    }
  };

  const filtered = vendors.filter((v) =>
    v.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold">Vendor Approvals</h1>
          <p className="text-sm text-muted-foreground">{vendors.length} vendors registered</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <Store size={48} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">No vendors found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((v) => (
                      <motion.tr key={v.id} variants={fadeUp} layout className="border-b border-border">
                        <TableCell className="font-medium">{v.shop_name || v.name}</TableCell>
                        <TableCell className="text-muted-foreground">{v.email}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_STYLE[v.status] || "outline"} className="capitalize">
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span>{v.rating ?? v.average_rating ?? "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{v.productCount ?? v.products_count ?? 0}</TableCell>
                        <TableCell className="text-right">
                          {v.status === "pending" ? (
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 gap-1" onClick={() => handleApprove(v.id.toString())}>
                                <Check size={12} /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 gap-1" onClick={() => handleReject(v.id.toString())}>
                                <X size={12} /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
