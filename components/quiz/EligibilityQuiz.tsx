"use client";

import { useState, useRef } from "react";
import { quizQuestions, regionEndangeredSpecies, regionLabels, type TexasRegion } from "@/lib/quiz-data";
import QuizProgress from "./QuizProgress";
import QuestionCard from "./QuestionCard";
import CountyLookup from "./CountyLookup";
import QuizReport from "./QuizReport";
import WildlifeFastTrack from "./WildlifeFastTrack";

export default function EligibilityQuiz() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showReport, setShowReport] = useState(false);
  const [showWildlifeFastTrack, setShowWildlifeFastTrack] = useState(false);
  const surveyFileRef = useRef<File | null>(null);

  const totalSteps = quizQuestions.length;
  const currentQuestion = quizQuestions.find((q) => q.id === currentStep);
  const hasAnswer = answers[currentStep] !== undefined;

  // Extract region from Q2 answer (stored as "county|region")
  const selectedRegion = answers[2]?.split("|")[1] as TexasRegion | undefined;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  }

  function handleFileUpload(file: File) {
    surveyFileRef.current = file;
  }

  function handleNext() {
    if (!hasAnswer) return;
    // Q3 branch: if user already has wildlife valuation, skip straight to the
    // FieldFile fast-track page instead of the full eligibility flow.
    if (currentStep === 3 && answers[3] === "wildlife-valuation") {
      setShowWildlifeFastTrack(true);
      return;
    }
    if (currentStep === totalSteps) {
      setShowReport(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (showWildlifeFastTrack) {
      setShowWildlifeFastTrack(false);
    } else if (showReport) {
      setShowReport(false);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleRestart() {
    setCurrentStep(1);
    setAnswers({});
    setShowReport(false);
    setShowWildlifeFastTrack(false);
    surveyFileRef.current = null;
  }

  // Build region-specific endangered species info for Q13
  function getSpeciesInfo() {
    if (currentStep !== 13 || !selectedRegion) return null;
    const species = regionEndangeredSpecies[selectedRegion];
    if (!species) return null;
    return {
      title: `Endangered & threatened species in ${regionLabels[selectedRegion]}`,
      content: `Common protected species in your region include: ${species.join(", ")}. If any of these are present on your property, it can strengthen your wildlife management plan and may open doors to conservation grants.`,
    };
  }

  if (showWildlifeFastTrack) {
    return (
      <div className="min-h-screen bg-field-cream py-12 px-4">
        <div className="max-w-2xl mx-auto mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-field-ink/60 hover:text-field-ink font-medium transition-colors"
          >
            &larr; Back to questions
          </button>
        </div>
        <WildlifeFastTrack
          answers={answers}
          surveyFile={surveyFileRef.current}
        />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <button
            onClick={handleRestart}
            className="text-sm text-field-ink/50 hover:text-field-ink font-medium transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (showReport) {
    return (
      <div className="min-h-screen bg-field-cream py-12 px-4">
        <div className="max-w-2xl mx-auto mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-field-ink/60 hover:text-field-ink font-medium transition-colors"
          >
            &larr; Back to questions
          </button>
        </div>
        <QuizReport
          answers={answers}
          surveyFile={surveyFileRef.current}
        />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <button
            onClick={handleRestart}
            className="text-sm text-field-ink/50 hover:text-field-ink font-medium transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-field-cream py-12 px-4">
      <div className="max-w-xl mx-auto">
        <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />

        {currentQuestion.type === "county-lookup" ? (
          <CountyLookup
            value={answers[currentStep]}
            onSelect={handleSelect}
          />
        ) : (
          <QuestionCard
            title={currentQuestion.title}
            description={currentQuestion.description}
            options={currentQuestion.options}
            selectedValue={answers[currentStep]}
            onSelect={handleSelect}
            onFileUpload={currentStep === 7 ? handleFileUpload : undefined}
            extraInfo={getSpeciesInfo()}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-field-wheat">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-field-ink/70 hover:text-field-ink font-medium transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="px-8 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps ? "See my report" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
