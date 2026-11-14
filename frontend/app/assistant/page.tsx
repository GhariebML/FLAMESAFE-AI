"use client";

import React from "react";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { PageHeader, UncertaintyBanner } from "@/components/ui";

export default function AssistantPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "AI Scientific Assistant" },
        ]}
        eyebrow="Evidence-Grounded RAG Synthesis"
        badgeText="Strict DOI Abstention Guard"
        badgeVariant="cyan"
        title="Microgravity Combustion Intelligence Assistant"
        description="Ask technical questions across indexed NASA PSI publications and experimental runs. Every answer links strictly to verified document chunks, section headings, page numbers, and DOIs."
      />

      <UncertaintyBanner
        variant="demo"
        title="Grounded Citation Discipline"
        message="This assistant only synthesizes claims supported by indexed evidence chunks and live runtime AI credentials. If retrieved studies do not address your boundary conditions, it abstains transparently."
      />

      <ChatInterface />
    </div>
  );
}
