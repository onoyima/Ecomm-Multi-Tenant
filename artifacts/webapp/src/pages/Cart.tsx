import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { orders } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function Cart({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { items, totalAmount, removeItem, updateQuantity, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const shipping = totalAmount >= 50000 ? 0 : 2500;
  const grandTotal = totalAmount + shipping;

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await orders.create();
      toast.success("Order placed successfully!");
      clearCart();
      if (res.data?.id) onNavigate(`/order/${res.data.id}`);
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => onNavigate("/marketplace")}
            className="p-2 rounded-md hover:bg-muted"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { clearCart(); toast.info("Cart cleared"); }}>
            <Trash2 size={14} className="mr-1" /> Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div
          className="text-center py-20 space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingCart size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added anything yet</p>
          <Button onClick={() => onNavigate("/marketplace")}>Continue Shopping</Button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2 space-y-4" variants={stagger} initial="initial" animate="animate">
            {items.map((item) => (
              <motion.div key={item.id} variants={fadeUp}>
                <Card className="border-border/50">
                  <CardContent className="flex gap-4 p-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                          {item.variant && <p className="text-xs text-muted-foreground mt-1">{item.variant}</p>}
                        </div>
                        <motion.button
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-muted rounded-l-lg"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={14} />
                          </motion.button>
                          <span className="px-4 text-sm font-medium">{item.quantity}</span>
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-muted rounded-r-lg"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>
                        <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-border/50 sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">Free delivery on orders over ₦50,000</p>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                  <Button className="w-full h-12 gap-2" size="lg" onClick={handleCheckout}>
                    <CreditCard size={18} /> Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => onNavigate("/marketplace")}>
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
