"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/StepIndicator";
import WizardStep from "@/components/onboarding/WizardStep";

// Demo properties for selection
const demoProperties = [
  { id: "1", name: "Hill Country Ranch", county: "Travis", acreage: 150 },
  { id: "2", name: "Sunset Valley Farm", county: "Hays", acreage: 85 },
  { id: "3", name: "Live Oak Estate", county: "Blanco", acreage: 220 },
];

// Activity types for wildlife management
const activityTypes = [
  {
    id: "habitat",
    label: "Habitat Control",
    description: "Brush management, prescribed burns, native plantings",
  },
  {
    id: "erosion",
    label: "Erosion Control",
    description: "Terracing, water bars, vegetation buffers",
  },
  {
    id: "predator",
    label: "Predator Management",
    description: "Trapping, hunting, or monitoring predators",
  },
  {
    id: "supplemental_water",
    label: "Providing Supplemental Water",
    description: "Ponds, troughs, drip systems for wildlife",
  },
  {
    id: "supplemental_food",
    label: "Providing Supplemental Food",
    description: "Feeders, food plots, native browse",
  },
  {
    id: "shelter",
    label: "Providing Shelter",
    description: "Nest boxes, brush piles, roosting structures",
  },
  {
    id: "census",
    label: "Census/Counting",
    description: "Wildlife surveys, camera traps, population tracking",
  },
];

// Evidence submission options
const evidenceOptions = [
  {
    id: "upload_now",
    label: "Upload photos now",
    description: "I have photos ready to upload from my device",
  },
  {
    id: "send_later",
    label: "Text or email photos later",
    description: "Send me a link to upload photos from my phone",
  },
  {
    id: "site_visit",
    label: "Schedule a site visit",
    description: "Have a FieldFile specialist document activities on-site",
  },
];

const steps = ["Welcome", "Activities", "Evidence", "Review", "Complete"];

type OnboardingState = {
  selectedProperty: string | null;
  selectedActivities: string[];
  evidenceMethod: string | null;
};

export default function FilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<OnboardingState>({
    selectedProperty: null,
    selectedActivities: [],
    evidenceMethod: null,
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete - redirect to dashboard
      router.push("/");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleActivity = (activityId: string) => {
    setState((prev) => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activityId)
        ? prev.selectedActivities.filter((id) => id !== activityId)
        : [...prev.selectedActivities, activityId],
    }));
  };

  const getSelectedPropertyName = () => {
    const property = demoProperties.find((p) => p.id === state.selectedProperty);
    return property?.name || "";
  };

  const getSelectedActivitiesLabels = () => {
    return activityTypes
      .filter((a) => state.selectedActivities.includes(a.id))
      .map((a) => a.label);
  };

  const getSelectedEvidenceLabel = () => {
    const option = evidenceOptions.find((o) => o.id === state.evidenceMethod);
    return option?.label || "";
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)]">
      {/* Step indicator */}
      <div className="mb-12">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="flex-1">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <WizardStep
            title="Let's file your wildlife report"
            description="First, select the property you'd like to file for this year."
            onNext={handleNext}
            onBack={handleBack}
            isFirst
            nextLabel={state.selectedProperty ? "Continue" : "Select a property"}
          >
            <div className="space-y-3">
              {demoProperties.map((property) => (
                <button
                  key={property.id}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      selectedProperty: property.id,
                    }))
                  }
                  className={`
                    w-full p-6 rounded-xl border-2 text-left transition-all
                    ${
                      state.selectedProperty === property.id
                        ? "border-field-forest bg-field-forest/5"
                        : "border-field-wheat hover:border-field-sage bg-white"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-field-ink">
                        {property.name}
                      </h3>
                      <p className="text-sm text-field-ink/60 mt-1">
                        {property.county} County - {property.acreage} acres
                      </p>
                    </div>
                    <div
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${
                          state.selectedProperty === property.id
                            ? "border-field-forest bg-field-forest"
                            : "border-field-wheat"
                        }
                      `}
                    >
                      {state.selectedProperty === property.id && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </WizardStep>
        )}

        {/* Step 2: Activities */}
        {currentStep === 2 && (
          <WizardStep
            title="What activities did you complete this year?"
            description="Select all the wildlife management activities you performed. You'll need to document at least 3 of the 7 categories."
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-3">
              {activityTypes.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => toggleActivity(activity.id)}
                  className={`
                    w-full p-5 rounded-xl border-2 text-left transition-all
                    ${
                      state.selectedActivities.includes(activity.id)
                        ? "border-field-forest bg-field-forest/5"
                        : "border-field-wheat hover:border-field-sage bg-white"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                        ${
                          state.selectedActivities.includes(activity.id)
                            ? "border-field-forest bg-field-forest"
                            : "border-field-wheat"
                        }
                      `}
                    >
                      {state.selectedActivities.includes(activity.id) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-field-ink">
                        {activity.label}
                      </h3>
                      <p className="text-sm text-field-ink/60 mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-sm text-field-ink/60">
              Selected: {state.selectedActivities.length} of 7 activities
              {state.selectedActivities.length >= 3 && (
                <span className="text-field-forest ml-2 font-medium">
                  Minimum requirement met
                </span>
              )}
            </p>
          </WizardStep>
        )}

        {/* Step 3: Evidence */}
        {currentStep === 3 && (
          <WizardStep
            title="How would you like to submit evidence?"
            description="Photos with GPS data and timestamps are the best documentation for wildlife activities."
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-3">
              {evidenceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      evidenceMethod: option.id,
                    }))
                  }
                  className={`
                    w-full p-6 rounded-xl border-2 text-left transition-all
                    ${
                      state.evidenceMethod === option.id
                        ? "border-field-forest bg-field-forest/5"
                        : "border-field-wheat hover:border-field-sage bg-white"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-field-ink">
                        {option.label}
                      </h3>
                      <p className="text-sm text-field-ink/60 mt-1">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${
                          state.evidenceMethod === option.id
                            ? "border-field-forest bg-field-forest"
                            : "border-field-wheat"
                        }
                      `}
                    >
                      {state.evidenceMethod === option.id && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Note about additional reports */}
            <div className="mt-6 p-4 bg-field-sage/10 rounded-lg border border-field-sage/30">
              <p className="text-sm text-field-ink/70">
                You can always submit additional documentation later if you have more photos or receipts to add.
              </p>
            </div>
          </WizardStep>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <WizardStep
            title="Review your selections"
            description="Make sure everything looks right before we set up your filing."
            onNext={handleNext}
            onBack={handleBack}
            nextLabel="Looks good!"
          >
            <div className="space-y-6">
              {/* Property */}
              <div className="p-6 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-field-ink/60 font-medium">
                      Property
                    </p>
                    <p className="text-lg text-field-ink mt-1">
                      {getSelectedPropertyName()}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-field-ink/60 font-medium">
                      Activities ({state.selectedActivities.length} selected)
                    </p>
                    <ul className="mt-2 space-y-1">
                      {getSelectedActivitiesLabels().map((label, index) => (
                        <li key={index} className="text-field-ink">
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Evidence method */}
              <div className="p-6 bg-white rounded-xl border border-field-wheat">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-field-ink/60 font-medium">
                      Evidence Submission
                    </p>
                    <p className="text-lg text-field-ink mt-1">
                      {getSelectedEvidenceLabel()}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-sm text-field-forest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </WizardStep>
        )}

        {/* Step 5: Complete */}
        {currentStep === 5 && (
          <WizardStep
            title="You're all set!"
            description="Your filing has been created. Now it's time to document your activities."
            onNext={handleNext}
            onBack={handleBack}
            isLast
            nextLabel="Go to Dashboard"
          >
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-field-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-field-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-field-ink mb-2">
                Filing created for {getSelectedPropertyName()}
              </h2>
              <p className="text-field-ink/60 max-w-md mx-auto">
                {state.evidenceMethod === "upload_now" &&
                  "Head to your dashboard to start uploading photos of your wildlife activities."}
                {state.evidenceMethod === "send_later" &&
                  "We'll send you a text with a link to easily upload photos from your phone."}
                {state.evidenceMethod === "site_visit" &&
                  "We'll be in touch to schedule your on-site documentation visit."}
              </p>

              <div className="mt-8 p-6 bg-field-wheat/30 rounded-xl max-w-md mx-auto">
                <h3 className="text-sm font-medium text-field-ink mb-3">
                  What happens next?
                </h3>
                <ul className="text-sm text-field-ink/70 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-field-forest mt-0.5">1.</span>
                    <span>Upload photos for your {state.selectedActivities.length} selected activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-field-forest mt-0.5">2.</span>
                    <span>We compile your report and a human reviews it for accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-field-forest mt-0.5">3.</span>
                    <span>You approve the final version, then we submit it to your county</span>
                  </li>
                </ul>
              </div>

              {/* Note about additional reports */}
              <p className="mt-6 text-sm text-field-ink/60 max-w-md mx-auto">
                You can submit additional documentation anytime if you have more photos or activities to add.
              </p>
            </div>
          </WizardStep>
        )}
      </div>
    </div>
  );
}
