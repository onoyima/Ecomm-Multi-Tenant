import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { orderTemplates, type OrderTemplate } from "@workspace/api-client-react";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

export function OrderTemplates({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    orderTemplates.list().then(res => {
      const d = (res as any).data ?? res;
      setTemplates(Array.isArray(d) ? d : d.data || []);
    }).catch(() => toast.error("Failed to load templates")).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await orderTemplates.create({ name: newName, items: [] });
      toast.success("Template created!");
      setNewName("");
      const res = await orderTemplates.list();
      setTemplates((res as any).data?.data ?? (res as any).data ?? []);
    } catch { toast.error("Failed to create template"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await orderTemplates.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template deleted");
    } catch { toast.error("Failed to delete template"); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/marketplace")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="flex items-center gap-3"><Package size={24} /><h1 className="text-xl font-bold">Order Templates</h1></div>
      <Card><CardContent className="p-6">
        <div className="flex gap-2">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Template name..." className="flex-1" />
          <Button onClick={handleCreate}><Plus size={16} className="mr-1" /> Create</Button>
        </div>
      </CardContent></Card>
      {loading ? (
        <div className="flex items-center justify-center py-12"><span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" /></div>
      ) : templates.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Package size={32} className="mx-auto mb-2" /><p>No templates yet. Create one for quick reordering!</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <Card key={t.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.items?.length ?? 0} items · {formatPrice(t.totalEstimate)}</p></div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onNavigate("/cart")}><ShoppingCart size={14} /></Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 size={14} /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
