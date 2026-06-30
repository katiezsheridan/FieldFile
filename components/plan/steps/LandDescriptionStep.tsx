"use client";

import { cn } from "@/lib/utils";
import TagInput from "@/components/plan/TagInput";
import {
  HABITAT_OPTIONS,
  WATER_OPTIONS,
  PlanForm,
} from "@/components/plan/planForm";

type LandDescriptionStepProps = {
  form: PlanForm;
  update: <K extends keyof PlanForm>(key: K, value: PlanForm[K]) => void;
};

const labelClass = "block text-sm font-medium text-field-ink mb-2";
const fieldClass =
  "w-full rounded-lg border border-field-wheat bg-white px-3 py-2 text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-forest/30 focus:border-field-forest";

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function LandDescriptionStep({
  form,
  update,
}: LandDescriptionStepProps) {
  return (
    <div className="space-y-8">
      <p className="text-field-earth">
        Tell us about the land and the wildlife on it. This is the picture your
        county appraiser needs, in your own words. You can come back and change
        any of it later.
      </p>

      {/* Habitat types */}
      <div>
        <span className={labelClass}>
          What kinds of habitat are on the property?
        </span>
        <div className="grid grid-cols-2 gap-2">
          {HABITAT_OPTIONS.map((opt) => {
            const checked = form.habitatTypes.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  update("habitatTypes", toggleInList(form.habitatTypes, opt.value))
                }
                className={cn(
                  "text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors",
                  checked
                    ? "border-field-forest bg-field-forest/5 text-field-ink"
                    : "border-field-wheat/60 bg-white text-field-earth hover:border-field-forest/40"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property description */}
      <div>
        <label htmlFor="plan-desc" className={labelClass}>
          Describe the property in a few sentences
        </label>
        <textarea
          id="plan-desc"
          rows={4}
          value={form.propertyDescription}
          onChange={(e) => update("propertyDescription", e.target.value)}
          placeholder="The terrain, plant cover, how it is laid out, anything that stands out."
          className={fieldClass}
        />
      </div>

      {/* Water */}
      <div>
        <span className={labelClass}>What water is on the property?</span>
        <div className="grid grid-cols-2 gap-2">
          {WATER_OPTIONS.map((opt) => {
            const checked = form.waterSources.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  update("waterSources", toggleInList(form.waterSources, opt.value))
                }
                className={cn(
                  "text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors",
                  checked
                    ? "border-field-forest bg-field-forest/5 text-field-ink"
                    : "border-field-wheat/60 bg-white text-field-earth hover:border-field-forest/40"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wildlife species */}
      <div>
        <span className={labelClass}>
          What wildlife do you see on the property?
        </span>
        <TagInput
          value={form.wildlifeSpecies}
          onChange={(next) => update("wildlifeSpecies", next)}
          ariaLabel="Wildlife species"
          placeholder="Type a species and press Enter (e.g. whitetail deer, bobwhite quail)"
        />
      </div>

      {/* Current land use */}
      <div>
        <label htmlFor="plan-landuse" className={labelClass}>
          How is the land used today?
        </label>
        <textarea
          id="plan-landuse"
          rows={3}
          value={form.currentLandUse}
          onChange={(e) => update("currentLandUse", e.target.value)}
          placeholder="Grazing, hunting, recreation, left wild, and so on."
          className={fieldClass}
        />
      </div>

      {/* Land history (optional) */}
      <div>
        <label htmlFor="plan-history" className={labelClass}>
          Any history worth noting?{" "}
          <span className="text-field-earth font-normal">(optional)</span>
        </label>
        <textarea
          id="plan-history"
          rows={3}
          value={form.landHistory}
          onChange={(e) => update("landHistory", e.target.value)}
          placeholder="Past use, changes you have made, restoration work, prior owners."
          className={fieldClass}
        />
      </div>

      {/* Target species — its own completion block, captured here since it is
          closely tied to the wildlife on the land. */}
      <div className="pt-2 border-t border-field-wheat/60">
        <span className={labelClass}>
          Which species are you managing the land for?
        </span>
        <p className="text-sm text-field-earth mb-2">
          These are your target species. Pick the ones your plan is built around.
        </p>
        <TagInput
          value={form.targetSpecies}
          onChange={(next) => update("targetSpecies", next)}
          ariaLabel="Target species"
          placeholder="Type a target species and press Enter (e.g. whitetail deer)"
        />
      </div>
    </div>
  );
}
