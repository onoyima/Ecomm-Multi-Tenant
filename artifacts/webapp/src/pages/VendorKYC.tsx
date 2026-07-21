import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Shield, Check, X, Loader2, FileText, Camera, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/mockData";
import { kyc as kycApi } from "@workspace/api-client-react";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function VendorKYC({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState("unverified");
  const [bankVerified, setBankVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [docType, setDocType] = useState("NIN");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kycApi.status();
      const d = (res as any).data ?? res;
      setKycStatus(d.kycStatus || d.kyc_status || "unverified");
      setBankVerified(d.bankVerified || d.bank_verified || false);
    } catch {
      toast.error("Failed to load KYC status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleUpload = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("document_type", docType);
      await kycApi.uploadDocument(formData);
      toast.success("Document uploaded successfully");
      loadStatus();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyBank = async () => {
    if (!bankCode || !accountNumber || !bankName) {
      toast.error("Please fill all bank fields");
      return;
    }
    setSubmitting(true);
    try {
      await kycApi.verifyBank({ bankCode, accountNumber, bankName });
      toast.success("Bank verified successfully");
      setBankVerified(true);
      loadStatus();
    } catch {
      toast.error("Bank verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const statusColor = kycStatus === "verified" ? "default" : kycStatus === "pending" ? "secondary" : "destructive";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <button onClick={() => onNavigate("/vendor")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor KYC</h1>
          <p className="text-sm text-muted-foreground">Verify your identity and bank details</p>
        </div>
        <Badge variant={statusColor} className="capitalize gap-1">
          <Shield size={12} />
          {kycStatus === "verified" ? <Check size={12} /> : kycStatus === "pending" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          {kycStatus}
        </Badge>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText size={18} /> Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["NIN", "BVN", "Passport", "Driver's License"].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={docType === type ? "default" : "outline"}
                    onClick={() => setDocType(type)}
                  >
                    <Camera size={14} className="mr-1" /> {type}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Selected: {docType}</p>
              <Button onClick={handleUpload} disabled={submitting} className="gap-1">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Banknote size={18} /> Bank Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bank Code</label>
                  <Input placeholder="e.g. 044" value={bankCode} onChange={(e) => setBankCode(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Account Number</label>
                  <Input placeholder="10 digits" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bank Name</label>
                  <Input placeholder="e.g. Access Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
              </div>
              {bankVerified ? (
                <Badge variant="default" className="gap-1"><Check size={12} /> Bank Verified</Badge>
              ) : (
                <Button onClick={handleVerifyBank} disabled={submitting} className="gap-1">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  Verify Bank
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
