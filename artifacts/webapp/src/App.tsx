import { useState } from "react";
import { ShoppingBag, Search, Menu, X, ChevronDown, LogOut, Settings, Package, Wallet as WalletIcon, Heart, MessageCircle, Gift, Tag, HelpCircle, Bell, User, Store, BarChart3, TrendingUp, Eye, Crown, Shield, Award, AlertTriangle } from "lucide-react";
import { setBaseUrl } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Marketplace } from "@/pages/Marketplace";
import { ProductDetail } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { VendorDashboard } from "@/pages/VendorDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Wallet } from "@/pages/Wallet";
import { Orders } from "@/pages/Orders";
import { AiChat } from "@/pages/AiChat";
import { Dropshipping } from "@/pages/Dropshipping";
import { AddProduct } from "@/pages/AddProduct";
import { SellerEarnings } from "@/pages/SellerEarnings";
import { FraudDetection } from "@/pages/FraudDetection";
import { CommissionManagement } from "@/pages/CommissionManagement";
import { Escrow } from "@/pages/Escrow";
import { Payouts } from "@/pages/Payouts";
import { VendorOrders } from "@/pages/VendorOrders";
import { Notifications } from "@/pages/Notifications";
import { Help } from "@/pages/Help";
import { Coupons } from "@/pages/Coupons";
import { Wishlist } from "@/pages/Wishlist";
import { Addresses } from "@/pages/Addresses";
import { Disputes } from "@/pages/Disputes";
import { RecentlyViewed } from "@/pages/RecentlyViewed";
import { FlashSales } from "@/pages/FlashSales";
import { ReturnRequests } from "@/pages/ReturnRequests";
import { VendorApproval } from "@/pages/VendorApproval";
import { ProductModeration } from "@/pages/ProductModeration";
import { UserManagement } from "@/pages/UserManagement";
import { RevenueDashboard } from "@/pages/RevenueDashboard";
import { ProductComparison } from "@/pages/ProductComparison";
import { VendorKYC } from "@/pages/VendorKYC";
import { SupplierManagement } from "@/pages/SupplierManagement";
import { SubscriptionPlans } from "@/pages/SubscriptionPlans";
import { ContentModeration } from "@/pages/ContentModeration";
import { GlobalDiscounts } from "@/pages/GlobalDiscounts";
import { HealthDashboard } from "@/pages/HealthDashboard";
import { Referral } from "@/pages/Referral";
import { LoyaltyPoints } from "@/pages/LoyaltyPoints";
import { VendorProfile } from "@/pages/VendorProfile";
import { GuestCheckout } from "@/pages/GuestCheckout";
import { OrderTemplates } from "@/pages/OrderTemplates";
import { LowStockAlerts } from "@/pages/LowStockAlerts";
import { VendorPerformance } from "@/pages/VendorPerformance";
import { DashboardLayout } from "@/components/DashboardLayout";

setBaseUrl((import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8000");

const queryClient = new QueryClient();

type Page =
  | { name: "landing" } | { name: "login" } | { name: "register" }
  | { name: "marketplace" } | { name: "product"; id: string }
  | { name: "cart" } | { name: "vendor" } | { name: "admin" }
  | { name: "wallet" } | { name: "orders" }
  | { name: "ai-chat" } | { name: "notifications" } | { name: "help" }
  | { name: "coupons" } | { name: "wishlist" }
  | { name: "dropshipping" } | { name: "add-product" }
  | { name: "earnings" } | { name: "fraud" }
  | { name: "commissions" } | { name: "escrow" }
  | { name: "payouts" } | { name: "vendor-orders" }
  | { name: "addresses" } | { name: "disputes" }
  | { name: "recently-viewed" } | { name: "flash-sales" }
  | { name: "returns" }
  | { name: "vendor-approval" } | { name: "product-moderation" }
  | { name: "user-management" } | { name: "revenue-dashboard" }
  | { name: "compare"; ids: string[] }
  | { name: "vendor-kyc" } | { name: "supplier-management" }
  | { name: "subscription-plans" } | { name: "content-moderation" }
  | { name: "global-discounts" } | { name: "health-dashboard" }
  | { name: "referral" } | { name: "loyalty-points" } | { name: "vendor-profile" }
  | { name: "guest-checkout" } | { name: "order-templates" } | { name: "low-stock-alerts" } | { name: "vendor-performance" };

function AppContent() {
  const [page, setPage] = useState<Page>(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === "admin") return { name: "admin" };
        if (u.role === "vendor") return { name: "vendor" };
      }
    } catch {}
    return { name: "marketplace" };
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const navigate = (path: string) => {
    if (path === "/login" || path === "/register") {
      const currentPath = page.name === "product" ? `/product/${page.id}` : `/${page.name}`;
      sessionStorage.setItem("login_return_to", currentPath);
    }
    setMobileMenuOpen(false); setUserMenuOpen(false); setMoreMenuOpen(false);
    if (path === "/" || path === "/marketplace") setPage({ name: "marketplace" });
    else if (path === "/landing") setPage({ name: "landing" });
    else if (path === "/login") setPage({ name: "login" });
    else if (path === "/register") setPage({ name: "register" });
    else if (path === "/cart") setPage({ name: "cart" });
    else if (path === "/vendor") setPage({ name: "vendor" });
    else if (path === "/admin") setPage({ name: "admin" });
    else if (path === "/wallet") setPage({ name: "wallet" });
    else if (path === "/orders") setPage({ name: "orders" });
    else if (path === "/ai-chat") setPage({ name: "ai-chat" });
    else if (path === "/notifications") setPage({ name: "notifications" });
    else if (path === "/help") setPage({ name: "help" });
    else if (path === "/coupons") setPage({ name: "coupons" });
    else if (path === "/wishlist") setPage({ name: "wishlist" });
    else if (path === "/dropshipping") setPage({ name: "dropshipping" });
    else if (path === "/add-product") setPage({ name: "add-product" });
    else if (path === "/earnings") setPage({ name: "earnings" });
    else if (path === "/fraud") setPage({ name: "fraud" });
    else if (path === "/commissions") setPage({ name: "commissions" });
    else if (path === "/escrow") setPage({ name: "escrow" });
    else if (path === "/payouts") setPage({ name: "payouts" });
    else if (path === "/vendor-orders") setPage({ name: "vendor-orders" });
    else if (path === "/addresses") setPage({ name: "addresses" });
    else if (path === "/disputes") setPage({ name: "disputes" });
    else if (path === "/recently-viewed") setPage({ name: "recently-viewed" });
    else if (path === "/flash-sales") setPage({ name: "flash-sales" });
    else if (path === "/returns") setPage({ name: "returns" });
    else if (path === "/vendor-approval") setPage({ name: "vendor-approval" });
    else if (path === "/product-moderation") setPage({ name: "product-moderation" });
    else if (path === "/user-management") setPage({ name: "user-management" });
    else if (path === "/revenue-dashboard") setPage({ name: "revenue-dashboard" });
    else if (path.startsWith("/compare?")) {
      const params = new URLSearchParams(path.split("?")[1]);
      const ids = params.getAll("ids").flatMap(v => v.split(",").filter(Boolean));
      setPage({ name: "compare", ids });
    }
    else if (path === "/vendor-kyc") setPage({ name: "vendor-kyc" });
    else if (path === "/supplier-management") setPage({ name: "supplier-management" });
    else if (path === "/subscription-plans") setPage({ name: "subscription-plans" });
    else if (path === "/content-moderation") setPage({ name: "content-moderation" });
    else if (path === "/global-discounts") setPage({ name: "global-discounts" });
    else if (path === "/health-dashboard") setPage({ name: "health-dashboard" });
    else if (path === "/referral") setPage({ name: "referral" });
    else if (path === "/loyalty-points") setPage({ name: "loyalty-points" });
    else if (path === "/vendor-profile") setPage({ name: "vendor-profile" });
    else if (path === "/guest-checkout") setPage({ name: "guest-checkout" });
    else if (path === "/order-templates") setPage({ name: "order-templates" });
    else if (path === "/low-stock-alerts") setPage({ name: "low-stock-alerts" });
    else if (path === "/vendor-performance") setPage({ name: "vendor-performance" });
    else if (path.startsWith("/product/")) setPage({ name: "product", id: path.replace("/product/", "") });
  };

  const renderPage = () => {
    switch (page.name) {
      case "landing": return <Landing onNavigate={navigate} />;
      case "login": return <Login onNavigate={navigate} isRegister={false} />;
      case "register": return <Login onNavigate={navigate} isRegister={true} />;
      case "marketplace": return <Marketplace onNavigate={navigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case "product": return <ProductDetail id={page.id} onNavigate={navigate} />;
      case "cart": return <Cart onNavigate={navigate} />;
      case "compare": return <ProductComparison onNavigate={navigate} initialIds={page.ids} />;
      case "guest-checkout": return <GuestCheckout onNavigate={navigate} />;
      case "vendor": return <VendorDashboard onNavigate={navigate} />;
      case "admin": return <AdminDashboard onNavigate={navigate} />;
      case "wallet": return <Wallet onNavigate={navigate} />;
      case "orders": return <Orders onNavigate={navigate} />;
      case "ai-chat": return <AiChat onNavigate={navigate} />;
      case "notifications": return <Notifications onNavigate={navigate} />;
      case "help": return <Help onNavigate={navigate} />;
      case "coupons": return <Coupons onNavigate={navigate} />;
      case "wishlist": return <Wishlist onNavigate={navigate} />;
      case "dropshipping": return <Dropshipping onNavigate={navigate} />;
      case "add-product": return <AddProduct onNavigate={navigate} />;
      case "earnings": return <SellerEarnings onNavigate={navigate} />;
      case "fraud": return <FraudDetection onNavigate={navigate} />;
      case "commissions": return <CommissionManagement onNavigate={navigate} />;
      case "escrow": return <Escrow onNavigate={navigate} />;
      case "payouts": return <Payouts onNavigate={navigate} />;
      case "vendor-orders": return <VendorOrders onNavigate={navigate} />;
      case "addresses": return <Addresses onNavigate={navigate} />;
      case "disputes": return <Disputes onNavigate={navigate} />;
      case "recently-viewed": return <RecentlyViewed onNavigate={navigate} />;
      case "flash-sales": return <FlashSales onNavigate={navigate} />;
      case "returns": return <ReturnRequests onNavigate={navigate} />;
      case "vendor-approval": return <VendorApproval onNavigate={navigate} />;
      case "product-moderation": return <ProductModeration onNavigate={navigate} />;
      case "user-management": return <UserManagement onNavigate={navigate} />;
      case "revenue-dashboard": return <RevenueDashboard onNavigate={navigate} />;
      case "vendor-kyc": return <VendorKYC onNavigate={navigate} />;
      case "supplier-management": return <SupplierManagement onNavigate={navigate} />;
      case "subscription-plans": return <SubscriptionPlans onNavigate={navigate} />;
      case "content-moderation": return <ContentModeration onNavigate={navigate} />;
      case "global-discounts": return <GlobalDiscounts onNavigate={navigate} />;
      case "health-dashboard": return <HealthDashboard onNavigate={navigate} />;
      case "referral": return <Referral onNavigate={navigate} />;
      case "loyalty-points": return <LoyaltyPoints onNavigate={navigate} />;
      case "vendor-profile": return <VendorProfile onNavigate={navigate} />;
      case "order-templates": return <OrderTemplates onNavigate={navigate} />;
      case "low-stock-alerts": return <LowStockAlerts onNavigate={navigate} />;
      case "vendor-performance": return <VendorPerformance onNavigate={navigate} />;
    }
  };

  const SIDEBAR_PAGES = new Set([
    "wallet", "orders", "ai-chat", "notifications", "help", "coupons", "wishlist",
    "dropshipping", "add-product", "earnings", "fraud", "commissions", "escrow",
    "payouts", "vendor-orders", "addresses", "disputes", "recently-viewed",
    "flash-sales", "returns", "vendor-approval", "product-moderation",
    "user-management", "revenue-dashboard", "vendor-kyc", "supplier-management",
    "subscription-plans", "content-moderation", "global-discounts", "health-dashboard",
    "referral", "loyalty-points", "vendor-profile", "order-templates",
    "low-stock-alerts", "vendor-performance",
  ]);

  const DASHBOARD_PAGES = new Set(["vendor", "admin"]);
  const PUBLIC_PAGES = new Set(["landing", "login", "register", "marketplace", "product", "cart", "compare", "guest-checkout"]);

  const needsSidebar = isAuthenticated && SIDEBAR_PAGES.has(page.name);
  const hasOwnLayout = DASHBOARD_PAGES.has(page.name);
  const isPublic = PUBLIC_PAGES.has(page.name) || !isAuthenticated;

  const isActive = (name: string) => page.name === name;

  const allNav = [
    { label: "Marketplace", icon: ShoppingBag, path: "/marketplace", key: "marketplace" },
    { label: "AI Chat", icon: MessageCircle, path: "/ai-chat", key: "ai-chat" },
    { label: "Orders", icon: Package, path: "/orders", key: "orders" },
    { label: "Wallet", icon: WalletIcon, path: "/wallet", key: "wallet" },
    { label: "Wishlist", icon: Heart, path: "/wishlist", key: "wishlist" },
  ];

  const moreNav = [
    { label: "Coupons", icon: Tag, path: "/coupons", key: "coupons" },
    { label: "Flash Sales", icon: TrendingUp, path: "/flash-sales", key: "flash-sales" },
    { label: "Recently Viewed", icon: Eye, path: "/recently-viewed", key: "recently-viewed" },
    { label: "Subscription Plans", icon: Crown, path: "/subscription-plans", key: "subscription-plans" },
    { label: "Refer & Earn", icon: Gift, path: "/referral", key: "referral" },
    { label: "Loyalty Points", icon: Award, path: "/loyalty-points", key: "loyalty-points" },
    { label: "Order Templates", icon: Package, path: "/order-templates", key: "order-templates" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {(isPublic || hasOwnLayout) && (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate("/marketplace")}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                  <ShoppingBag size={16} className="text-white" />
                </div>
                <span className="font-bold text-xl">ShopDrop</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {allNav.map((item) => (
                <button key={item.key} onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.key) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden"><item.icon size={16} /></span>
                </button>
              ))}
              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted`}>
                  <span className="hidden xl:inline">More</span>
                  <span className="xl:hidden"><ChevronDown size={16} /></span>
                </button>
                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-50 py-1">
                      {moreNav.map((item) => (
                        <button key={item.key} onClick={() => { setMoreMenuOpen(false); navigate(item.path); }}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                            isActive(item.key) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                          }`}>
                          <item.icon size={16} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block max-w-[200px] xl:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && navigate("/marketplace")}
                />
              </div>

              <button onClick={() => navigate("/notifications")} className="relative p-2 rounded-md hover:bg-muted">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
              </button>

              <button onClick={() => navigate("/cart")} className="relative p-2 rounded-md hover:bg-muted">
                <ShoppingBag size={18} className="text-muted-foreground" />
                {totalItems > 0 && <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">{totalItems}</Badge>}
              </button>

              {!isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
                  <Button size="sm" onClick={() => navigate("/register")} className="bg-accent hover:bg-accent/90 text-white">Get Started</Button>
                </div>
              ) : user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown size={14} className="text-muted-foreground hidden lg:block" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-lg z-50 py-1">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                        <button onClick={() => navigate("/orders")} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted"><Package size={16} /> My Orders</button>
                        <button onClick={() => navigate("/wallet")} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted"><WalletIcon size={16} /> Wallet</button>
                        <button onClick={() => navigate("/wishlist")} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted"><Heart size={16} /> Wishlist</button>
                        {user.role === "vendor" && <button onClick={() => navigate("/vendor")} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted"><Store size={16} /> Vendor Dashboard</button>}
                        {user.role === "admin" && <button onClick={() => navigate("/admin")} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted"><BarChart3 size={16} /> Admin Dashboard</button>}
                        <div className="border-t border-border mt-1 pt-1">
                          <button onClick={() => navigate("/help")} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted"><HelpCircle size={16} /> Help Center</button>
                          <button onClick={() => { logout(); navigate("/marketplace"); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted"><LogOut size={16} /> Sign Out</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border py-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {allNav.map((item) => (
                <button key={item.key} onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.key) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                  }`}>
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border my-1 pt-1">
                <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">More</p>
                {moreNav.map((item) => (
                  <button key={item.key} onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive(item.key) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                    }`}>
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
              {!isAuthenticated && (
                <div className="flex gap-2 px-3 pt-2 border-t border-border mt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/login")}>Sign In</Button>
                  <Button size="sm" className="flex-1 bg-accent text-white" onClick={() => navigate("/register")}>Get Started</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      )}

      <main className="overflow-x-hidden">
        {needsSidebar ? (
          <DashboardLayout currentPage={page.name} onNavigate={navigate}>
            {renderPage()}
          </DashboardLayout>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
