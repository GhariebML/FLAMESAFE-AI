"use client";

import React, { useState } from "react";
import { MessageBubble, ChatMessage } from "./MessageBubble";
import { Button } from "@/components/shared/Button";
import { Send, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api/client";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-msg",
    sender: "assistant",
    text: "Hello! I am the FlameSafe Scientific Intelligence Assistant. I provide evidence-grounded answers to research questions on microgravity combustion, spacecraft materials flammability, and fire safety. Every statement is verified against indexed NASA PSI technical publications.",
  },
];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiClient.queryAssistant({
        query: userText,
        max_citations: 3,
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: response.answer,
        citations: response.citations,
        uncertaintyNote: response.scientific_uncertainty_note,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Error retrieving scientific evidence: ${err.message || "Failed to communicate with API service."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] rounded-2xl border border-space-800 bg-space-950/70 backdrop-blur-xl overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
            <Sparkles className="h-4 w-4 text-flame-400 animate-spin" />
            Searching NASA PSI evidence chunks and verifying citations...
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="p-4 border-t border-space-800 bg-space-900/60">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a scientific research question (e.g. 'What are the airflow quench limits in BASS?')..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-flame-500/50"
            disabled={isLoading}
          />
          <Button type="submit" variant="primary" disabled={isLoading || !input.trim()} className="gap-2">
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
