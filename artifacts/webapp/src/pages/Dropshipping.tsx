import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Download, Link, CheckCircle, X, Cpu, Sliders, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { dropshipping } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const SUPPLIERS = ["AliExpress", "CJ Dropshipping", "Alibaba", "1688", "Zendrop"];

const HOW_IT_WORKS = [
  { icon: Link, title: "Paste URL", desc: "Copy the product link from any supported supplier platform." },
  { icon: Cpu, title: "AI Processes", desc: "Our AI validates, rewrites, and SEO-optimizes the listing." },
  { icon: Sliders, title: "Set Your Markup", desc: "Choose your selling price. We show projected profit margin." },
  { icon: Zap, title: "Auto-Fulfillment", desc: "When a customer orders, the supplier is notified automatically." },
];

const LOADING_STEPS = [
  "Fetching product data from supplier…",
  "Running AI validation & optimization…",
  "Generating SEO title & description…",
  "Checking prohibited items list…",
];

export function Dropshipping({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "review" | "published">("input");
  const [markup, setMarkup] = useState("30");
  const [imported, setImported] = useState<{
    id: string; title: string; supplierPrice: number; suggestedMarkup: number; category: string;
    estimatedDelivery: string; supplier: string; aiScore: number; aiNotes: string;
  } | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await dropshipping.create({ supplierUrl: url, markup: parseInt(markup) });
      const d = res.data;
      setImported({
        id: d.id,
        title: "Imported Product",
        supplierPrice: 0,
        suggestedMarkup: 35,
        category: "General",
        estimatedDelivery: "15–25 business days",
        supplier: d.supplierName || "Supplier",
        aiScore: d.aiScore ?? 0,
        aiNotes: d.aiNotes || "AI analysis complete. Review the product details before publishing.",
      });
      setMarkup("35");
      setStep("review");
    } catch {
      toast.error("Failed to import product. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = imported
    ? Math.round(imported.supplierPrice * (1 + parseInt(markup || "0") / 100) / 100) * 100
    : 0;
  const platformFee = imported ? Math.round(finalPrice * 0.1) : 0;
  const vendorProfit = imported ? finalPrice - imported.supplierPrice - platformFee : 0;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <motion.div className="bg-gradient-to-r from-[#2D1B69] to-[#5B4EFF] rounded-2xl p-6 text-white" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dropshipping Import</h1>
            <p className="text-white/70 text-sm">Import & sell without holding inventory</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Imported", value: "12" },
            { label: "Active", value: "9" },
            { label: "Revenue", value: "₦284k" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-white/70 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {step === "published" ? (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Product Published!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your dropshipping product is live on the marketplace. Orders will be automatically forwarded to {imported?.supplier}.
            </p>
            <Button onClick={() => { setStep("input"); setUrl(""); setImported(null); }}>
              <Package size={14} className="mr-1" /> Import Another Product
            </Button>
          </CardContent>
        </Card>
      ) : step === "input" ? (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold">Import from Supplier URL</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Paste a product URL from AliExpress, CJ Dropshipping, or Alibaba. Our AI will extract, optimize, and validate the listing automatically.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste product URL here…"
                    className="pl-9 h-12"
                  />
                  {url && (
                    <button onClick={() => setUrl("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <Button className="w-full h-12" disabled={loading || !url.trim()} onClick={handleImport}>
                {loading ? (
                  <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> AI Processing…</span>
                ) : (
                  <span className="flex items-center gap-2"><Download size={16} /> Import & Analyze</span>
                )}
              </Button>

              {loading && (
                <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
                  {LOADING_STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="animate-spin w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Supported suppliers:</p>
              <div className="flex flex-wrap gap-2">
                {SUPPLIERS.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>

              <h3 className="text-lg font-bold pt-4">How It Works</h3>
              {HOW_IT_WORKS.map((h, i) => (
                <div key={i} className="flex gap-3 items-start pb-4 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <h.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : imported && (
        <>
          <Card className="border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border-[3px] border-green-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-green-500">{imported.aiScore}</span>
                  </div>
                  <span className="text-[10px] text-green-500 mt-1">AI Score</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">AI Analysis Complete</h3>
                  <p className="text-sm text-muted-foreground">{imported.aiNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold">Product Preview</h3>
              <div className="flex items-center gap-4 p-4 border border-border rounded-xl">
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Package size={32} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">{imported.title}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{imported.category}</Badge>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">{imported.estimatedDelivery}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">via {imported.supplier}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold">Set Your Markup</h3>
              <div className="flex gap-2">
                {["10", "20", "30", "40", "50"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarkup(m)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      markup === m
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {m}%
                  </button>
                ))}
              </div>

              <div className="border border-border rounded-xl divide-y divide-border">
                {[
                  { label: "Supplier Cost", value: `₦${imported.supplierPrice.toLocaleString()}`, note: "" },
                  { label: "Your Markup", value: `+₦${(finalPrice - imported.supplierPrice - platformFee).toLocaleString()}`, note: `${markup}%` },
                  { label: "Platform Fee", value: `-₦${platformFee.toLocaleString()}`, note: "10%" },
                  { label: "Selling Price", value: `₦${finalPrice.toLocaleString()}`, note: "", bold: true },
                  { label: "Your Profit", value: `₦${vendorProfit.toLocaleString()}`, note: "per sale", green: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      {row.note && <span className="text-xs text-muted-foreground">{row.note}</span>}
                      <span className={`text-sm ${row.bold ? "text-lg font-bold text-primary" : ""} ${row.green ? "text-lg font-bold text-green-500" : ""}`}>
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep("input"); setImported(null); }}>Back</Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={async () => {
              if (!imported) return;
              try {
                await dropshipping.update(imported.id, { status: "published" });
                setStep("published");
                toast.success("Product published!");
              } catch { toast.error("Failed to publish"); }
            }}>
              <CheckCircle size={16} className="mr-1" /> Publish to Marketplace
            </Button>
          </div>
        </>
      )}
    </div>
  );
}