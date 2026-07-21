import { motion } from "framer-motion";
import { ShoppingBag, Zap, Truck, Shield, ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts, formatPrice } from "@/data/mockData";

const FEATURES = [
  { icon: ShoppingBag, text: "50,000+ verified products", color: "#5B4EFF" },
  { icon: Zap, text: "AI-powered recommendations", color: "#FF6B35" },
  { icon: Truck, text: "Fast delivery across Nigeria", color: "#10B981" },
  { icon: Shield, text: "Secure escrow payments", color: "#F59E0B" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Landing({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { data: products = [] } = useProducts({ perPage: 4 });
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#1A1040] via-[#3A2FD9] to-[#5B4EFF]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.nav
          className="flex items-center justify-between py-4 sm:py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">ShopDrop</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white/80 hover:text-white" onClick={() => onNavigate("/login")}>
              Sign In
            </Button>
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-lg shadow-orange-500/30" onClick={() => onNavigate("/register")}>
              Get Started
            </Button>
          </div>
        </motion.nav>

        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-6" variants={itemVariants}>
            <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 px-3 py-1">
              <Sparkles size={12} className="mr-1" /> AI-Powered Marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Nigeria's{" "}
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB800] bg-clip-text text-transparent">
                AI Marketplace
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-lg">
              Discover, buy, and sell with the power of artificial intelligence.
              Shop from thousands of verified vendors across Nigeria.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-lg shadow-orange-500/30"
                onClick={() => onNavigate("/marketplace")}
              >
                Start Shopping <ArrowRight size={16} className="ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => onNavigate("/marketplace")}
              >
                Browse Products
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="hidden lg:grid grid-cols-2 gap-4"
            variants={itemVariants}
          >
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
              >
                <img src={p.image} alt={p.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                <p className="text-white text-sm font-medium truncate">{p.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                  <span className="text-white/70 text-xs">{p.rating}</span>
                </div>
                <p className="text-[#FFB800] font-bold mt-1">{formatPrice(p.price)}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.text}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: f.color + "20" }}>
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <p className="text-white/80 text-sm font-medium">{f.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
