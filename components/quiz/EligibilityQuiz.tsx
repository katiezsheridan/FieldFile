"use client";

import { useState } from "react";
import {
  Q1_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  Q5_OPTIONS,
  ACREAGE_LABELS,
  deriveCounty,
  isValidZip,
  isPlausibleTexasZip,
  computeSegment,
  computeLeadTemp,
  type QuizAnswers,
} from "@/lib/eligibility-quiz";
import ChoiceStep from "./ChoiceStep";
import ZipStep from "./ZipStep";
import EmailStep from "./EmailStep";
import QuizConfirmation from "./QuizConfirmation";

// Ordered flow: 5 questions + email = 6 steps.
type StepId = "q1" | "zip" | "q3" | "q4" | "q5" | "email";
const STEPS: StepId[] = ["q1", "zip", "q3", "q4", "q5", "email"];
const TOTAL_STEPS = STEPS.length;

export default function EligibilityQuiz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [zipError, setZipError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  // Derived values, computed once all answers are in (used on the email step).
  const segment = computeSegment(answers);
  const leadTemp = computeLeadTemp(segment);
  const { county, inTargetCounty } = answers.zip
    ? deriveCounty(answers.zip)
    : { county: null, inTargetCounty: false };
  const acreageLabel = answers.q4 ? ACREAGE_LABELS[answers.q4] : "";

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setZipError("");
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // Choice questions auto-advance on select.
  function selectAnswer<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    goNext();
  }

  function handleZipContinue() {
    const zip = answers.zip ?? "";
    if (!isValidZip(zip)) {
      setZipError("Please enter a 5-digit zip code.");
      return;
    }
    if (!isPlausibleTexasZip(zip)) {
      setZipError("That doesn't look like a Texas zip code. FieldFile serves Texas landowners.");
      return;
    }
    setZipError("");
    goNext();
  }

  // ── Confirmation (post-submit) ─────────────────────────────────────────────
  if (submittedEmail) {
    return (
      <div className="min-h-screen bg-field-cream py-12 px-4">
        <div className="max-w-xl mx-auto">
          <QuizConfirmation segment={segment} email={submittedEmail} />
        </div>
      </div>
    );
  }

  const stepNumber = stepIndex + 1;
  const percentage = Math.round((stepNumber / TOTAL_STEPS) * 100);
  const canGoBack = stepIndex > 0;

  return (
    <div className="min-h-screen bg-field-cream py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-field-ink/70">
              Step {stepNumber} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-field-ink/50">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-field-wheat/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-field-forest rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {step === "q1" && (
          <ChoiceStep
            title="Which best describes you?"
            options={Q1_OPTIONS}
            selectedValue={answers.q1}
            onSelect={(v) => selectAnswer("q1", v as QuizAnswers["q1"])}
          />
        )}

        {step === "zip" && (
          <ZipStep
            value={answers.zip ?? ""}
            error={zipError}
            onChange={(zip) => {
              setAnswers((prev) => ({ ...prev, zip }));
              if (zipError) setZipError("");
            }}
            onEnter={handleZipContinue}
          />
        )}

        {step === "q3" && (
          <ChoiceStep
            title="Does your land currently have a special tax valuation?"
            options={Q3_OPTIONS}
            selectedValue={answers.q3}
            onSelect={(v) => selectAnswer("q3", v as QuizAnswers["q3"])}
          />
        )}

        {step === "q4" && (
          <ChoiceStep
            title="Roughly how large is the property?"
            options={Q4_OPTIONS}
            selectedValue={answers.q4}
            onSelect={(v) => selectAnswer("q4", v as QuizAnswers["q4"])}
          />
        )}

        {step === "q5" && (
          <ChoiceStep
            title="What are you hoping to do?"
            options={Q5_OPTIONS}
            selectedValue={answers.q5}
            onSelect={(v) => selectAnswer("q5", v as QuizAnswers["q5"])}
          />
        )}

        {step === "email" && (
          <EmailStep
            answers={answers}
            segment={segment}
            leadTemp={leadTemp}
            county={county}
            inTargetCounty={inTargetCounty}
            acreageLabel={acreageLabel}
            onSubmitted={(submitted) => setSubmittedEmail(submitted)}
          />
        )}

        {/* Navigation: Back on every step, plus Continue for the zip step
            (choice steps auto-advance; the email step has its own submit). */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-field-wheat">
          <div>
            {canGoBack && (
              <button
                onClick={goBack}
                className="px-6 py-3 text-field-ink/70 hover:text-field-ink font-medium transition-colors"
              >
                Back
              </button>
            )}
          </div>
          {step === "zip" && (
            <button
              onClick={handleZipContinue}
              disabled={!isValidZip(answers.zip ?? "")}
              className="px-8 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
