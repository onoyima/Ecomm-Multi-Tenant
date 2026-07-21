import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Mail, User, Phone, MapPin, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { guestCheckout } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

export function GuestCheckout({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", phone: "", address: "" });

  const handleSubmit = async () => {
    if (!form.email || !form.name) { toast.error("Email and name are required"); return; }
    setLoading(true);
    try {
      await guestCheckout.initiate({ guestEmail: form.email, guestName: form.name, guestPhone: form.phone, shippingAddress: form.address, items: [] });
      setStep("success");
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"><CheckCircle size={40} className="text-green-500" /></div>
        <h1 className="text-2xl font-bold">Order Placed!</h1>
        <p className="text-muted-foreground">Check your email for order confirmation and tracking details.</p>
        <Button onClick={() => onNavigate("/marketplace")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/cart")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Back to Cart
      </button>
      <div className="flex items-center gap-3"><ShoppingBag size={24} /><h1 className="text-xl font-bold">Guest Checkout</h1></div>
      <p className="text-sm text-muted-foreground">No account needed. Your details are only used for this order.</p>
      <Card><CardContent className="p-6 space-y-4">
        <div><label className="text-sm font-medium">Email *</label><div className="relative mt-1"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="pl-9" placeholder="you@example.com" /></div></div>
        <div><label className="text-sm font-medium">Full Name *</label><div className="relative mt-1"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="pl-9" placeholder="John Doe" /></div></div>
        <div><label className="text-sm font-medium">Phone</label><div className="relative mt-1"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="pl-9" placeholder="+234 800 000 0000" /></div></div>
        <div><label className="text-sm font-medium">Shipping Address</label><div className="relative mt-1"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="pl-9" placeholder="123 Main St, Lagos" /></div></div>
        <Button className="w-full gap-2" disabled={loading} onClick={handleSubmit}><CreditCard size={16} />{loading ? "Processing..." : "Place Order"}</Button>
      </CardContent></Card>
    </div>
  );
}
