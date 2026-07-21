import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Package, Users, BarChart3, Wallet,
  Settings, LogOut, Menu, X, Store, ShieldCheck, HelpCircle, LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: "Marketplace", icon: LayoutDashboard, path: "/marketplace" },
  { label: "Categories", icon: Menu, path: "/marketplace" },
  { label: "Cart", icon: ShoppingCart, path: "/cart" },
  { label: "My Orders", icon: Package, path: "/orders" },
  { label: "Wallet", icon: Wallet, path: "/wallet" },
];

const VENDOR_NAV: NavItem[] = [
  { label: "Dashboard", icon: BarChart3, path: "/vendor" },
  { label: "Products", icon: ShoppingBag, path: "/vendor" },
  { label: "Orders", icon: Package, path: "/orders" },
  { label: "Earnings", icon: Wallet, path: "/wallet" },
  { label: "Store Settings", icon: Settings, path: "/vendor" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: BarChart3, path: "/admin" },
  { label: "Vendors", icon: Store, path: "/admin" },
  { label: "Users", icon: Users, path: "/admin" },
  { label: "Disputes", icon: ShieldCheck, path: "/admin" },
  { label: "Analytics", icon: BarChart3, path: "/admin" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function Sidebar({ open, onClose, onNavigate, currentPath }: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = user?.role === "vendor" ? VENDOR_NAV : user?.role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2" onClick={() => onNavigate("/marketplace")} style={{ cursor: "pointer" }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">ShopDrop</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { onNavigate(item.path); onClose(); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  currentPath === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="p-3">
          {user ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Button className="w-full" size="sm" onClick={() => onNavigate("/login")}>
              Sign In
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
