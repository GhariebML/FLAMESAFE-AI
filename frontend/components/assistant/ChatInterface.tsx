"use client";

import React, { useState } from "react";
import { MessageBubble, ChatMessage } from "./MessageBubble";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { UncertaintyBanner } from "@/components/ui/UncertaintyBanner";
import { Send, Sparkles, Filter } from "lucide-react";
import { apiClient } from "@/lib/api/client";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-msg",
    sender: "assistant",
    text: "Hello! I am the FlameSafe Scientific Intelligence Assistant. I answer microgravity combustion questions strictly from indexed NASA PSI evidence chunks and cite exact DOIs and page numbers. If retrieved evidence is insufficient, I abstain rather than speculate.",
  },
];

const SUGGESTED_QUESTIONS = [
  "What is the airflow quench limit for solid fuels in BASS?",
  "How do microgravity smoke particle sizes compare in SAME?",
  "What are cool flames in n-heptane droplets observed in FLEX?",
  "How did Saffire-I evaluate large-scale spacecraft fire propagation?",
];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [scopeAcronym, setScopeAcronym] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providerTelemetry, setProviderTelemetry] = useState<{
    ai_provider: string;
    model_name: string;
    is_mock_provider?: boolean;
  } | null>(null);

  const submitQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiClient.queryAssistant({
        query: queryText.trim(),
        investigation_id_filter: scopeAcronym || undefined,
        max_citations: 3,
      });

      setProviderTelemetry({
        ai_provider: response.ai_provider,
        model_name: response.model_name,
        is_mock_provider: response.is_mock_provider,
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(input);
  };

  return (
    <div className="space-y-4">
      {providerTelemetry?.is_mock_provider && (
        <UncertaintyBanner
          variant="demo"
          title={`Deterministic Grounded Mock Mode Active (${providerTelemetry.ai_provider})`}
          message="No external LLM API key is active. Responses are synthesized directly from verified NASA PSI evidence chunks using deterministic local grounding."
        />
      )}

      {/* Investigation Scope & Suggested Questions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-space-800 bg-space-900/70">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-plasma-400 shrink-0" />
          <label htmlFor="rag-scope" className="text-slate-400 whitespace-nowrap">
            Retrieval Scope:
          </label>
          <select
            id="rag-scope"
            value={scopeAcronym}
            onChange={(e) => setScopeAcronym(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-space-950 border border-space-800 text-xs text-slate-200"
          >
            <option value="">All NASA Investigations (5 Programs)</option>
            <option value="BASS">BASS — Solid Flammability</option>
            <option value="SAFFIRE">SAFFIRE — Large-Scale Fire Safety</option>
            <option value="FLEX">FLEX — Droplet Cool Flames</option>
            <option value="SAME">SAME — Smoke Particulates</option>
            <option value="ACME">ACME — Gaseous Diffusion Flames</option>
          </select>
        </div>

        {providerTelemetry && (
          <Badge variant={providerTelemetry.is_mock_provider ? "outline" : "success"}>
            {providerTelemetry.ai_provider} · {providerTelemetry.model_name}
          </Badge>
        )}
      </div>

      {/* Suggested Scientific Prompts */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isLoading}
            onClick={() => submitQuery(q)}
            className="px-3 py-1.5 rounded-lg bg-space-900/80 border border-space-800 hover:border-blue-500/40 text-[11px] text-slate-300 hover:text-blue-200 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Conversation Window */}
      <div className="flex flex-col h-[580px] rounded-2xl border border-space-800 bg-space-950/80 backdrop-blur-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
              <Sparkles className="h-4 w-4 text-plasma-400 animate-spin" />
              Retrieving NASA PSI evidence chunks and validating DOI citations...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-space-800 bg-space-900/70">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a research question grounded in NASA combustion data..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !input.trim()}
              className="gap-2 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
