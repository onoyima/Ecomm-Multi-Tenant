import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ArrowLeft, Search, ChevronRight, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrders, formatPrice, type Order } from "@/data/mockData";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-0",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0",
  processing: "bg-primary/10 text-primary border-0",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0",
  cancelled: "bg-destructive/10 text-destructive border-0",
};

const STATUS_ICONS: Record<string, any> = {
  pending: Clock, confirmed: CheckCircle, processing: Package,
  shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
};

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function Orders({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: orders = [] } = useOrders();

  const filtered = orders.filter(
    (o) => !searchTerm || o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = ["All", ...new Set(orders.map((o) => o.status))];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">My Orders</h1>
      </motion.div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by order ID..." className="pl-9 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="All">
        <TabsList className="flex-wrap h-auto">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {filtered.filter((o) => tab === "All" || o.status === tab).length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Package size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No orders found</p>
              </motion.div>
            ) : (
              <motion.div className="space-y-4" variants={stagger} initial="initial" animate="animate">
                {filtered.filter((o) => tab === "All" || o.status === tab).map((order) => {
                  const Icon = STATUS_ICONS[order.status];
                  return (
                    <motion.div key={order.id} variants={fadeUp}>
                      <Card className="border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                <img src={order.items[0].image} alt={order.items[0].title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold">{order.id}</p>
                                <p className="text-sm text-muted-foreground">{order.date}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={STATUS_COLORS[order.status]}>
                                    <Icon size={10} className="mr-1" />
                                    {order.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 self-end sm:self-center">
                              <div className="text-right">
                                <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                                <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                              </div>
                              <ChevronRight size={18} className="text-muted-foreground" />
                            </div>
                          </div>
                          {order.trackingNumber && (
                            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                              <Truck size={14} />
                              {order.carrier}: {order.trackingNumber}
                              {order.estimatedDelivery && <> · Est. {order.estimatedDelivery}</>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
