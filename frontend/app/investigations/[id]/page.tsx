"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InvestigationDetail } from "@/types/investigation";
import { apiClient } from "@/lib/api/client";
import { DetailView } from "@/components/investigations/DetailView";
import { SecondaryButton, LoadingState, ErrorState, PageHeader } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [investigation, setInvestigation] = useState<InvestigationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = () => {
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
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <LoadingState
          title="Loading Investigation Profile..."
          description="Retrieving experimental objectives, test run boundaries, sensor types, and DOI-linked documents."
          rows={5}
        />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-4">
        <ErrorState
          title="Investigation Profile Unavailable"
          message={error || "Could not retrieve the requested NASA PSI investigation profile."}
          onRetry={loadDetail}
        />
        <div className="flex justify-center">
          <SecondaryButton size="sm" onClick={() => router.push("/investigations")}>
            <ArrowLeft className="h-4 w-4" /> Back to Investigations
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Investigations", href: "/investigations" },
          { label: investigation.acronym },
        ]}
        eyebrow={`NASA PSI Program · ${investigation.psi_id}`}
        badgeText={investigation.research_area}
        badgeVariant="brand"
        title={investigation.title}
        actions={
          <SecondaryButton size="sm" onClick={() => router.push("/investigations")}>
            <ArrowLeft className="h-4 w-4" /> Back to Explorer
          </SecondaryButton>
        }
      />

      <DetailView investigation={investigation} />
    </div>
  );
}
