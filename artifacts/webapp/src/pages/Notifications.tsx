import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bell, Package, CreditCard, Settings, Megaphone,
  CheckCheck, Trash2, ShoppingBag, Truck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { notifications as notificationsApi } from "@workspace/api-client-react";

const TYPE_ICONS: Record<string, any> = {
  order: Package,
  payment: CreditCard,
  system: Settings,
  promo: Megaphone,
};

const TYPE_COLORS: Record<string, string> = {
  order: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  payment: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  system: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  promo: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function Notifications({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      const data = (res as any).data ?? res;
      setNotifications(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, read_at: new Date().toISOString() })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev: any[]) => prev.map((n: any) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1">
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Bell size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">All caught up!</h2>
          <p className="text-muted-foreground">No new notifications</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-2" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {notifications.map((n: any) => {
              const notifData = n.data || {};
              const type = notifData.type || "system";
              const Icon = TYPE_ICONS[type] || Package;
              const isUnread = !n.read_at;
              return (
                <motion.div
                  key={n.id}
                  variants={fadeUp}
                  layout
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer",
                    isUnread ? "bg-muted/50 hover:bg-muted/80" : "bg-background hover:bg-muted/30"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", TYPE_COLORS[type] || TYPE_COLORS.system)}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("font-medium text-sm", isUnread && "font-semibold")}>{notifData.title || n.type}</p>
                      {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notifData.body || notifData.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
