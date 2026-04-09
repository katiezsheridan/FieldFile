"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/StepIndicator";
import WizardStep from "@/components/onboarding/WizardStep";
import { lookupLocation, type CountyResult } from "@/lib/quiz-data";

const STEPS = ["Property", "Your Info", "Activities"];

const ACTIVITY_OPTIONS: {
  type: string;
  name: string;
  description: string;
}[] = [
  {
    type: "feeders",
    name: "Supplemental Feeding",
    description: "Food plots, feeders, or wildlife-friendly vegetation",
  },
  {
    type: "water_sources",
    name: "Supplemental Water",
    description: "Wildlife drinkers, modified stock tanks, or maintained springs",
  },
  {
    type: "birdhouses",
    name: "Providing Shelters",
    description: "Nest boxes, brush piles, bat houses, or roosting structures",
  },
  {
    type: "census",
    name: "Census Counts",
    description: "Trail cameras, spotlight counts, bird surveys, or track stations",
  },
  {
    type: "brush_management",
    name: "Habitat Control",
    description: "Prescribed burns, brush management, mowing, or reseeding",
  },
  {
    type: "native_planting",
    name: "Erosion Control",
    description: "Terraces, check dams, buffer strips, or bank stabilization",
  },
  {
    type: "predator_management",
    name: "Predator Management",
    description: "Feral hog trapping, raccoon control, or fire ant management",
  },
];

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

  // Step 2: Info (pre-filled from Clerk)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 3: Activities
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set()
  );

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

  function toggleActivity(type: string) {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
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
          },
          activities: Array.from(selectedActivities).map((type) => {
            const option = ACTIVITY_OPTIONS.find((a) => a.type === type)!;
            return {
              type,
              name: option.name,
              description: option.description,
            };
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      router.push("/dashboard");
    } catch (err) {
      console.error("Setup error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-field-cream">
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
            </div>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep
            title="Your information"
            description="We'll use this to personalize your experience and pre-fill your reports."
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
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
            </div>
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep
            title="What activities are you doing?"
            description="Select at least 3 of the 7 qualifying wildlife management activities. You can always change these later."
            onBack={() => setStep(2)}
            onNext={handleComplete}
            isLast
            nextLabel={saving ? "Setting up..." : "Complete setup"}
            nextDisabled={selectedActivities.size < 3 || saving}
          >
            <div className="space-y-3">
              {ACTIVITY_OPTIONS.map((activity) => {
                const isSelected = selectedActivities.has(activity.type);
                return (
                  <button
                    key={activity.type}
                    onClick={() => toggleActivity(activity.type)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-field-green bg-field-green/5"
                        : "border-field-wheat/50 bg-white hover:border-field-green/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-field-forest"
                            : "border-2 border-field-wheat"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-field-ink">
                          {activity.name}
                        </p>
                        <p className="text-sm text-field-ink/60 mt-0.5">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedActivities.size > 0 && selectedActivities.size < 3 && (
              <p className="text-sm text-field-terra mt-4">
                Select at least {3 - selectedActivities.size} more{" "}
                {3 - selectedActivities.size === 1 ? "activity" : "activities"} to
                continue.
              </p>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-field-terra/10 border border-field-terra/20">
                <p className="text-sm text-field-terra">{error}</p>
              </div>
            )}
          </WizardStep>
        )}
      </div>
    </main>
  );
}
