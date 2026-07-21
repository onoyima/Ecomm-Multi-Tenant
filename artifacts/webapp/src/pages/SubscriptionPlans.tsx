import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Check, X, Loader2, Star, Zap, TrendingUp, Package, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { subscriptionPlans as plansApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function SubscriptionPlans({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await plansApi.list();
      const d = (res as any).data ?? res;
      setPlans(Array.isArray(d) ? d : d.data || []);
    } catch {
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <button onClick={() => onNavigate("/marketplace")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Marketplace
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose the plan that fits your business</p>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-2">
            <Crown size={48} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">No plans available</p>
            <p className="text-sm text-muted-foreground">Check back later for subscription plans</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="initial" animate="animate">
          {plans.map((plan) => {
            const isRecommended = plan.recommended || plan.is_recommended;
            return (
              <motion.div key={plan.id} variants={fadeUp}>
                <Card className={`relative h-full flex flex-col ${isRecommended ? "border-primary shadow-lg ring-1 ring-primary" : "border-border"}`}>
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Star size={12} /> Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Crown size={20} className={isRecommended ? "text-primary" : "text-muted-foreground"} />
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">?{(plan.monthlyPrice ?? plan.monthly_price ?? 0).toLocaleString()}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground">?{(plan.yearlyPrice ?? plan.yearly_price ?? 0).toLocaleString()}/yr</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap size={14} className="text-muted-foreground" />
                        <span>{plan.commissionRate ?? plan.commission_rate ?? 0}% commission</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package size={14} className="text-muted-foreground" />
                        <span>{plan.maxProducts ?? plan.max_products ?? "Unlimited"} max products</span>
                      </div>
                      {(plan.features ?? []).length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border">
                          {(plan.features ?? []).map((f: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Check size={14} className="text-green-500 shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button className="w-full" variant={isRecommended ? "default" : "outline"}>
                      {isRecommended ? "Get Started" : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
