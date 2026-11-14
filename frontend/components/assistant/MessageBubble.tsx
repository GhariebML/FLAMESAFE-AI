import React from "react";
import { CitationItem } from "@/types/assistant";
import { CitationViewer } from "./CitationViewer";
import { Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: CitationItem[];
  uncertaintyNote?: string | null;
}

export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isAssistant = message.sender === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 text-xs sm:text-sm leading-relaxed",
        isAssistant ? "items-start" : "items-start flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
          isAssistant
            ? "bg-brand-soft dark:bg-brand-blue/15 border-brand-blue/30 text-brand-blue dark:text-brand-light-cyan"
            : "bg-brand-navy text-white keep-white border-brand-navy"
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-2xl rounded-2xl p-4 border shadow-sm",
          isAssistant
            ? "bg-space-900 border-space-800 text-fg-primary"
            : "keep-white bg-brand-blue border-brand-blue text-white"
        )}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>

        {message.uncertaintyNote && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-brand-warning/30 text-amber-800 dark:text-brand-flame-yellow text-[11px] flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{message.uncertaintyNote}</span>
          </div>
        )}

        {message.citations && message.citations.length > 0 && (
          <CitationViewer citations={message.citations} />
        )}
      </div>
    </div>
  );
};
