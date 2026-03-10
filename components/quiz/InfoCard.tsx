"use client";

import { QuizInfo } from "@/lib/quiz-data";

interface InfoCardProps {
  info: QuizInfo;
}

export default function InfoCard({ info }: InfoCardProps) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border-l-4 border-field-green bg-field-cream animate-in"
      style={{
        animation: "slideDown 300ms ease-out",
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
        }
      `}</style>
      <div className="px-5 py-4">
        <h4 className="font-semibold text-field-ink text-sm mb-2">
          {info.title}
        </h4>
        <p className="text-field-ink/70 text-sm leading-relaxed">
          {info.content}
        </p>
        {info.resources && info.resources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {info.resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-field-forest hover:underline"
              >
                {resource.label}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
