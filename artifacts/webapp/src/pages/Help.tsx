import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, ChevronDown, HelpCircle, Package, CreditCard,
  User, Truck, RotateCcw, Sparkles, Mail, MessageCircle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Orders", icon: Package, color: "#5B4EFF",
    questions: [
      { q: "How do I track my order?", a: "You can track your order from the My Orders page. Click on any order with 'Shipped' status to see tracking information including carrier details and estimated delivery date." },
      { q: "Can I cancel my order?", a: "Orders can be cancelled within 1 hour of placing them if the status is still 'Pending'. Once confirmed or processing, please contact support for assistance." },
      { q: "How long does delivery take?", a: "Standard delivery takes 3-7 business days within Lagos and 5-10 business days to other locations in Nigeria. Express delivery options are available at checkout." },
    ],
  },
  {
    category: "Payments", icon: CreditCard, color: "#10B981",
    questions: [
      { q: "What payment methods are accepted?", a: "We accept Paystack (card payments), bank transfers, wallet payments, and pay on delivery for eligible addresses." },
      { q: "Is my payment information secure?", a: "Yes! All payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your card details." },
      { q: "How do I get a refund?", a: "Refunds are processed within 5-7 business days after the returned item is received. The amount is credited to your ShopDrop wallet." },
    ],
  },
  {
    category: "Account", icon: User, color: "#FF6B35",
    questions: [
      { q: "How do I create an account?", a: "Click 'Get Started' on the homepage and enter your email address. You can sign up as a customer or vendor. Verification is instant for customers." },
      { q: "How do I become a vendor?", a: "Register with your email and select 'Vendor' account type. You'll need to complete KYC verification before you can start selling." },
    ],
  },
  {
    category: "Shipping", icon: Truck, color: "#8B5CF6",
    questions: [
      { q: "What are the shipping costs?", a: "Shipping is free for orders over ₦50,000. For orders below that, a flat rate of ₦2,500 applies within Nigeria." },
      { q: "Do you ship internationally?", a: "Currently, ShopDrop only delivers within Nigeria. International shipping will be available in a future update." },
    ],
  },
  {
    category: "Returns", icon: RotateCcw, color: "#EF4444",
    questions: [
      { q: "What is your return policy?", a: "We offer a 7-day return policy for most items. Products must be unused and in original packaging. Some items like underwear and electronics may not be returnable." },
      { q: "How do I initiate a return?", a: "Go to My Orders, select the item you want to return, and click 'Return Item'. Follow the instructions to print the return label and drop off the package." },
    ],
  },
  {
    category: "AI Features", icon: Sparkles, color: "#F59E0B",
    questions: [
      { q: "What can the AI assistant do?", a: "Our AI shopping assistant can help you find products, compare items, give personalized recommendations based on your preferences, and answer questions about products." },
      { q: "How do I use AI features?", a: "Click the AI Assistant icon in the navigation bar or visit the AI Chat page. You can ask questions in natural language and get instant responses." },
    ],
  },
];

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function Help({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestion = (key: string) => {
    setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFAQs = FAQS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) => !searchQuery || q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Help Center</h1>
      </motion.div>

      <motion.div
        className="relative max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          className="pl-9 h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
        {filteredFAQs.map((cat) => (
          <motion.div key={cat.category} variants={fadeUp}>
            <Card
              className={cn("border-border/50 cursor-pointer transition-all", openCategory === cat.category && "ring-2 ring-primary/20")}
              onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + "15" }}>
                    <cat.icon size={20} style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{cat.category}</p>
                    <p className="text-xs text-muted-foreground">{cat.questions.length} articles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {openCategory && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-semibold text-lg">{openCategory} FAQs</h3>
          {FAQS.find((c) => c.category === openCategory)?.questions.map((faq, i) => {
            const key = `${openCategory}-${i}`;
            const isOpen = openQuestions[key];
            return (
              <motion.div
                key={key}
                className="border border-border/50 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => toggleQuestion(key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn("text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        className="bg-muted/50 rounded-2xl p-6 sm:p-8 text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <HelpCircle size={32} className="mx-auto text-primary" />
        <h2 className="text-xl font-bold">Still need help?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Our support team is available 24/7 to assist you</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button className="gap-2"><Mail size={14} /> Email Support</Button>
          <Button variant="outline" className="gap-2"><MessageCircle size={14} /> Live Chat</Button>
          <Button variant="outline" className="gap-2"><Phone size={14} /> Call Us</Button>
        </div>
      </motion.div>
    </div>
  );
}
