"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlan, usePlanDraftAutoSave, updatePlan } from "@/lib/hooks";
import { computePlanCompletion } from "@/lib/plan-completion";
import { EMPTY_PLAN_FORM, PlanForm } from "@/components/plan/planForm";
import PlanProgress from "@/components/plan/PlanProgress";
import LandDescriptionStep from "@/components/plan/steps/LandDescriptionStep";
import PracticesStep from "@/components/plan/steps/PracticesStep";
import ReviewStep from "@/components/plan/steps/ReviewStep";

const STEPS = ["Land description", "Practices", "Review"];

export default function PlanWizard({ planId }: { planId: string }) {
  const router = useRouter();
  const { plan, loading, error } = usePlan(planId);

  const [form, setForm] = useState<PlanForm>(EMPTY_PLAN_FORM);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const initialized = useRef(false);

  // Seed the form from the saved plan once it loads. Guarded so a later refetch
  // never clobbers in-progress edits.
  useEffect(() => {
    if (plan && !initialized.current) {
      setForm({
        habitatTypes: plan.habitatTypes,
        propertyDescription: plan.propertyDescription ?? "",
        waterSources: plan.waterSources,
        wildlifeSpecies: plan.wildlifeSpecies,
        currentLandUse: plan.currentLandUse ?? "",
        landHistory: plan.landHistory ?? "",
        targetSpecies: plan.targetSpecies,
      });
      initialized.current = true;
    }
  }, [plan]);

  // Restore the step from the URL once on mount (so refresh/back keeps place).
  useEffect(() => {
    const param = Number(new URLSearchParams(window.location.search).get("step"));
    if (param >= 1 && param <= STEPS.length) setStep(param);
  }, []);

  const { isSaving, lastSaved } = usePlanDraftAutoSave(
    initialized.current ? planId : undefined,
    form
  );

  const update = <K extends keyof PlanForm>(key: K, value: PlanForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const goToStep = (n: number) => {
    const clamped = Math.min(Math.max(n, 1), STEPS.length);
    setStep(clamped);
    window.history.replaceState(null, "", `?step=${clamped}`);
  };

  const completion = computePlanCompletion({
    identity: {
      name: plan?.property?.name,
      county: plan?.property?.county,
      acreage: plan?.property?.acreage,
      legalDescription: plan?.property?.legalDescription,
      appraisalAccount: plan?.property?.appraisalAccount,
    },
    landDescription: {
      habitatTypes: form.habitatTypes,
      propertyDescription: form.propertyDescription,
      waterSources: form.waterSources,
      wildlifeSpecies: form.wildlifeSpecies,
      currentLandUse: form.currentLandUse,
    },
    targetSpecies: form.targetSpecies,
    practices: (plan?.practices ?? []).map((p) => ({
      selected: p.selected,
      documentation: p.documentation,
    })),
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updatePlan(planId, { status: "ready" });
      const handle = plan?.property?.slug ?? plan?.property?.id;
      router.push(handle ? `/properties/${handle}` : "/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not mark the plan ready."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-6 w-48 bg-field-wheat rounded mb-4" />
        <div className="h-24 bg-field-mist rounded-xl mb-6" />
        <div className="h-64 bg-field-mist rounded-xl" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-field-terra">{error || "Plan not found."}</p>
        <Link href="/dashboard" className="text-field-forest font-medium mt-3 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const property = plan.property;
  const editHandle = property?.slug ?? property?.id;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Read-only property identity */}
      <div className="rounded-xl border border-field-wheat bg-white px-5 py-4 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-field-earth/70">
              Wildlife plan {plan.year}
            </p>
            <h1 className="text-xl font-semibold text-field-ink mt-0.5">
              {property?.name ?? "Your property"}
            </h1>
            <p className="text-sm text-field-earth mt-0.5">
              {property?.county ? `${property.county} County` : ""}
              {property?.acreage ? ` · ${property.acreage} acres` : ""}
            </p>
          </div>
          {editHandle && (
            <Link
              href={`/properties/${editHandle}`}
              className="text-sm font-medium text-field-forest hover:text-field-forest/80 flex-shrink-0"
            >
              Edit property
            </Link>
          )}
        </div>
      </div>

      {/* Progress + live completion % */}
      <div className="mb-8">
        <PlanProgress
          steps={STEPS}
          currentStep={step}
          completion={completion}
          onStepClick={goToStep}
        />
      </div>

      {/* Save status */}
      <div className="h-5 mb-2 text-right">
        <span className="text-xs text-field-earth">
          {isSaving
            ? "Saving..."
            : lastSaved
            ? "Draft saved"
            : "Changes save automatically"}
        </span>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-field-wheat bg-white px-6 py-6">
        {step === 1 && <LandDescriptionStep form={form} update={update} />}
        {step === 2 && <PracticesStep />}
        {step === 3 && (
          <ReviewStep
            completion={completion}
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-field-wheat">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="px-6 py-3 text-field-earth hover:text-field-ink font-medium transition-colors"
              >
                Back
              </button>
            )}
          </div>
          {step < STEPS.length && (
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              className="px-8 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
