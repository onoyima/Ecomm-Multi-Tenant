import { useState } from "react";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Globe, Smartphone, ThumbsUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Login({ onNavigate, isRegister }: { onNavigate: (path: string) => void; isRegister?: boolean }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email);
      toast.success("Welcome back!");
      onNavigate("/marketplace");
    } catch {
      toast.error("Try customer@demo.com, vendor@demo.com, or admin@demo.com");
    }
  };

  const quickLogin = (demoEmail: string) => {
    login(demoEmail);
    toast.success("Signed in successfully");
    onNavigate("/marketplace");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1040] via-[#3A2FD9] to-[#5B4EFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => onNavigate("/landing")} className="text-white/60 hover:text-white flex items-center gap-1 mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">ShopDrop</span>
            </div>

            <h1 className="text-2xl font-bold mb-1">{isRegister ? "Create Account" : "Welcome back"}</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {isRegister ? "Join Nigeria's AI marketplace" : "Sign in to your ShopDrop account"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-9 pr-9"
                    required
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11">
                {isRegister ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info("Google OAuth coming soon!")}>
                  <Globe size={16} className="text-[#EA4335]" /> Google
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info("Facebook OAuth coming soon!")}>
                  <ThumbsUp size={16} className="text-[#1877F2]" /> Facebook
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info("Apple OAuth coming soon!")}>
                  <Smartphone size={16} /> Apple
                </Button>
              </div>
            </div>

            <Separator className="my-6" />
            <p className="text-xs text-muted-foreground text-center mb-3">Quick Demo Access</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => quickLogin("customer@demo.com")}>
                Customer
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => quickLogin("vendor@demo.com")}>
                Vendor
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => quickLogin("admin@demo.com")}>
                Admin
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => onNavigate(isRegister ? "/login" : "/register")} className="text-primary font-medium hover:underline">
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
