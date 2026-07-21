import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Marketplace } from "@/pages/Marketplace";
import { ProductDetail } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { VendorDashboard } from "@/pages/VendorDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Wallet } from "@/pages/Wallet";
import { Orders } from "@/pages/Orders";
import { Toaster } from "@/components/ui/sonner";

type Page =
  | { name: "landing" }
  | { name: "login" }
  | { name: "register" }
  | { name: "marketplace" }
  | { name: "product"; id: string }
  | { name: "cart" }
  | { name: "vendor" }
  | { name: "admin" }
  | { name: "wallet" }
  | { name: "orders" };

function AppContent() {
  const [page, setPage] = useState<Page>({ name: "landing" });
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = (path: string) => {
    if (path === "/marketplace" || path === "/") setPage({ name: "marketplace" });
    else if (path === "/login") setPage({ name: "login" });
    else if (path === "/register") setPage({ name: "register" });
    else if (path === "/cart") setPage({ name: "cart" });
    else if (path === "/vendor") setPage({ name: "vendor" });
    else if (path === "/admin") setPage({ name: "admin" });
    else if (path === "/wallet") setPage({ name: "wallet" });
    else if (path === "/orders") setPage({ name: "orders" });
    else if (path.startsWith("/product/")) setPage({ name: "product", id: path.replace("/product/", "") });
    else if (path === "/landing") setPage({ name: "landing" });
  };

  const showLayout = page.name !== "landing" && page.name !== "login" && page.name !== "register";

  const renderPage = () => {
    switch (page.name) {
      case "landing": return <Landing onNavigate={navigate} />;
      case "login": return <Login onNavigate={navigate} />;
      case "register": return <Login onNavigate={navigate} isRegister />;
      case "marketplace": return <Marketplace onNavigate={navigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case "product": return <ProductDetail id={page.id} onNavigate={navigate} />;
      case "cart": return <Cart onNavigate={navigate} />;
      case "vendor": return <VendorDashboard onNavigate={navigate} />;
      case "admin": return <AdminDashboard onNavigate={navigate} />;
      case "wallet": return <Wallet onNavigate={navigate} />;
      case "orders": return <Orders onNavigate={navigate} />;
    }
  };

  if (showLayout) {
    return (
      <AppLayout currentPath={"/" + page.name} onNavigate={navigate} onSearch={setSearchQuery}>
        {renderPage()}
      </AppLayout>
    );
  }

  return renderPage();
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
