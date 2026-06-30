"use client";

import { useParams } from "next/navigation";
import PlanWizard from "@/components/plan/PlanWizard";

export default function PlanPage() {
  const params = useParams();
  const planId = params.planId as string;

  return (
    <main className="min-h-full bg-field-cream">
      <PlanWizard planId={planId} />
    </main>
  );
}
