import { useState } from "react";
import { Menu, ShoppingCart, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearch?: (query: string) => void;
}

export function AppLayout({ children, currentPath, onNavigate, onSearch }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={onNavigate} currentPath={currentPath} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-muted">
                <Menu size={20} />
              </button>
              <form onSubmit={handleSearch} className="hidden sm:flex relative w-full max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search 50,000+ products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full"
                />
              </form>
            </div>

            <div className="flex items-center gap-2">
              {!user ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("/login")}>Sign In</Button>
                  <Button size="sm" onClick={() => onNavigate("/register")}>Get Started</Button>
                </>
              ) : (
                <>
                  <button onClick={() => onNavigate("/cart")} className="relative p-2 rounded-md hover:bg-muted">
                    <ShoppingCart size={20} className="text-muted-foreground" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                  </button>
                  <button className="p-2 rounded-md hover:bg-muted relative">
                    <Bell size={20} className="text-muted-foreground" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                  </button>
                  <Avatar
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => {
                      if (user.role === "vendor") onNavigate("/vendor");
                      else if (user.role === "admin") onNavigate("/admin");
                      else onNavigate("/marketplace");
                    }}
                  >
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
