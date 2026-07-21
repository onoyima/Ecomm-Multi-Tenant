import { useState, type ReactNode } from "react";
import {
  ShoppingBag, Package, Wallet as WalletIcon, Heart, MessageCircle, Gift, Tag,
  HelpCircle, Bell, User, Store, BarChart3, TrendingUp, Eye, Crown, Award,
  AlertTriangle, Settings, LogOut, Menu, X, ChevronLeft, Clock, CreditCard,
  MapPin, RotateCcw, FileText, Users, Shield, Star, Zap, Percent, Activity,
  Truck, Repeat, ShoppingCart, Plus, DollarSign, LayoutDashboard, Search,
  Briefcase, Handshake, Layers
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface NavItem {
  key: string;
  label: string;
  icon: any;
  path: string;
  badge?: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, path: "/marketplace" },
  { key: "orders", label: "My Orders", icon: Package, path: "/orders" },
  { key: "wallet", label: "Wallet", icon: WalletIcon, path: "/wallet" },
  { key: "wishlist", label: "Wishlist", icon: Heart, path: "/wishlist" },
  { key: "addresses", label: "Addresses", icon: MapPin, path: "/addresses" },
  { key: "ai-chat", label: "AI Chat", icon: MessageCircle, path: "/ai-chat" },
  { key: "notifications", label: "Notifications", icon: Bell, path: "/notifications", roles: [] },
  { key: "coupons", label: "Coupons", icon: Tag, path: "/coupons" },
  { key: "flash-sales", label: "Flash Sales", icon: Zap, path: "/flash-sales" },
  { key: "recently-viewed", label: "Recently Viewed", icon: Eye, path: "/recently-viewed" },
  { key: "order-templates", label: "Order Templates", icon: FileText, path: "/order-templates" },
  { key: "referral", label: "Refer & Earn", icon: Gift, path: "/referral" },
  { key: "loyalty-points", label: "Loyalty Points", icon: Award, path: "/loyalty-points" },
  { key: "subscription-plans", label: "Subscription Plans", icon: Crown, path: "/subscription-plans" },
];

const VENDOR_ITEMS: NavItem[] = [
  { key: "vendor", label: "Vendor Dashboard", icon: LayoutDashboard, path: "/vendor", roles: ["vendor"] },
  { key: "add-product", label: "Add Product", icon: Plus, path: "/add-product", roles: ["vendor"] },
  { key: "dropshipping", label: "Dropshipping", icon: ShoppingCart, path: "/dropshipping", roles: ["vendor"] },
  { key: "earnings", label: "Earnings", icon: DollarSign, path: "/earnings", roles: ["vendor"] },
  { key: "vendor-orders", label: "Vendor Orders", icon: Package, path: "/vendor-orders", roles: ["vendor"] },
  { key: "low-stock-alerts", label: "Stock Alerts", icon: AlertTriangle, path: "/low-stock-alerts", roles: ["vendor"] },
  { key: "vendor-profile", label: "Vendor Profile", icon: Store, path: "/vendor-profile", roles: ["vendor"] },
  { key: "vendor-kyc", label: "KYC Verification", icon: Shield, path: "/vendor-kyc", roles: ["vendor"] },
  { key: "vendor-performance", label: "Performance", icon: TrendingUp, path: "/vendor-performance", roles: ["vendor"] },
];

const ADMIN_ITEMS: NavItem[] = [
  { key: "admin", label: "Admin Dashboard", icon: BarChart3, path: "/admin", roles: ["admin"] },
  { key: "vendor-approval", label: "Vendor Approvals", icon: Shield, path: "/vendor-approval", roles: ["admin"] },
  { key: "product-moderation", label: "Product Moderation", icon: Star, path: "/product-moderation", roles: ["admin"] },
  { key: "user-management", label: "User Management", icon: Users, path: "/user-management", roles: ["admin"] },
  { key: "revenue-dashboard", label: "Revenue Dashboard", icon: TrendingUp, path: "/revenue-dashboard", roles: ["admin"] },
  { key: "fraud", label: "Fraud Detection", icon: AlertTriangle, path: "/fraud", roles: ["admin"] },
  { key: "commissions", label: "Commissions", icon: Percent, path: "/commissions", roles: ["admin"] },
  { key: "escrow", label: "Escrow", icon: Briefcase, path: "/escrow", roles: ["admin"] },
  { key: "payouts", label: "Payouts", icon: CreditCard, path: "/payouts", roles: ["admin"] },
  { key: "supplier-management", label: "Suppliers", icon: Truck, path: "/supplier-management", roles: ["admin"] },
  { key: "content-moderation", label: "Content Moderation", icon: Layers, path: "/content-moderation", roles: ["admin"] },
  { key: "global-discounts", label: "Global Discounts", icon: Percent, path: "/global-discounts", roles: ["admin"] },
  { key: "health-dashboard", label: "Health Dashboard", icon: Activity, path: "/health-dashboard", roles: ["admin"] },
  { key: "returns", label: "Return Requests", icon: RotateCcw, path: "/returns", roles: ["admin"] },
  { key: "disputes", label: "Disputes", icon: Handshake, path: "/disputes", roles: ["admin"] },
];

export function DashboardLayout({
  currentPage,
  onNavigate,
  children,
}: {
  currentPage: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const role = user?.role ?? "customer";

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (item.roles && item.roles.length > 0 && !item.roles.includes(role)) return false;
    return true;
  });

  const vendorItems = role === "vendor" ? VENDOR_ITEMS : [];
  const adminItems = role === "admin" ? ADMIN_ITEMS : [];

  const isActive = (path: string) => {
    const pageName = currentPage;
    return `/${pageName}` === path;
  };

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-card border-r border-border transform transition-all duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("/marketplace")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">ShopDrop</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm mx-auto cursor-pointer" onClick={() => onNavigate("/marketplace")}>
              <ShoppingBag size={16} className="text-white" />
            </div>
          )}
          <button className="lg:hidden p-1 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <button
          className="hidden lg:flex absolute -right-3 top-14 z-50 w-6 h-6 rounded-full bg-card border border-border items-center justify-center hover:bg-muted transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft size={12} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {vendorItems.length > 0 && (
            <>
              {!collapsed && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">Vendor</p>}
              {vendorItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setSidebarOpen(false); onNavigate(item.path); }}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </>
          )}

          {adminItems.length > 0 && (
            <>
              {!collapsed && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-3 pb-1">Admin</p>}
              {adminItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setSidebarOpen(false); onNavigate(item.path); }}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </>
          )}

          {!collapsed && <div className="border-t border-border my-2" />}

          {!collapsed && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-1 pb-1">Quick Links</p>}
          {filteredNav.map((item) => (
            <button
              key={item.key}
              onClick={() => { setSidebarOpen(false); onNavigate(item.path); }}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-2 border-t border-border space-y-0.5 ${collapsed ? "px-1" : ""}`}>
          <button
            onClick={() => { setSidebarOpen(false); onNavigate("/help"); }}
            title={collapsed ? "Help Center" : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${collapsed ? "justify-center px-0" : ""}`}
          >
            <HelpCircle size={18} className="shrink-0" />
            {!collapsed && <span>Help Center</span>}
          </button>
          <button
            onClick={() => { logout(); onNavigate("/marketplace"); }}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors ${collapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-14 px-4 gap-3">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="hidden sm:flex items-center gap-2 relative max-w-xs">
                <Search size={14} className="absolute left-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-muted border-0 rounded-lg focus:ring-2 focus:ring-ring outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) onNavigate("/marketplace");
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate("/notifications")} className="relative p-2 rounded-md hover:bg-muted">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
              </button>
              <button onClick={() => onNavigate("/cart")} className="relative p-2 rounded-md hover:bg-muted">
                <ShoppingBag size={18} className="text-muted-foreground" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">{totalItems}</Badge>
                )}
              </button>
              <div className="flex items-center gap-2 p-1.5 rounded-lg">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
