"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CENSUS_METHODS,
  COMMON_METHODS,
  SPECIES_CATEGORIES,
  getCategory,
  type SexAgeField,
} from "@/lib/census-species";
import type { CensusMethod } from "@/lib/types";
import CensusLocationPicker from "@/components/census/CensusLocationPickerWrapper";
import { FileUploader } from "@/components/documents/FileUploader";
import { uploadObservationPhoto } from "@/lib/supabase";

type SpeciesEntry = {
  categoryId: string;
  speciesId: string;
  counts: Partial<Record<SexAgeField, string>>; // string for controlled inputs
  notes: string;
};

export default function NewCensusEntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [observedOn, setObservedOn] = useState<string>(todayISO());
  const [observedAtTime, setObservedAtTime] = useState<string>("");
  const [method, setMethod] = useState<CensusMethod>("direct_observation");
  const [locationLabel, setLocationLabel] = useState("");
  const [weather, setWeather] = useState("");
  const [notes, setNotes] = useState("");
  const [milesSurveyed, setMilesSurveyed] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [species, setSpecies] = useState<SpeciesEntry[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const [propertyCenter, setPropertyCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p?.coordinates?.lat && p?.coordinates?.lng) {
          setPropertyCenter({ lat: p.coordinates.lat, lng: p.coordinates.lng });
        }
      })
      .catch(() => {});
  }, [id]);

  const [showAllMethods, setShowAllMethods] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = useMemo(() => getCategory(selectedCategory), [selectedCategory]);
  const methodOptions = showAllMethods ? CENSUS_METHODS : COMMON_METHODS;

  function setNow() {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setObservedOn(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    );
    setObservedAtTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }

  function toggleSpecies(categoryId: string, speciesId: string) {
    setSpecies((prev) => {
      const idx = prev.findIndex((s) => s.categoryId === categoryId && s.speciesId === speciesId);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { categoryId, speciesId, counts: {}, notes: "" }];
    });
  }

  function updateCount(
    categoryId: string,
    speciesId: string,
    field: SexAgeField,
    value: string
  ) {
    setSpecies((prev) =>
      prev.map((s) =>
        s.categoryId === categoryId && s.speciesId === speciesId
          ? { ...s, counts: { ...s.counts, [field]: value } }
          : s
      )
    );
  }

  function updateSpeciesNotes(categoryId: string, speciesId: string, value: string) {
    setSpecies((prev) =>
      prev.map((s) =>
        s.categoryId === categoryId && s.speciesId === speciesId ? { ...s, notes: value } : s
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      observedOn,
      observedAtTime: observedAtTime || null,
      method,
      locationLabel: locationLabel || null,
      lat: pinCoords?.lat ?? null,
      lng: pinCoords?.lng ?? null,
      weather: weather || null,
      notes: notes || null,
      milesSurveyed: milesSurveyed ? Number(milesSurveyed) : null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      species: species.map((s) => ({
        category: s.categoryId,
        species: s.speciesId,
        countTotal: toNum(s.counts.total),
        countBuck: toNum(s.counts.buck),
        countDoe: toNum(s.counts.doe),
        countFawn: toNum(s.counts.fawn),
        countMale: toNum(s.counts.male),
        countFemale: toNum(s.counts.female),
        countJuvenile: toNum(s.counts.juvenile),
        countUnknown: toNum(s.counts.unknown),
        notes: s.notes || null,
      })),
    };

    try {
      const r = await fetch(`/api/properties/${id}/census`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Failed to save");
      const created = await r.json();
      const newObsId: string = created.id;

      for (const file of pendingFiles) {
        const up = await uploadObservationPhoto(file, newObsId);
        if (!up) continue;
        await fetch(`/api/properties/${id}/census/${newObsId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            url: up.url,
            storagePath: up.path,
            type: file.type.startsWith("image/") ? "photo" : "receipt",
          }),
        });
      }

      router.push(`/properties/${id}/census`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/properties/${id}/census`}
            className="text-sm text-field-forest hover:underline"
          >
            ← Back to census log
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-field-ink mb-6">
          New Census Observation
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white border border-field-wheat rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-field-ink">Session details</h2>
              <button
                type="button"
                onClick={setNow}
                className="text-xs font-medium text-field-forest border border-field-forest/40 rounded-full px-3 py-1 hover:bg-field-forest/10"
              >
                Set to now
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Date *">
                <input
                  type="date"
                  required
                  value={observedOn}
                  onChange={(e) => setObservedOn(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Time">
                <input
                  type="time"
                  value={observedAtTime}
                  onChange={(e) => setObservedAtTime(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Method *">
                <>
                  <select
                    required
                    value={method}
                    onChange={(e) => setMethod(e.target.value as CensusMethod)}
                    className={inputCls}
                  >
                    {methodOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}{m.hint ? ` — ${m.hint}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAllMethods((v) => !v)}
                    className="mt-1 text-xs text-field-forest hover:underline"
                  >
                    {showAllMethods ? "Show common methods only" : "Show all methods"}
                  </button>
                </>
              </Field>
              <Field label="Location / area name">
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g. North feeder, Pasture 2"
                  className={inputCls}
                />
              </Field>
              <Field label="Miles surveyed">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={milesSurveyed}
                  onChange={(e) => setMilesSurveyed(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Duration (minutes)">
                <input
                  type="number"
                  min="0"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-field-ink/70">
                  Pin location on map
                </span>
                {pinCoords && (
                  <button
                    type="button"
                    onClick={() => setPinCoords(null)}
                    className="text-xs text-field-terra hover:underline"
                  >
                    Clear pin
                  </button>
                )}
              </div>
              {propertyCenter ? (
                <>
                  <CensusLocationPicker
                    propertyCenter={propertyCenter}
                    value={pinCoords}
                    onChange={setPinCoords}
                  />
                  <p className="text-xs text-field-ink/60 mt-1">
                    {pinCoords
                      ? `Pinned: ${pinCoords.lat.toFixed(5)}, ${pinCoords.lng.toFixed(5)} — drag to adjust`
                      : "Click the map to drop a pin for this observation."}
                  </p>
                </>
              ) : (
                <div className="h-[120px] w-full flex items-center justify-center bg-field-mist rounded-lg border border-field-wheat">
                  <p className="text-field-ink/60 text-xs">Loading property…</p>
                </div>
              )}
            </div>

            <Field label="Weather / conditions">
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g. Clear, 62°F, light wind"
                className={inputCls}
              />
            </Field>
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={inputCls}
                placeholder="Observations, behavior, habitat conditions…"
              />
            </Field>
          </section>

          <section className="bg-white border border-field-wheat rounded-xl p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-field-ink">Species observed</h2>
              <p className="text-xs text-field-ink/60 mt-1">
                Pick a category, then check the species you saw. Counts are optional but recommended.
              </p>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Field label="Category">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Select a category —</option>
                    {SPECIES_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Link
                href="/guides/hill-country-species"
                className="text-xs font-medium text-field-forest hover:underline pb-2 whitespace-nowrap"
              >
                Help me identify →
              </Link>
            </div>

            {category && (
              <div className="border border-field-wheat/70 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-field-ink/70 uppercase tracking-wide">
                  {category.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.species.map((sp) => {
                    const checked = species.some(
                      (s) => s.categoryId === category.id && s.speciesId === sp.id
                    );
                    return (
                      <label
                        key={sp.id}
                        className="flex items-center gap-2 text-sm text-field-ink cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSpecies(category.id, sp.id)}
                          className="w-4 h-4 accent-field-forest"
                        />
                        {sp.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {species.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-field-ink/70 uppercase tracking-wide">
                  Counts
                </p>
                {species.map((s) => {
                  const cat = getCategory(s.categoryId);
                  if (!cat) return null;
                  const label = cat.species.find((x) => x.id === s.speciesId)?.label;
                  return (
                    <div
                      key={`${s.categoryId}:${s.speciesId}`}
                      className="border border-field-wheat/70 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-field-ink">{label}</p>
                        <button
                          type="button"
                          onClick={() => toggleSpecies(s.categoryId, s.speciesId)}
                          className="text-xs text-field-terra hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {cat.sexAgeFields.map((f) => (
                          <Field key={f} label={fieldLabels[f]}>
                            <input
                              type="number"
                              min="0"
                              value={s.counts[f] || ""}
                              onChange={(e) => updateCount(s.categoryId, s.speciesId, f, e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Field label="Species notes">
                          <input
                            type="text"
                            value={s.notes}
                            onChange={(e) => updateSpeciesNotes(s.categoryId, s.speciesId, e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-white border border-field-wheat rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-field-ink">Photos & evidence</h2>
            {pendingFiles.length > 0 && (
              <ul className="space-y-2">
                {pendingFiles.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between text-sm p-2 bg-field-cream/50 rounded"
                  >
                    <span className="truncate text-field-ink">
                      {file.name}{" "}
                      <span className="text-field-ink/60">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-xs text-field-terra hover:underline ml-3"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <FileUploader
              onUpload={(files) => setPendingFiles((prev) => [...prev, ...files])}
            />
          </section>

          {error && (
            <div className="bg-white border border-field-terra/30 text-field-terra rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save observation"}
            </button>
            <Link
              href={`/properties/${id}/census`}
              className="px-5 py-2.5 text-field-ink/70 font-medium rounded-lg hover:bg-field-mist"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldLabels: Record<SexAgeField, string> = {
  total: "Total",
  buck: "Bucks",
  doe: "Does",
  fawn: "Fawns",
  male: "Males",
  female: "Females",
  juvenile: "Juveniles",
  unknown: "Unknown",
};

const inputCls =
  "w-full px-3 py-2 bg-field-cream border border-field-wheat rounded-lg text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-field-ink/70 mb-1">{label}</span>
      {children}
    </label>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toNum(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
