"use client";

import React from "react";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { Badge } from "@/components/shared/Badge";
import { BotMessageSquare, Sparkles } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6 text-flame-400" />
            SI Research Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Query the FlameSafe scientific intelligence engine. All answers are grounded in retrieved NASA PSI documentation with verified DOI citations.
          </p>
        </div>
        <Badge variant="plasma" className="gap-1.5 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" /> RAG & Citation Verification
        </Badge>
      </div>

      <ChatInterface />
    </div>
  );
}
