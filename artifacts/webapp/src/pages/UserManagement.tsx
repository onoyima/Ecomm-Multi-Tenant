import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Search, ShieldOff, ShieldCheck, Loader2, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { admin as adminApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const ROLE_STYLE: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  vendor: "secondary",
  customer: "outline",
};

export function UserManagement({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.users.list();
      const d = (res as any).data ?? res;
      setUsers(Array.isArray(d) ? d : d.data || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSuspend = async (id: string) => {
    try {
      await adminApi.users.suspend(id);
      toast.success("User suspended");
      loadUsers();
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await adminApi.users.activate(id);
      toast.success("User activated");
      loadUsers();
    } catch {
      toast.error("Failed to activate user");
    }
  };

  const roleTabs = ["all", "customer", "vendor"] as const;

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} users</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <Users size={48} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">No users found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
            <TabsTrigger value="vendor">Vendors</TabsTrigger>
          </TabsList>
          {roleTabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <motion.div variants={stagger} initial="initial" animate="animate">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filtered
                            .filter((u) => tab === "all" || u.role === tab)
                            .map((u) => (
                              <motion.tr key={u.id} variants={fadeUp} layout className="border-b border-border">
                                <TableCell className="font-medium">{u.name}</TableCell>
                                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                <TableCell>
                                  <Badge variant={ROLE_STYLE[u.role] || "outline"} className="capitalize">
                                    {u.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={u.status === "active" || !u.status ? "default" : "destructive"} className="capitalize">
                                    {u.status || "active"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {u.role !== "admin" && (
                                    u.status === "active" || !u.status ? (
                                      <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 gap-1" onClick={() => handleSuspend(u.id.toString())}>
                                        <ShieldOff size={12} /> Suspend
                                      </Button>
                                    ) : (
                                      <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 gap-1" onClick={() => handleActivate(u.id.toString())}>
                                        <ShieldCheck size={12} /> Activate
                                      </Button>
                                    )
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
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
