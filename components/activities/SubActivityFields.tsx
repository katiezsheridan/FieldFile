"use client";

import { FieldDef, SubActivityDef, visibleFields } from "@/lib/sub-activities";
import { FieldValue } from "@/lib/types";

/**
 * Renders the blanks, checkboxes and yes/no boxes that PWD-888 Part IV prints
 * for one sub-activity. The catalog in lib/sub-activities.ts decides what
 * appears here — this component only knows how to draw each input type.
 */

const inputClass =
  "w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20";

interface SubActivityFieldsProps {
  subActivity: SubActivityDef;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
}

export default function SubActivityFields({
  subActivity,
  values,
  onChange,
}: SubActivityFieldsProps) {
  const fields = visibleFields(subActivity, values);

  if (fields.length === 0) {
    return (
      <p className="text-sm text-field-earth">
        {subActivity.helpText ??
          "The form prints this activity as a checkbox with no further detail. Add photos or receipts below as your evidence."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {subActivity.helpText && (
        <p className="text-sm text-field-earth">{subActivity.helpText}</p>
      )}
      {fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(v) => onChange(field.key, v)}
        />
      ))}
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}) {
  const label = (
    <span className="block text-sm font-medium text-field-ink mb-1">
      {field.label}
      {field.unit && <span className="text-field-earth"> ({field.unit})</span>}
      {field.requiredForForm && (
        <span className="text-field-terra" title="The report needs this">
          {" "}
          *
        </span>
      )}
    </span>
  );

  const help = field.helpText && (
    <p className="mt-1 text-xs text-field-earth">{field.helpText}</p>
  );

  // A blank whose wording on the form differs from ours — say so, so the
  // landowner recognises it when they read the finished report.
  const formNote = field.formLabel && (
    <p className="mt-1 text-xs text-field-earth">
      On the form: &ldquo;{field.formLabel}&rdquo;
    </p>
  );

  switch (field.inputType) {
    case "boolean":
      return (
        <div>
          <label className="flex items-center gap-2 text-sm text-field-ink">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="font-medium">{field.label}</span>
          </label>
          {help}
          {formNote}
        </div>
      );

    case "choice":
      return (
        <div>
          {label}
          <div className="space-y-1">
            {field.choices?.map((choice) => (
              <label
                key={choice}
                className="flex items-start gap-2 text-sm text-field-ink"
              >
                <input
                  type="radio"
                  name={field.key}
                  className="mt-1"
                  checked={value === choice}
                  onChange={() => onChange(choice)}
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
          {help}
          {formNote}
        </div>
      );

    case "multi_choice": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          {label}
          <div className="space-y-1">
            {field.choices?.map((choice) => (
              <label
                key={choice}
                className="flex items-start gap-2 text-sm text-field-ink"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.includes(choice)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, choice]
                        : selected.filter((c) => c !== choice)
                    )
                  }
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
          {help}
          {formNote}
        </div>
      );
    }

    case "longtext":
      return (
        <div>
          {label}
          <textarea
            rows={3}
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {help}
          {formNote}
        </div>
      );

    case "number":
    case "integer":
      return (
        <div>
          {label}
          <input
            type="number"
            step={field.inputType === "integer" ? 1 : "any"}
            min={0}
            className={inputClass}
            value={typeof value === "number" ? value : ""}
            onChange={(e) =>
              onChange(e.target.value === "" ? null : Number(e.target.value))
            }
          />
          {help}
          {formNote}
        </div>
      );

    case "date":
      return (
        <div>
          {label}
          <input
            type="date"
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
          />
          {help}
          {formNote}
        </div>
      );

    case "date_range": {
      const range =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as { from?: string; to?: string })
          : {};
      return (
        <div>
          {label}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className={inputClass}
              value={range.from ?? ""}
              onChange={(e) => onChange({ ...range, from: e.target.value })}
            />
            <span className="text-sm text-field-earth">to</span>
            <input
              type="date"
              className={inputClass}
              value={range.to ?? ""}
              onChange={(e) => onChange({ ...range, to: e.target.value })}
            />
          </div>
          {help}
          {formNote}
        </div>
      );
    }

    case "text":
    default:
      return (
        <div>
          {label}
          <input
            type="text"
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {help}
          {formNote}
        </div>
      );
  }
}
