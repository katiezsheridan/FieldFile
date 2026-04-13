"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CENSUS_METHODS,
  COMMON_METHODS,
  SPECIES_CATEGORIES,
  getCategory,
  getMethodLabel,
  getSpeciesLabel,
  type SexAgeField,
} from "@/lib/census-species";
import type { CensusMethod, CensusObservation } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import CensusLocationPicker from "@/components/census/CensusLocationPickerWrapper";
import { FileUploader } from "@/components/documents/FileUploader";
import { uploadObservationPhoto } from "@/lib/supabase";

type SpeciesEntry = {
  categoryId: string;
  speciesId: string;
  counts: Partial<Record<SexAgeField, string>>;
  notes: string;
};

type ObsDoc = {
  id: string;
  observationId: string;
  type: string;
  name: string;
  url: string;
  storagePath: string;
  uploadedAt: string;
};

export default function CensusObservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const obsId = params.obsId as string;

  const [obs, setObs] = useState<CensusObservation | null>(null);
  const [docs, setDocs] = useState<ObsDoc[]>([]);
  const [propertyCenter, setPropertyCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [observedOn, setObservedOn] = useState("");
  const [observedAtTime, setObservedAtTime] = useState("");
  const [method, setMethod] = useState<CensusMethod>("direct_observation");
  const [locationLabel, setLocationLabel] = useState("");
  const [weather, setWeather] = useState("");
  const [notes, setNotes] = useState("");
  const [milesSurveyed, setMilesSurveyed] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [species, setSpecies] = useState<SpeciesEntry[]>([]);

  const category = useMemo(() => getCategory(selectedCategory), [selectedCategory]);
  const methodOptions = showAllMethods ? CENSUS_METHODS : COMMON_METHODS;

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

  useEffect(() => {
    loadObs();
    loadDocs();
  }, [id, obsId]);

  function loadObs() {
    fetch(`/api/properties/${id}/census/${obsId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to load");
        return r.json();
      })
      .then((o: CensusObservation) => {
        setObs(o);
        hydrateForm(o);
      })
      .catch((e) => setError(e.message));
  }

  function loadDocs() {
    fetch(`/api/properties/${id}/census/${obsId}/documents`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDocs)
      .catch(() => {});
  }

  function hydrateForm(o: CensusObservation) {
    setObservedOn(o.observedOn);
    setObservedAtTime(o.observedAtTime || "");
    setMethod(o.method);
    setLocationLabel(o.locationLabel || "");
    setWeather(o.weather || "");
    setNotes(o.notes || "");
    setMilesSurveyed(o.milesSurveyed != null ? String(o.milesSurveyed) : "");
    setDurationMinutes(o.durationMinutes != null ? String(o.durationMinutes) : "");
    setPinCoords(o.lat != null && o.lng != null ? { lat: o.lat, lng: o.lng } : null);
    setSpecies(
      o.species.map((s) => ({
        categoryId: s.category,
        speciesId: s.species,
        counts: {
          total: s.countTotal?.toString() || "",
          buck: s.countBuck?.toString() || "",
          doe: s.countDoe?.toString() || "",
          fawn: s.countFawn?.toString() || "",
          male: s.countMale?.toString() || "",
          female: s.countFemale?.toString() || "",
          juvenile: s.countJuvenile?.toString() || "",
          unknown: s.countUnknown?.toString() || "",
        },
        notes: s.notes || "",
      }))
    );
  }

  function toggleSpecies(categoryId: string, speciesId: string) {
    setSpecies((prev) => {
      const idx = prev.findIndex((s) => s.categoryId === categoryId && s.speciesId === speciesId);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { categoryId, speciesId, counts: {}, notes: "" }];
    });
  }

  function updateCount(categoryId: string, speciesId: string, field: SexAgeField, value: string) {
    setSpecies((prev) =>
      prev.map((s) =>
        s.categoryId === categoryId && s.speciesId === speciesId
          ? { ...s, counts: { ...s.counts, [field]: value } }
          : s
      )
    );
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
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
      const r = await fetch(`/api/properties/${id}/census/${obsId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Failed to save");
      const updated = await r.json();
      setObs(updated);
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this observation? This cannot be undone.")) return;
    const r = await fetch(`/api/properties/${id}/census/${obsId}`, { method: "DELETE" });
    if (r.ok) router.push(`/properties/${id}/census`);
    else setError("Delete failed");
  }

  async function handleUpload(files: File[]) {
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const up = await uploadObservationPhoto(file, obsId);
        if (!up) throw new Error("Storage upload failed");
        const r = await fetch(`/api/properties/${id}/census/${obsId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            url: up.url,
            storagePath: up.path,
            type: file.type.startsWith("image/") ? "photo" : "receipt",
          }),
        });
        if (!r.ok) throw new Error((await r.json()).error || "Save failed");
      }
      loadDocs();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  if (!obs) {
    return (
      <div className="min-h-screen bg-field-cream p-8">
        <div className="max-w-3xl mx-auto">
          {error ? (
            <div className="bg-white border border-field-terra/30 text-field-terra rounded-lg p-4">{error}</div>
          ) : (
            <div className="animate-pulse h-40 bg-field-wheat/60 rounded-lg" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-field-cream">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/properties/${id}/census`} className="text-sm text-field-forest hover:underline">
            ← Back to census log
          </Link>
          <div className="flex gap-2">
            {!editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm px-3 py-1.5 border border-field-forest/40 text-field-forest rounded-lg hover:bg-field-forest/10"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm px-3 py-1.5 border border-field-terra/40 text-field-terra rounded-lg hover:bg-field-terra/10"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-white border border-field-terra/30 text-field-terra rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {!editing ? (
          <div className="space-y-4">
            <div className="bg-white border border-field-wheat rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-field-ink">{formatDate(obs.observedOn)}</h1>
                {obs.observedAtTime && (
                  <span className="text-sm text-field-ink/60">{obs.observedAtTime.slice(0, 5)}</span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-field-mist text-field-ink/80">
                  {getMethodLabel(obs.method)}
                </span>
              </div>
              {obs.locationLabel && <p className="text-sm text-field-ink/70">{obs.locationLabel}</p>}
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                {obs.weather && <Info label="Weather" value={obs.weather} />}
                {obs.milesSurveyed != null && <Info label="Miles surveyed" value={String(obs.milesSurveyed)} />}
                {obs.durationMinutes != null && <Info label="Duration" value={`${obs.durationMinutes} min`} />}
                {obs.lat != null && obs.lng != null && (
                  <Info label="Pin" value={`${obs.lat.toFixed(5)}, ${obs.lng.toFixed(5)}`} />
                )}
              </div>
              {obs.notes && (
                <div className="mt-3 pt-3 border-t border-field-wheat">
                  <p className="text-xs font-medium text-field-ink/60 mb-1">NOTES</p>
                  <p className="text-sm text-field-ink whitespace-pre-wrap">{obs.notes}</p>
                </div>
              )}
            </div>

            {propertyCenter && obs.lat != null && obs.lng != null && (
              <div className="bg-white border border-field-wheat rounded-xl p-5">
                <h2 className="font-semibold text-field-ink mb-3">Location</h2>
                <CensusLocationPicker
                  propertyCenter={propertyCenter}
                  value={{ lat: obs.lat, lng: obs.lng }}
                  onChange={() => {}}
                />
              </div>
            )}

            {obs.species.length > 0 && (
              <div className="bg-white border border-field-wheat rounded-xl p-5">
                <h2 className="font-semibold text-field-ink mb-3">Species observed</h2>
                <div className="space-y-3">
                  {obs.species.map((s) => (
                    <div key={s.id} className="border border-field-wheat/70 rounded-lg p-3">
                      <p className="text-sm font-medium text-field-ink mb-2">
                        {getSpeciesLabel(s.category, s.species)}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-field-ink/70">
                        {renderCount("Total", s.countTotal)}
                        {renderCount("Bucks", s.countBuck)}
                        {renderCount("Does", s.countDoe)}
                        {renderCount("Fawns", s.countFawn)}
                        {renderCount("Males", s.countMale)}
                        {renderCount("Females", s.countFemale)}
                        {renderCount("Juv.", s.countJuvenile)}
                        {renderCount("Unknown", s.countUnknown)}
                      </div>
                      {s.notes && <p className="text-xs text-field-ink/60 mt-2">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-field-wheat rounded-xl p-5">
              <h2 className="font-semibold text-field-ink mb-3">Photos & evidence</h2>
              {docs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {docs.map((d) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-field-wheat rounded-lg overflow-hidden hover:border-field-forest"
                    >
                      {d.type === "photo" ? (
                        <img src={d.url} alt={d.name} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-field-mist flex items-center justify-center text-xs text-field-ink/60">
                          {d.name}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
              <FileUploader onUpload={handleUpload} />
              {uploading && (
                <p className="text-xs text-field-ink/60 mt-2">Uploading…</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="bg-white border border-field-wheat rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-field-ink">Session details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Date *">
                  <input type="date" required value={observedOn} onChange={(e) => setObservedOn(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Time">
                  <input type="time" value={observedAtTime} onChange={(e) => setObservedAtTime(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Method *">
                  <>
                    <select required value={method} onChange={(e) => setMethod(e.target.value as CensusMethod)} className={inputCls}>
                      {methodOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}{m.hint ? ` — ${m.hint}` : ""}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowAllMethods((v) => !v)} className="mt-1 text-xs text-field-forest hover:underline">
                      {showAllMethods ? "Show common methods only" : "Show all methods"}
                    </button>
                  </>
                </Field>
                <Field label="Location / area name">
                  <input type="text" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Miles surveyed">
                  <input type="number" step="0.1" min="0" value={milesSurveyed} onChange={(e) => setMilesSurveyed(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Duration (minutes)">
                  <input type="number" min="0" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className={inputCls} />
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-field-ink/70">Pin location on map</span>
                  {pinCoords && (
                    <button type="button" onClick={() => setPinCoords(null)} className="text-xs text-field-terra hover:underline">
                      Clear pin
                    </button>
                  )}
                </div>
                {propertyCenter ? (
                  <CensusLocationPicker propertyCenter={propertyCenter} value={pinCoords} onChange={setPinCoords} />
                ) : (
                  <div className="h-[120px] flex items-center justify-center bg-field-mist rounded-lg text-xs text-field-ink/60">
                    Loading property…
                  </div>
                )}
              </div>

              <Field label="Weather / conditions">
                <input type="text" value={weather} onChange={(e) => setWeather(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Notes">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} />
              </Field>
            </section>

            <section className="bg-white border border-field-wheat rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-field-ink">Species observed</h2>
              <Field label="Add category">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputCls}>
                  <option value="">— Select a category —</option>
                  {SPECIES_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </Field>
              {category && (
                <div className="border border-field-wheat/70 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.species.map((sp) => {
                    const checked = species.some((s) => s.categoryId === category.id && s.speciesId === sp.id);
                    return (
                      <label key={sp.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => toggleSpecies(category.id, sp.id)} className="w-4 h-4 accent-field-forest" />
                        {sp.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {species.map((s) => {
                const cat = getCategory(s.categoryId);
                if (!cat) return null;
                const label = cat.species.find((x) => x.id === s.speciesId)?.label;
                return (
                  <div key={`${s.categoryId}:${s.speciesId}`} className="border border-field-wheat/70 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">{label}</p>
                      <button type="button" onClick={() => toggleSpecies(s.categoryId, s.speciesId)} className="text-xs text-field-terra hover:underline">
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {cat.sexAgeFields.map((f) => (
                        <Field key={f} label={fieldLabels[f]}>
                          <input type="number" min="0" value={s.counts[f] || ""} onChange={(e) => updateCount(s.categoryId, s.speciesId, f, e.target.value)} className={inputCls} />
                        </Field>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button onClick={() => { setEditing(false); hydrateForm(obs); }} className="px-5 py-2.5 text-field-ink/70 font-medium rounded-lg hover:bg-field-mist">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldLabels: Record<SexAgeField, string> = {
  total: "Total", buck: "Bucks", doe: "Does", fawn: "Fawns",
  male: "Males", female: "Females", juvenile: "Juveniles", unknown: "Unknown",
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-field-ink/60">{label.toUpperCase()}</p>
      <p className="text-sm text-field-ink">{value}</p>
    </div>
  );
}

function renderCount(label: string, v: number | null | undefined) {
  if (v == null) return null;
  return (
    <span className="px-2 py-0.5 rounded bg-field-mist">
      {label}: <span className="font-semibold">{v}</span>
    </span>
  );
}

function toNum(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
