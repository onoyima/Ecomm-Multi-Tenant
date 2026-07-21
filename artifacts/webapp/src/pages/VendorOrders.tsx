import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders, formatPrice } from "@/data/mockData";

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered"];

export function VendorOrders({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [tab, setTab] = useState(0);
  const { data: orders = [] } = useOrders();

  const filtered = orders.filter((o) => {
    if (tab === 0) return true;
    return o.status === TABS[tab].toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${
              tab === i ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <Badge variant={order.status === "delivered" ? "outline" : order.status === "shipped" ? "default" : "secondary"} className="capitalize">
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <img src={order.items[0]?.image} alt={order.items[0]?.title} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.items[0]?.title}</p>
                  <p className="text-sm font-bold mt-0.5">{formatPrice(order.items[0]?.price ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">Qty: {order.items[0]?.qty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center space-y-2">
              <Package size={48} className="mx-auto text-muted-foreground" />
              <p className="font-semibold">No orders</p>
              <p className="text-sm text-muted-foreground">No orders in this category</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}