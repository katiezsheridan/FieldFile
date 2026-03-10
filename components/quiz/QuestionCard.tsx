"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { QuizOption } from "@/lib/quiz-data";
import InfoCard from "./InfoCard";

interface QuestionCardProps {
  title: string;
  description?: string;
  options: QuizOption[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onFileUpload?: (file: File) => void;
  /** Extra info content to show below the selected option (e.g. region-specific species) */
  extraInfo?: { title: string; content: string } | null;
}

export default function QuestionCard({
  title,
  description,
  options,
  selectedValue,
  onSelect,
  onFileUpload,
  extraInfo,
}: QuestionCardProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const selectedOption = options.find((o) => o.value === selectedValue);
  const showUpload = selectedOption?.allowUpload;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload?.(file);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-field-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-field-ink/70 text-base">{description}</p>
        )}
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-lg border-2 transition-all duration-200",
                "hover:border-field-green/40 hover:shadow-sm",
                isSelected
                  ? "border-field-green bg-field-green/5"
                  : "border-field-wheat bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-field-green bg-field-green"
                      : "border-field-wheat"
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    isSelected ? "text-field-ink" : "text-field-ink/80"
                  )}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional survey upload when "Yes, I have a recent survey" is selected */}
      {showUpload && (
        <div
          className="mt-4 rounded-lg border border-field-wheat bg-white p-4"
          style={{ animation: "slideDown 200ms ease-out" }}
        >
          <style jsx>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <p className="text-sm font-medium text-field-ink mb-2">
            Upload your survey{" "}
            <span className="text-field-ink/50 font-normal">(optional)</span>
          </p>
          <p className="text-xs text-field-ink/60 mb-3">
            PDF, JPG, or PNG up to 10MB. We&apos;ll include it with your report.
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="px-4 py-2 rounded-lg border border-field-wheat bg-field-cream text-sm font-medium text-field-ink/70 hover:border-field-green/40 transition-colors">
              {uploadedFile ? "Change file" : "Choose file"}
            </span>
            {uploadedFile && (
              <span className="text-sm text-field-green flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {uploadedFile.name}
              </span>
            )}
          </label>
        </div>
      )}

      {selectedOption?.info && <InfoCard info={selectedOption.info} />}

      {/* Extra info (e.g. region-specific endangered species) */}
      {extraInfo && (
        <InfoCard info={{ title: extraInfo.title, content: extraInfo.content }} />
      )}
    </div>
  );
}
