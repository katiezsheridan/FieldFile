"use client";

interface ZipStepProps {
  value: string;
  error?: string;
  onChange: (zip: string) => void;
  // Pressing Enter advances, mirroring the nav Continue button.
  onEnter: () => void;
}

export default function ZipStep({ value, error, onChange, onEnter }: ZipStepProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Numeric only, max 5 digits. Strip anything else as they type.
    onChange(e.target.value.replace(/\D/g, "").slice(0, 5));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-field-ink">
          What&apos;s the property&apos;s zip code?
        </h2>
        <p className="mt-2 text-field-ink/70 text-base">
          We use this to match you to the right county and appraisal district.
        </p>
      </div>

      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        autoComplete="postal-code"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g. 78666"
        aria-invalid={!!error}
        autoFocus
        className="w-full px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink text-lg tracking-wide placeholder:text-field-ink/40 placeholder:tracking-normal placeholder:text-base focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
      />

      {error && <p className="mt-2 text-sm text-field-terra">{error}</p>}
    </div>
  );
}
