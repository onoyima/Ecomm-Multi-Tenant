import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Globe, Smartphone, ThumbsUp, ArrowLeft, UserRound, Loader } from "lucide-react";
import { socialAuth } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DEMO_USERS: Record<string, { role: string }> = {
  "customer@demo.com": { role: "customer" },
  "vendor@demo.com": { role: "vendor" },
  "admin@demo.com": { role: "admin" },
};

function getRedirectPath(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "vendor") return "/vendor";
  const saved = sessionStorage.getItem("login_return_to");
  sessionStorage.removeItem("login_return_to");
  return saved || "/marketplace";
}

export function Login({ onNavigate, isRegister }: { onNavigate: (path: string) => void; isRegister?: boolean }) {
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password, "customer");
        toast.success("Account created!");
        onNavigate("/marketplace");
      } else {
        await login(email, password);
        toast.success("Welcome back!");
        const user = DEMO_USERS[email.toLowerCase()] || { role: "customer" };
        onNavigate(getRedirectPath(user.role));
      }
    } catch (err: any) {
      const msg = err?.message || (isRegister ? "Registration failed. Try again." : "Login failed. Check your credentials.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setSubmitting(true);
    try {
      await login(demoEmail);
      toast.success("Signed in successfully");
      const user = DEMO_USERS[demoEmail.toLowerCase()];
      onNavigate(getRedirectPath(user?.role || "customer"));
    } catch {
      toast.error("Login failed. Make sure demo users are seeded.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestCheckout = () => {
    const guest = { id: "guest-" + Date.now(), name: "Guest User", email: "guest@shopdrop.com", role: "customer" as const };
    localStorage.setItem("auth_user", JSON.stringify(guest));
    toast.success("Continuing as guest");
    onNavigate(getRedirectPath("customer"));
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    toast.info("Social login coming soon - OAuth client IDs required");
    setSocialLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1040] via-[#3A2FD9] to-[#5B4EFF] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button onClick={() => onNavigate("/landing")} className="text-white/60 hover:text-white flex items-center gap-1 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
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
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              )}
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
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={submitting}>
                {submitting ? <Loader size={16} className="animate-spin mr-2" /> : null}
                {isRegister ? "Create Account" : "Sign In"}
              </Button>
            </motion.form>

            <motion.div
              className="mt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSocialLogin("google")} disabled={socialLoading === "google"}>
                  {socialLoading === "google" ? <Loader size={16} className="animate-spin" /> : <Globe size={16} className="text-[#EA4335]" />} Google
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSocialLogin("facebook")} disabled={socialLoading === "facebook"}>
                  {socialLoading === "facebook" ? <Loader size={16} className="animate-spin" /> : <ThumbsUp size={16} className="text-[#1877F2]" />} Facebook
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSocialLogin("apple")} disabled={socialLoading === "apple"}>
                  {socialLoading === "apple" ? <Loader size={16} className="animate-spin" /> : <Smartphone size={16} />} Apple
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Separator className="mb-4" />
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
              <Separator className="my-4" />
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-2" onClick={handleGuestCheckout}>
                <UserRound size={14} /> Continue as Guest
              </Button>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => onNavigate(isRegister ? "/login" : "/register")} className="text-primary font-medium hover:underline">
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
