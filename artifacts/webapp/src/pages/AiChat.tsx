import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ai as aiApi } from "@workspace/api-client-react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What's trending?",
  "Find me a gift under ₦50k",
  "Compare iPhone and Samsung",
  "Best sneakers under ₦100k",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "bot",
    content: "Hi! I'm your AI shopping assistant. I can help you find products, compare items, or give recommendations. What are you looking for today?",
    timestamp: new Date(),
  },
];

export function AiChat({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (role: "user" | "bot", content: string) => {
    const msg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text || isTyping) return;
    setInput("");
    addMessage("user", text);
    setIsTyping(true);
    
    try {
      const response = await aiApi.chat({ message: text });
      const data = (response as any).data ?? response;
      addMessage("bot", data.reply || "I'm sorry, I couldn't process that request right now.");
    } catch (err) {
      console.error("AI chat error:", err);
      addMessage("bot", "I seem to be having trouble connecting to my brain. Please try again later!");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => handleSendMessage(input.trim());
  const handleSuggestion = (suggestion: string) => handleSendMessage(suggestion);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button onClick={() => onNavigate("/marketplace")} className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <h1 className="text-2xl font-bold">AI Shopping Assistant</h1>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-none">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "bot" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 1 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestion(s)}
                className="rounded-full text-xs"
              >
                {s}
              </Button>
            ))}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <motion.div
        className="flex items-center gap-2 pt-4 border-t border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Input
          placeholder="Ask me anything about shopping..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-12 text-sm"
        />
        <Button
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Send size={18} />
        </Button>
      </motion.div>
    </div>
  );
}
