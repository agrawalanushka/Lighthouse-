"use client";

import { useState, useRef, useEffect } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import type { RiskScore, PulseItem } from "@/lib/types";
import { Bot, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Message = { role: "user" | "assistant"; content: string };

type MutationArg = {
  allMessages: Message[];
  riskScore: RiskScore | null | undefined;
  pulseItems: PulseItem[] | null | undefined;
};

const SUGGESTIONS = [
  "What does my AI Intervention Score mean?",
  "How is AI changing Software Engineering?",
  "What skills should I focus on this week?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-blue-600" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiError, setApiError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: riskScore } = useQuery<RiskScore | null>({
    queryKey: ["chat-risk"],
    queryFn: async () => {
      const res = await fetch(
        "/api/risk?roleId=frontend-engineer&seniority=junior"
      );
      if (!res.ok) return null;
      const arr: RiskScore[] = await res.json();
      return arr[0] ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: pulseItems } = useQuery<PulseItem[] | null>({
    queryKey: ["chat-pulse"],
    queryFn: async () => {
      const res = await fetch("/api/pulse");
      if (!res.ok) return null;
      const digest = await res.json();
      return [
        ...(digest.generalItems ?? []),
        ...(digest.personalizedItems ?? []),
      ] as PulseItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ allMessages, riskScore: rs, pulseItems: pi }: MutationArg) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          userId: "demo-user",
          riskScore: rs ?? null,
          pulseItems: pi ?? null,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      return data.reply as string;
    },
    onSuccess: (reply) => {
      setApiError(false);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    },
    onError: () => {
      setApiError(true);
    },
  });

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setInput("");
    setApiError(false);
    const userMessage: Message = { role: "user", content: trimmed };
    const next = [...messages, userMessage];
    setMessages(next);
    sendMessage({ allMessages: next, riskScore, pulseItems });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900 text-base leading-tight">Lighthouse AI</h1>
          <p className="text-xs text-gray-500">Your Singapore tech career advisor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isPending && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Bot className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-gray-600 text-sm">Ask me anything about your tech career</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto py-2.5 px-4 text-sm text-gray-700 font-normal justify-start"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {isPending && <TypingIndicator />}

        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              Failed to get a response. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t flex gap-2 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your career, risk score, or tech news…"
          disabled={isPending}
          className="flex-1"
        />
        <Button
          onClick={() => handleSend(input)}
          disabled={isPending || !input.trim()}
          size="icon"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ChatPageWrapper() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ChatPage />
    </QueryClientProvider>
  );
}
