"use client";

import { cn } from "@/lib/utils";
import {
  quizQuestions,
  regionResources,
  regionLabels,
  regionEndangeredSpecies,
  type TexasRegion,
} from "@/lib/quiz-data";
import EmailCapture from "./EmailCapture";

interface QuizReportProps {
  answers: Record<number, string>;
  surveyFile?: File | null;
}

type Status = "green" | "yellow" | "red";

interface SectionResult {
  status: Status;
  items: { label: string; value: string; note?: string; status?: Status }[];
}

function getAnswerLabel(questionId: number, value: string): string {
  const question = quizQuestions.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.value === value);
  return option?.label || value;
}

function parseLocation(answer: string): { county: string; region: TexasRegion } {
  const [county, region] = answer.split("|");
  return { county: county || "Unknown", region: (region || "central") as TexasRegion };
}

function evaluatePropertyOverview(answers: Record<number, string>): SectionResult {
  const location = answers[2] ? parseLocation(answers[2]) : null;
  const items = [
    {
      label: "Ownership",
      value: getAnswerLabel(1, answers[1]),
    },
    {
      label: "Location",
      value: location
        ? `${location.county} County — ${regionLabels[location.region]}`
        : "Not specified",
    },
    {
      label: "Property size",
      value: getAnswerLabel(3, answers[3]),
      status: (answers[3] === "under-10" ? "yellow" : "green") as Status,
      note:
        answers[3] === "under-10"
          ? "Smaller properties may face stricter requirements"
          : undefined,
    },
  ];
  const status: Status = answers[3] === "under-10" ? "yellow" : "green";
  return { status, items };
}

function evaluateLandUse(answers: Record<number, string>): SectionResult {
  const items = [
    { label: "Primary goal", value: getAnswerLabel(4, answers[4]) },
    { label: "Secondary goal", value: getAnswerLabel(5, answers[5]) },
  ];
  return { status: "green", items };
}

function evaluatePropertyStatus(
  answers: Record<number, string>,
  hasSurveyFile: boolean
): SectionResult {
  const surveyValue = getAnswerLabel(6, answers[6]);
  const items = [
    {
      label: "Property survey",
      value: hasSurveyFile ? `${surveyValue} (uploaded)` : surveyValue,
      status: (answers[6] === "no" ? "yellow" : "green") as Status,
      note: answers[6] === "no" ? "Consider getting a boundary survey" : undefined,
    },
    {
      label: "Title status",
      value: getAnswerLabel(7, answers[7]),
      status: (answers[7] === "issues" ? "red" : "green") as Status,
      note:
        answers[7] === "issues"
          ? "Resolve title issues before filing"
          : undefined,
    },
    {
      label: "Road access",
      value: getAnswerLabel(8, answers[8]),
      status: (answers[8] === "limited" ? "yellow" : "green") as Status,
    },
    {
      label: "Easements",
      value: getAnswerLabel(9, answers[9]),
    },
  ];

  let status: Status = "green";
  if (items.some((i) => i.status === "red")) status = "red";
  else if (items.some((i) => i.status === "yellow")) status = "yellow";

  return { status, items };
}

function evaluateTaxValuation(answers: Record<number, string>): SectionResult {
  const items = [
    {
      label: "Previous land use",
      value: getAnswerLabel(10, answers[10]),
    },
    {
      label: "Current valuation",
      value: getAnswerLabel(11, answers[11]),
      status: (answers[11] === "no-valuation" ? "yellow" : "green") as Status,
      note:
        answers[11] === "no-valuation"
          ? "You may need to establish ag use history before qualifying"
          : answers[11] === "ag-valuation"
          ? "FieldFile can help you file a wildlife management plan and convert your valuation"
          : answers[11] === "wildlife-valuation"
          ? "Maintain annual compliance to keep your valuation"
          : undefined,
    },
  ];

  const status: Status =
    answers[11] === "no-valuation" ? "yellow" : "green";
  return { status, items };
}

function evaluateEnvironmental(answers: Record<number, string>, region?: TexasRegion): SectionResult {
  const species = region ? regionEndangeredSpecies[region] : null;
  const items = [
    {
      label: "Water features",
      value: getAnswerLabel(12, answers[12]),
      note:
        answers[12] === "none"
          ? "Supplemental water is a qualifying wildlife activity"
          : undefined,
    },
    {
      label: "Endangered species",
      value: getAnswerLabel(13, answers[13]),
      note:
        answers[13] === "yes" && species
          ? `Species in your region: ${species.slice(0, 3).join(", ")}. May qualify for conservation programs.`
          : answers[13] === "yes"
          ? "May qualify for additional conservation programs"
          : answers[13] === "unsure" && species
          ? `Common protected species in your area include: ${species.slice(0, 3).join(", ")}. Consider a species survey.`
          : undefined,
    },
  ];
  return { status: "green", items };
}

function evaluateInfrastructure(answers: Record<number, string>): SectionResult {
  const items = [
    {
      label: "Existing structures",
      value: getAnswerLabel(14, answers[14]),
    },
  ];
  return { status: "green", items };
}

function getNextSteps(answers: Record<number, string>): string[] {
  const steps: string[] = [];

  if (answers[11] === "no-valuation") {
    steps.push(
      "Contact your county appraisal district to understand ag history requirements"
    );
  }
  if (answers[11] === "ag-valuation") {
    steps.push(
      "Use FieldFile to build and file a wildlife management plan — we handle the entire conversion process for you"
    );
  }
  if (answers[11] === "wildlife-valuation") {
    steps.push(
      "Use FieldFile to track your annual activities and file on time"
    );
  }
  if (answers[6] === "no") {
    steps.push("Get a boundary survey to document your exact acreage");
  }
  if (answers[7] === "issues") {
    steps.push("Consult a real estate attorney to resolve title issues");
  }
  if (answers[12] === "none") {
    steps.push(
      "Plan supplemental water sources — this counts as a qualifying activity"
    );
  }
  if (answers[13] === "yes" || answers[13] === "unsure") {
    steps.push(
      "Request a species survey from Texas Parks & Wildlife or a certified biologist"
    );
  }

  steps.push(
    "Start a free FieldFile trial to organize your documentation and reports"
  );

  return steps;
}

const statusConfig = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    label: "Good",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    label: "Needs attention",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    label: "Action required",
  },
};

function ReportSection({
  title,
  result,
}: {
  title: string;
  result: SectionResult;
}) {
  const config = statusConfig[result.status];

  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-2.5 h-2.5 rounded-full", config.dot)} />
        <h3 className="font-semibold text-field-ink text-sm">{title}</h3>
        <span className="text-xs text-field-ink/50 ml-auto">
          {config.label}
        </span>
      </div>
      <div className="space-y-2">
        {result.items.map((item) => (
          <div key={item.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="text-xs font-medium text-field-ink/60 sm:w-36 flex-shrink-0">
              {item.label}
            </span>
            <div className="flex-1">
              <span className="text-sm text-field-ink">{item.value}</span>
              {item.note && (
                <p className="text-xs text-field-ink/60 mt-0.5">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuizReport({ answers, surveyFile }: QuizReportProps) {
  const location = answers[2] ? parseLocation(answers[2]) : null;
  const region = location?.region;
  const resources = region ? regionResources[region] || [] : [];
  const nextSteps = getNextSteps(answers);

  const sections = [
    { title: "Property Overview", result: evaluatePropertyOverview(answers) },
    { title: "Land Use & Goals", result: evaluateLandUse(answers) },
    { title: "Property Status", result: evaluatePropertyStatus(answers, !!surveyFile) },
    { title: "Tax Valuation Status", result: evaluateTaxValuation(answers) },
    {
      title: "Environmental Considerations",
      result: evaluateEnvironmental(answers, region),
    },
    { title: "Infrastructure", result: evaluateInfrastructure(answers) },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-field-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-field-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-field-ink mb-2">
          Your Eligibility Report
        </h2>
        <p className="text-field-ink/70">
          Based on your answers, here&apos;s a personalized assessment of your
          property&apos;s eligibility for wildlife or agricultural tax valuation.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {sections.map((section) => (
          <ReportSection
            key={section.title}
            title={section.title}
            result={section.result}
          />
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg border border-field-wheat p-5 mb-4">
        <h3 className="font-semibold text-field-ink text-sm mb-3">
          Recommended Next Steps
        </h3>
        <ol className="space-y-2">
          {nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-5 h-5 bg-field-green text-white text-xs rounded-full flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <span className="text-field-ink/80">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Regional Resources */}
      {resources.length > 0 && region && (
        <div className="bg-white rounded-lg border border-field-wheat p-5 mb-8">
          <h3 className="font-semibold text-field-ink text-sm mb-3">
            Local Resources for {regionLabels[region]}
          </h3>
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-field-forest hover:underline"
                >
                  {resource.name}
                </a>
                <p className="text-xs text-field-ink/60">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Capture */}
      <EmailCapture answers={answers} surveyFile={surveyFile} />
    </div>
  );
}
