import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

export function Cart({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { items, totalAmount, removeItem, updateQuantity, clearCart } = useCart();

  const shipping = totalAmount >= 50000 ? 0 : 2500;
  const grandTotal = totalAmount + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { clearCart(); toast.info("Cart cleared"); }}>
            <Trash2 size={14} className="mr-1" /> Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingCart size={36} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added anything yet</p>
          <Button onClick={() => onNavigate("/marketplace")}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="border-border/50">
                <CardContent className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                        {item.variant && <p className="text-xs text-muted-foreground mt-1">{item.variant}</p>}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-muted rounded-l-lg">
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-muted rounded-r-lg">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
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
                <Button className="w-full h-12 gap-2" size="lg">
                  <CreditCard size={18} /> Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onNavigate("/marketplace")}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
