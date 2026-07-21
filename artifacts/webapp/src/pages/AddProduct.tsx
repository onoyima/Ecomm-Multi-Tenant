import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Globe, Tag, DollarSign, Link, Cpu, Download, Camera, Percent, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { vendor, ai, dropshipping } from "@workspace/api-client-react";
import { useCategories, formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const PRODUCT_TYPES = [
  { id: "normal" as const, label: "Normal", icon: Package, desc: "Ship from your own inventory" },
  { id: "dropshipping" as const, label: "Dropshipping", icon: Globe, desc: "Import from supplier URL" },
];

export function AddProduct({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { data: cats = [] } = useCategories();
  const [type, setType] = useState<"normal" | "dropshipping">("normal");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [supplierUrl, setSupplierUrl] = useState("");
  const [markup, setMarkup] = useState("30");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIOptimize = async () => {
    if (!description) { toast.error("Add Description", { description: "Enter a product description to optimize" }); return; }
    setAiLoading(true);
    try {
      const res = await ai.chat({ message: `Optimize this product description for SEO: "${description}"`, context: { type: "product_optimization" } });
      const optimized = (res as any)?.data?.reply ?? (res as any)?.reply ?? description;
      setDescription(optimized);
      toast.success("Description optimized by AI!");
    } catch {
      toast.error("AI optimization unavailable. Try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !price || !category) { toast.error("Missing Fields", { description: "Fill in title, price, and category" }); return; }
    setLoading(true);
    try {
      if (type === "dropshipping" && supplierUrl) {
        await dropshipping.create({ supplierUrl, markup: parseInt(markup) });
      } else {
        await vendor.products.create({
          title,
          price: parseFloat(price),
          stock: parseInt(stock || "0"),
          category_id: category,
          description,
        });
      }
      toast.success("Product submitted for review!");
      onNavigate("/vendor");
    } catch {
      toast.error("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      {/* Product Type */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Product Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`p-4 rounded-xl border-2 text-center space-y-2 transition-colors ${
                  type === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <t.icon size={20} className={type === t.id ? "text-primary mx-auto" : "text-muted-foreground mx-auto"} />
                <p className={`font-semibold text-sm ${type === t.id ? "text-primary" : ""}`}>{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dropshipping URL */}
      {type === "dropshipping" && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-bold">Import from Supplier</h2>
            <div className="relative">
              <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={supplierUrl}
                onChange={(e) => setSupplierUrl(e.target.value)}
                placeholder="https://aliexpress.com/item/..."
                className="pl-9"
              />
            </div>
            <Button variant="secondary" className="w-full">
              <Download size={14} className="mr-1" /> Import & Auto-Fill
            </Button>
            <p className="text-xs text-muted-foreground">AI will automatically extract product details, images, and variants from the supplier URL</p>
          </CardContent>
        </Card>
      )}

      {/* Product Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Product Details</h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product Title *</label>
              <div className="relative mt-1">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product title..." className="pl-9" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Price (₦) *</label>
              <div className="relative mt-1">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 15000" className="pl-9" type="number" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Stock Quantity</label>
              <div className="relative mt-1">
                <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Available stock" className="pl-9" type="number" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category *</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {cats.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.name)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      category === c.name ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <button
                  onClick={handleAIOptimize}
                  disabled={aiLoading}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                >
                  <Cpu size={12} /> {aiLoading ? "Optimizing..." : "AI Optimize"}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product in detail..."
                className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={5}
              />
            </div>

            {/* Markup for dropshipping */}
            {type === "dropshipping" && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Profit Markup (%)</label>
                <div className="relative mt-1">
                  <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={markup} onChange={(e) => setMarkup(e.target.value)} placeholder="30" className="pl-9" type="number" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">AI pricing suggestion: 25-35% markup for this category</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-4">Product Images</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-2 hover:border-primary/50 cursor-pointer transition-colors">
            <Camera size={28} className="mx-auto text-muted-foreground" />
            <p className="font-medium">Add Photos</p>
            <p className="text-xs text-muted-foreground">Up to 8 images</p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="space-y-2">
        <Button className="w-full h-14 text-base" disabled={loading} onClick={handleSave}>
          {loading ? "Submitting for Review..." : "Submit Product"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">Products are reviewed by our team within 24 hours before going live</p>
      </div>
    </div>
  );
}