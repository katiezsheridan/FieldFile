"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/StepIndicator";
import WizardStep from "@/components/onboarding/WizardStep";
import { lookupLocation, type CountyResult } from "@/lib/quiz-data";

const STEPS = ["Property", "Your Info"];

export default function SetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Property
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [countyResult, setCountyResult] = useState<CountyResult | null>(null);
  const [locationError, setLocationError] = useState("");
  const [acreage, setAcreage] = useState("");
  const [manualCounty, setManualCounty] = useState("");
  const [legalDescription, setLegalDescription] = useState("");
  const [appraisalAccount, setAppraisalAccount] = useState("");

  // Step 2: Info (pre-filled from Clerk)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Pre-fill name from Clerk on first render of step 2
  const initName = () => {
    if (!fullName && user) {
      setFullName(user.fullName || "");
    }
  };

  function handleCountyLookup() {
    if (!locationInput.trim()) {
      setLocationError("Please enter a zip code or city name.");
      return;
    }
    const found = lookupLocation(locationInput);
    if (found) {
      setCountyResult(found);
      setLocationError("");
    } else {
      setCountyResult(null);
      setLocationError(
        "We couldn't find that location. Try a 5-digit Texas zip code or a major city name."
      );
    }
  }

  async function handleComplete() {
    if (!user?.id) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: {
            name: propertyName || `${countyResult?.county} County Property`,
            address,
            county: countyResult?.county.includes("area")
              ? manualCounty
              : countyResult?.county || "",
            state: "TX",
            acreage: parseFloat(acreage) || 0,
            exemptionType: "wildlife",
            legalDescription: legalDescription || undefined,
            appraisalAccount: appraisalAccount || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      // Route straight into the plan wizard the setup just created.
      router.push(data.planId ? `/plan/${data.planId}` : "/dashboard");
    } catch (err) {
      console.error("Setup error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-field-cream">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {step === 1 && (
          <WizardStep
            title="Tell us about your property"
            description="We'll use this to set up your dashboard and tailor your filing requirements."
            isFirst
            onNext={() => {
              initName();
              setStep(2);
            }}
            nextDisabled={!countyResult || !acreage}
          >
            <div className="space-y-6">
              {/* Property name */}
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Property name{" "}
                  <span className="text-field-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder='e.g. "The Back 40" or "Hill Country Ranch"'
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
              </div>

              {/* County lookup */}
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  County
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setLocationError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCountyLookup();
                      }
                    }}
                    placeholder="Enter zip code or city name"
                    className="flex-1 px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                  />
                  <button
                    onClick={handleCountyLookup}
                    type="button"
                    className="px-5 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors flex-shrink-0"
                  >
                    Look up
                  </button>
                </div>
                {locationError && (
                  <p className="text-sm text-field-terra mt-2">{locationError}</p>
                )}
                {countyResult && (
                  <div className="mt-3 rounded-lg border-2 border-field-green bg-field-green/5 px-4 py-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-field-green flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium text-field-ink">
                      {countyResult.county.includes("area")
                        ? "Texas zip code confirmed"
                        : `${countyResult.county} County`}
                    </span>
                  </div>
                )}
                {countyResult?.county.includes("area") && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-field-ink mb-1.5">
                      County name
                    </label>
                    <input
                      type="text"
                      value={manualCounty}
                      onChange={(e) => setManualCounty(e.target.value)}
                      placeholder="e.g. Hays, Blanco, Travis"
                      className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Property address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or nearest road"
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
              </div>

              {/* Acreage */}
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Acreage
                </label>
                <input
                  type="number"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
              </div>

              {/* Legal description */}
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Legal description{" "}
                  <span className="text-field-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={legalDescription}
                  onChange={(e) => setLegalDescription(e.target.value)}
                  placeholder="How the deed describes the land, e.g. Abstract 123, Survey 45"
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
                <p className="text-xs text-field-ink/40 mt-1">
                  You can add this later. We&apos;ll need it when you build your plan.
                </p>
              </div>

              {/* Appraisal account number */}
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Appraisal account number{" "}
                  <span className="text-field-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={appraisalAccount}
                  onChange={(e) => setAppraisalAccount(e.target.value)}
                  placeholder="The account number on your appraisal district notice"
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
              </div>
            </div>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep
            title="Your information"
            description="We'll use this to personalize your experience and pre-fill your reports."
            onBack={() => setStep(1)}
            onNext={handleComplete}
            isLast
            nextLabel={saving ? "Setting up..." : "Continue to your plan"}
            nextDisabled={saving}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-field-mist text-field-ink/70 cursor-not-allowed"
                />
                <p className="text-xs text-field-ink/40 mt-1">
                  Managed through your account settings
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-field-ink mb-1.5">
                  Phone number{" "}
                  <span className="text-field-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(512) 555-0100"
                  className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
                />
              </div>

              {error && (
                <div className="mt-2 p-4 rounded-lg bg-field-terra/10 border border-field-terra/20">
                  <p className="text-sm text-field-terra">{error}</p>
                </div>
              )}
            </div>
          </WizardStep>
        )}
      </div>
    </main>
  );
}
