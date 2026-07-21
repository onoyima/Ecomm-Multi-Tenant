import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAiChat } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "Find me trending sneakers under ₦50k",
  "What's the best selling phone today?",
  "Help me compare products",
  "Show my recent order status",
  "Recommend skincare for dry skin",
];

const WELCOME_MSG = "I'm your ShopDrop AI assistant! I can help you find products, compare prices, track orders, and provide personalized recommendations. What can I help you with today?";

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mutateAsync: sendAiMessage, isPending } = useAiChat();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: WELCOME_MSG,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    try {
      const res = await sendAiMessage(text);
      const replyText = (res as any)?.data?.reply ?? (res as any)?.reply ?? "I couldn't process that request. Please try again.";
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallback]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isPending, sendAiMessage]);

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.messageList, { paddingTop: 16 }]}
        ListHeaderComponent={
          messages.length === 1 ? (
            <View style={styles.suggestions}>
              <Text style={[styles.suggestionsTitle, { color: colors.mutedForeground }]}>Try asking...</Text>
              <View style={styles.suggestionPills}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.suggestionPill, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    onPress={() => sendMessage(s)}
                  >
                    <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={
          isPending ? (
            <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                <Feather name="cpu" size={12} color="#fff" />
              </View>
              <View style={styles.typingDots}>
                <Text style={[styles.typingText, { color: colors.mutedForeground }]}>AI is typing...</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === "user"
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}>
            {item.role === "assistant" && (
              <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                <Feather name="cpu" size={12} color="#fff" />
              </View>
            )}
            <View style={item.role === "user" ? styles.userBubbleInner : styles.aiBubbleInner}>
              <Text style={[
                styles.bubbleText,
                { color: item.role === "user" ? "#fff" : colors.foreground },
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.bubbleTime,
                { color: item.role === "user" ? "rgba(255,255,255,0.6)" : colors.mutedForeground },
              ]}>
                {item.timestamp}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Input */}
      <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 8 }]}>
        <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.foreground }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isPending}
        >
          <Feather name="send" size={18} color={input.trim() ? "#fff" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { paddingHorizontal: 16, paddingBottom: 16 },
  suggestions: { marginBottom: 16 },
  suggestionsTitle: { fontSize: 12, marginBottom: 10 },
  suggestionPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestionPill: { borderRadius: 100, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  suggestionText: { fontSize: 12 },
  bubble: { flexDirection: "row", marginBottom: 10, maxWidth: "85%", alignItems: "flex-end", gap: 8 },
  userBubble: { alignSelf: "flex-end", borderRadius: 18, borderBottomRightRadius: 4, padding: 12 },
  aiBubble: {
    alignSelf: "flex-start", borderRadius: 18, borderBottomLeftRadius: 4,
    borderWidth: 1, padding: 12,
  },
  userBubbleInner: {},
  aiBubbleInner: { flex: 1 },
  aiAvatar: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: "center", justifyContent: "center", alignSelf: "flex-end",
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  typingDots: {},
  typingText: { fontSize: 13, fontStyle: "italic" },
  inputArea: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    padding: 10, paddingTop: 10, borderTopWidth: 1,
  },
  inputWrap: {
    flex: 1, borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10, minHeight: 44,
  },
  textInput: { fontSize: 14, maxHeight: 100 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
});
