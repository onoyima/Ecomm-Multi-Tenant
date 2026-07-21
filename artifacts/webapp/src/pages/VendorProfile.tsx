import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Save, ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { vendor, type Vendor } from "@workspace/api-client-react";
import { toast } from "sonner";

export function VendorProfile({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [profile, setProfile] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ businessName: "", description: "", phone: "", address: "" });

  useEffect(() => {
    vendor.getMe().then((res) => {
      setProfile(res.data);
      setForm({
        businessName: res.data.name || "",
        description: res.data.description || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
      });
    }).catch(() => {
      toast.error("Failed to load vendor profile");
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vendor.updateMe(form);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <motion.div className="bg-gradient-to-r from-[#2D1B69] to-[#5B4EFF] rounded-2xl p-6 text-white" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center relative">
            <Store size={28} className="text-white" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center cursor-pointer">
              <Camera size={12} className="text-gray-700" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">{form.businessName || "Vendor Profile"}</h1>
            <p className="text-white/70 text-sm">{profile?.status || "Active"}</p>
          </div>
        </div>
      </motion.div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-bold">Shop Information</h2>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Business Name</label>
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
            </div>
          </div>
          <Button className="w-full gap-2" disabled={saving} onClick={handleSave}>
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
