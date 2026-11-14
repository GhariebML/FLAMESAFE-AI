"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  Send,
  Sparkles,
  BookOpenCheck,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Maximize2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { CitationItem } from "@/types/assistant";
import type { AIRuntimeStatus } from "@/types/research";

interface CompanionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationItem[];
  confidence?: string;
  limitations?: string | null;
  followUps?: string[];
  error?: boolean;
  failedPrompt?: string;
}

const SUGGESTED_PROMPTS = [
  "How do flames behave in microgravity?",
  "Compare BASS and SAFFIRE.",
  "What is a cool flame in FLEX?",
  "How does oxygen affect spacecraft fire risk?",
  "Show research gaps in lunar gravity.",
  "How does this research help Earth?",
];

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export const AstroFlameCompanion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIRuntimeStatus | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getAIStatus(false)
      .then((res) => {
        if (mounted) setAiStatus(res);
      })
      .catch(() => {
        if (mounted) setAiStatus(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("flamesafe:open-companion", handleOpenEvent);
    return () => window.removeEventListener("flamesafe:open-companion", handleOpenEvent);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || loading) return;

    const userMsg: CompanionMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const res = await apiClient.queryAssistant({ query: text, max_citations: 3 });
      const assistantMsg: CompanionMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: res.answer,
        citations: res.citations || [],
        confidence: res.has_sufficient_evidence ? "Grounded" : "Limited Coverage",
        limitations: res.scientific_uncertainty_note,
        followUps: SUGGESTED_PROMPTS.filter((p) => p !== text).slice(0, 2),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errText = err?.message || "Service unreachable";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Unable to complete the scientific query (${errText}). Verify the backend service is reachable and retry.`,
          error: true,
          failedPrompt: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleCitations = (id: string) => {
    setExpandedCitations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isLiveGemini = Boolean(
    aiStatus && aiStatus.configured && aiStatus.connected && !aiStatus.is_mock_provider
  );

  return (
    <>
      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="Astro-Flame Space Fire Research Companion"
          className="fixed z-50 inset-x-3 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[410px] max-h-[80vh] sm:max-h-[600px] flex flex-col rounded-2xl bg-[#10151D]/98 border border-[#283340] shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_28px_rgba(57,185,235,0.16)] backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-[#151D27] border-b border-[#283340]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 rounded-full border border-[#39B9EB]/60 bg-[#080A0F] overflow-hidden shrink-0 shadow-[0_0_14px_rgba(255,107,36,0.35)]">
                <img
                  src="/images/story/mascot-avatar.png"
                  alt="Astro-Flame Companion"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#10151D] ${
                    isLiveGemini ? "bg-[#22C55E]" : "bg-[#FFB547]"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#F7F7F5] truncate">Astro-Flame</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B24]/15 border border-[#FF6B24]/40 px-2 py-0.5 text-[10px] font-semibold text-[#FFB547]">
                    {isLiveGemini ? "Live RAG" : "PSI Corpus"}
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A8B3] truncate">
                  Space Fire Research Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg text-[#A1A8B3] hover:text-[#F7F7F5] hover:bg-[#1C2633] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                title="Open full Assistant workspace"
                aria-label="Open full Assistant workspace"
                className="p-1.5 rounded-lg text-[#A1A8B3] hover:text-[#39B9EB] hover:bg-[#1C2633] transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Astro-Flame"
                aria-label="Close Astro-Flame"
                className="p-1.5 rounded-lg text-[#A1A8B3] hover:text-[#F7F7F5] hover:bg-[#1C2633] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Scroll Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[280px] max-h-[420px]">
            {/* Welcome Card */}
            <div className="rounded-xl bg-[#151D27] border border-[#283340] p-3.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#FF6B24] shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-[#F7F7F5]">
                  Hello, Researcher! I&apos;m <strong className="text-[#FFB547]">Astro-Flame</strong>.
                  What would you like to discover about combustion in space?
                </p>
              </div>

              {messages.length === 0 && (
                <div className="mt-3 pt-3 border-t border-[#283340]/80">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#778495] mb-2">
                    Suggested Scientific Queries
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        disabled={loading}
                        className="text-left text-[11px] leading-snug px-2.5 py-1.5 rounded-lg bg-[#10151D] hover:bg-[#1C2633] text-[#A1A8B3] hover:text-[#F7F7F5] border border-[#283340] hover:border-[#39B9EB]/50 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message Thread */}
            {messages.map((msg) => {
              const rtl = isArabicText(msg.content);
              const showCites = expandedCitations[msg.id] ?? false;

              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      dir={rtl ? "rtl" : "ltr"}
                      className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-[#FF6B24] to-[#E94B16] text-white keep-white px-3.5 py-2.5 text-xs leading-relaxed shadow-sm"
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="space-y-2">
                  <div
                    dir={rtl ? "rtl" : "ltr"}
                    className={`rounded-2xl rounded-tl-sm p-3.5 text-xs leading-relaxed border ${
                      msg.error
                        ? "bg-[#EF4444]/10 border-[#EF4444]/40 text-[#F7F7F5]"
                        : "bg-[#151D27] border-[#283340] text-[#F7F7F5]"
                    }`}
                  >
                    {msg.error && (
                      <div className="flex items-center gap-1.5 text-[#EF4444] font-semibold mb-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Connection Notice</span>
                      </div>
                    )}
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {msg.limitations && (
                      <div className="mt-2.5 rounded-lg bg-[#10151D] border border-[#283340] p-2 text-[11px] text-[#FFB547]">
                        {msg.limitations}
                      </div>
                    )}

                    {/* Action Row: Confidence + Citations Toggle + Copy / Retry */}
                    <div
                      dir="ltr"
                      className="mt-3 pt-2.5 border-t border-[#283340] flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5">
                        {msg.confidence && (
                          <span className="rounded-md bg-[#10151D] border border-[#283340] px-2 py-0.5 text-[10px] font-mono text-[#39B9EB]">
                            {msg.confidence}
                          </span>
                        )}
                        {msg.citations && msg.citations.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCitations(msg.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-[#006EDB]/15 border border-[#39B9EB]/40 px-2 py-0.5 text-[10px] font-semibold text-[#39B9EB] hover:bg-[#006EDB]/25 transition-colors"
                          >
                            <BookOpenCheck className="h-3 w-3" />
                            <span>{msg.citations.length} Sources</span>
                            {showCites ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {msg.error && msg.failedPrompt && (
                          <button
                            type="button"
                            onClick={() => handleSend(msg.failedPrompt)}
                            className="inline-flex items-center gap-1 rounded-md bg-[#FF6B24]/20 border border-[#FF6B24]/50 px-2 py-0.5 text-[10px] font-semibold text-[#FFB547] hover:bg-[#FF6B24]/30"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Retry</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-[#A1A8B3] hover:text-[#F7F7F5] hover:bg-[#1C2633]"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-[#22C55E]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Source Citations */}
                    {showCites && msg.citations && msg.citations.length > 0 && (
                      <div dir="ltr" className="mt-2.5 space-y-1.5">
                        {msg.citations.map((cite, idx) => (
                          <div
                            key={`${msg.id}-cite-${idx}`}
                            className="rounded-lg bg-[#10151D] border border-[#283340] p-2.5 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-2 font-semibold text-[#F7F7F5]">
                              <span className="truncate">{cite.document_title}</span>
                              {cite.investigation_acronym && (
                                <Link
                                  href={`/investigations?query=${encodeURIComponent(
                                    cite.investigation_acronym
                                  )}`}
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono text-[#39B9EB] hover:underline shrink-0"
                                >
                                  <span>{cite.investigation_acronym}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                            </div>
                            <div className="text-[10px] text-[#778495] mt-0.5">
                              {cite.section_name || "Technical Section"} · p.
                              {cite.page_number ?? 1}
                              {cite.doi ? ` · DOI: ${cite.doi}` : ""}
                            </div>
                            <p className="text-[11px] text-[#A1A8B3] mt-1 line-clamp-2 italic">
                              &ldquo;{cite.excerpt}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow-up Question Pills */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {msg.followUps.slice(0, 2).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSend(q)}
                          disabled={loading}
                          className="text-left text-[10.5px] px-2.5 py-1 rounded-full bg-[#10151D] hover:bg-[#1C2633] text-[#39B9EB] border border-[#283340] hover:border-[#39B9EB]/50 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="rounded-2xl bg-[#151D27] border border-[#283340] p-3.5 flex items-center gap-2.5 text-xs text-[#A1A8B3]">
                <span className="h-2 w-2 rounded-full bg-[#FF6B24] animate-ping" />
                <span>Searching NASA PSI evidence chunks &amp; synthesizing citations...</span>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#151D27] border-t border-[#283340] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              dir={isArabicText(input) ? "rtl" : "ltr"}
              placeholder="Ask about microgravity flames, BASS, SAFFIRE, FLEX..."
              className="flex-1 min-w-0 rounded-xl bg-[#080A0F] border border-[#283340] focus:border-[#39B9EB] px-3.5 py-2 text-xs text-[#F7F7F5] placeholder-[#778495] outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send question to Astro-Flame"
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-r from-[#FF6B24] to-[#E94B16] hover:from-[#FF8040] hover:to-[#FF6B24] disabled:opacity-45 text-white keep-white transition-all shadow-[0_4px_14px_rgba(255,107,36,0.35)] shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      )}

      {/* Floating Bottom-Right Mascot Launcher */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex items-center gap-2.5">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#10151D]/95 hover:bg-[#151D27] border border-[#283340] hover:border-[#FF6B24]/60 px-3.5 py-1.5 text-xs font-semibold text-[#F7F7F5] shadow-[0_10px_28px_rgba(0,0,0,0.65)] transition-all"
          >
            <span className="h-2 w-2 rounded-full bg-[#FF6B24] animate-pulse" />
            <span>Ask Astro-Flame</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close Astro-Flame companion" : "Ask Astro-Flame AI companion"}
          title="Ask Astro-Flame"
          className={`group relative h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#39B9EB] ${
            isOpen
              ? "border-[#FF6B24] shadow-[0_0_24px_rgba(255,107,36,0.6)]"
              : "border-[#39B9EB]/85 shadow-[0_8px_28px_rgba(0,0,0,0.75),0_0_20px_rgba(255,107,36,0.38)]"
          } bg-[#080A0F]`}
        >
          <img
            src="/images/story/mascot-avatar.png"
            alt="Astro-Flame AI Companion"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15 pointer-events-none" />
        </button>
      </div>
    </>
  );
};
