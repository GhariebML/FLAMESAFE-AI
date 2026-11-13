"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InvestigationDetail } from "@/types/investigation";
import { apiClient } from "@/lib/api/client";
import { DetailView } from "@/components/investigations/DetailView";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/shared/Button";
import { ArrowLeft } from "lucide-react";

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [investigation, setInvestigation] = useState<InvestigationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    apiClient
      .getInvestigationDetail(id)
      .then((data) => {
        setInvestigation(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load investigation details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton className="h-8 w-32" />
        <LoadingSkeleton className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingSkeleton className="h-48" />
          <LoadingSkeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-200">Investigation Not Found</h2>
        <p className="text-xs text-slate-400">{error || "Could not retrieve the requested investigation profile."}</p>
        <Button variant="secondary" onClick={() => router.push("/investigations")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Explorer
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/investigations")}
        className="gap-1.5 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Investigations
      </Button>

      <DetailView investigation={investigation} />
    </div>
  );
}
