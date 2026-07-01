"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import {
  OWNER_TYPE,
  REP_BASIS,
  type OwnerType,
  type RepBasis,
  type OwnerBlock,
  type RepresentativeBlock,
  type Form50129Payload,
} from "@/lib/forms/form50129/fieldMap";
import type {
  FilingAnswers,
  MissingField,
  FilingBucket,
} from "@/lib/forms/form50129/buildPayload";

type AssembleResponse = {
  taxYear: number;
  payload: Form50129Payload;
  missing: MissingField[];
  status: "draft" | "ready" | "filed";
  hasPdf: boolean;
  pdfUrl: string | null;
};

const TPWD_PLAN_URL =
  "https://tpwd.texas.gov/landwater/land/private/agricultural_land/";
const CAD_DIRECTORY_URL =
  "https://comptroller.texas.gov/taxes/property-tax/county-directory/";

// County appraisal-district filing addresses we've verified. v1 targets Hays;
// other counties fall back to the Comptroller's CAD directory.
const CAD_ADDRESSES: Record<string, { name: string; address: string; url: string }> = {
  Hays: {
    name: "Hays Central Appraisal District",
    address: "21001 North IH-35, Kyle, TX 78640",
    url: "https://www.hayscad.com",
  },
};

const BUCKET_LABEL: Record<FilingBucket, string> = {
  1: "From your property record",
  2: "Owner profile",
  3: "This year's filing",
};

// ---------------------------------------------------------------------------
// Small field primitives
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-md border border-field-wheat bg-white px-3 py-2 text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/40 focus:border-field-forest";

function TextField(props: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-field-earth mb-1">
        {props.label}
      </span>
      <input
        type="text"
        className={inputCls}
        value={props.value ?? ""}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

function SelectField<T extends string>(props: {
  label: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-field-earth mb-1">
        {props.label}
      </span>
      <select
        className={inputCls}
        value={props.value ?? ""}
        onChange={(e) => props.onChange(e.target.value as T)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Tri-state Yes / No / (unanswered) control for a form yes-no question. */
function YesNo(props: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  const current = props.value === true ? "yes" : props.value === false ? "no" : "";
  return (
    <label className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-sm text-field-ink">{props.label}</span>
      <select
        className="shrink-0 rounded-md border border-field-wheat bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/40"
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          props.onChange(v === "yes" ? true : v === "no" ? false : undefined);
        }}
      >
        <option value="">—</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
}

function ReadOnly(props: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div>
      <span className="block text-sm font-medium text-field-earth mb-1">
        {props.label}
      </span>
      <div className="text-sm text-field-ink">
        {props.value || <span className="text-field-earth/60">—</span>}
      </div>
      {props.hint && <p className="text-xs text-field-earth/70 mt-0.5">{props.hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Answers <-> payload glue
// ---------------------------------------------------------------------------

function payloadToAnswers(p: Form50129Payload): FilingAnswers {
  const w = p.wildlife;
  return {
    section3: {
      allowedLastYear: p.property.allowedLastYear,
      ownershipChangedSinceLastYear: p.property.ownershipChangedSinceLastYear,
      deceasedSurvivingSpouse: p.property.deceasedSurvivingSpouse,
      newOwnerSameUse: p.property.newOwnerSameUse,
      withinCityLimits: p.property.withinCityLimits,
    },
    section4: p.section4,
    section5: w
      ? {
          partOfLargerTract: w.partOfLargerTract,
          managedByAssociation: w.managedByAssociation,
          endangeredHabitat: w.endangeredHabitat,
          esaPermit: w.esaPermit,
          habitatPreserveEasement: w.habitatPreserveEasement,
          conservationProject: w.conservationProject,
        }
      : undefined,
    timber: p.timber,
  };
}

function ownerToProfileInput(owner: OwnerBlock, rep: RepresentativeBlock | null) {
  return {
    type: owner.type,
    typeOther: owner.typeOther ?? null,
    name: owner.name ?? null,
    dateOfBirth: owner.dateOfBirth ?? null,
    physicalAddress: owner.physicalAddress ?? null,
    mailingAddress: owner.mailingAddress ?? null,
    phone: owner.phone ?? null,
    email: owner.email ?? null,
    repBasis: rep?.basis ?? null,
    repBasisOther: rep?.basisOther ?? null,
    repName: rep?.name ?? null,
    repTitle: rep?.title ?? null,
    repPhone: rep?.phone ?? null,
    repEmail: rep?.email ?? null,
    repMailingAddress: rep?.mailingAddress ?? null,
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-field-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-field-forest/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-field-wheat bg-white px-4 py-2.5 text-sm font-medium text-field-ink hover:border-field-forest/50 transition-colors disabled:opacity-60";

export default function Form50129Review({ propertyId }: { propertyId: string }) {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [data, setData] = useState<AssembleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ack, setAck] = useState(false);

  // Editable drafts, seeded whenever a fresh assembly arrives.
  const [owner, setOwner] = useState<OwnerBlock | null>(null);
  const [rep, setRep] = useState<RepresentativeBlock | null>(null);
  const [answers, setAnswers] = useState<FilingAnswers>({});

  const seed = useCallback((res: AssembleResponse) => {
    setData(res);
    setOwner(res.payload.owner);
    setRep(res.payload.representative ?? null);
    setAnswers(payloadToAnswers(res.payload));
  }, []);

  const load = useCallback(
    async (y: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/properties/${propertyId}/form50129?year=${y}`,
        );
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
        seed(await res.json());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [propertyId, seed],
  );

  useEffect(() => {
    load(year);
  }, [load, year]);

  const save = useCallback(async () => {
    if (!owner) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/properties/${propertyId}/form50129`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxYear: year,
          ownerProfile: ownerToProfileInput(owner, rep),
          answers,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      seed(await res.json());
      setAck(false); // any edit invalidates a prior acknowledgement
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [owner, rep, answers, year, propertyId, seed]);

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      // Persist edits first so the generated PDF reflects them.
      await save();
      const res = await fetch(
        `/api/properties/${propertyId}/form50129/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taxYear: year }),
        },
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to generate");
      const gen = await res.json();
      setData((d) =>
        d ? { ...d, status: gen.status, hasPdf: true, pdfUrl: gen.pdfUrl } : d,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }, [save, propertyId, year]);

  const isEntity = owner ? owner.type !== "individual" : false;

  const cad = useMemo(() => {
    const county = data?.payload.appraisalDistrictCounty ?? "";
    return CAD_ADDRESSES[county] ?? null;
  }, [data]);

  if (loading && !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded bg-field-mist" />
        <div className="h-40 rounded bg-field-mist" />
        <div className="h-40 rounded bg-field-mist" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-lg border border-field-terra/40 bg-field-terra/5 p-4 text-field-terra">
        {error}
      </div>
    );
  }
  if (!data || !owner) return null;

  const p = data.payload;
  const s3 = answers.section3 ?? {};
  const s5 = answers.section5 ?? {};
  const timber = answers.timber ?? {};

  const setS3 = (patch: Partial<NonNullable<FilingAnswers["section3"]>>) =>
    setAnswers((a) => ({ ...a, section3: { ...a.section3, ...patch } }));
  const setS5 = (patch: Partial<NonNullable<FilingAnswers["section5"]>>) =>
    setAnswers((a) => ({ ...a, section5: { ...a.section5, ...patch } }));
  const setTimber = (patch: Partial<NonNullable<FilingAnswers["timber"]>>) =>
    setAnswers((a) => ({ ...a, timber: { ...a.timber, ...patch } }));

  const missingByBucket = (b: FilingBucket) =>
    data.missing.filter((m) => m.bucket === b);

  return (
    <div className="space-y-5">
      {/* Header: year + status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-field-earth">Tax year</label>
          <select
            className="rounded-md border border-field-wheat bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-field-forest/40"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year + 1, year, year - 1, year - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            data.status === "ready"
              ? "bg-field-forest/10 text-field-forest"
              : "bg-field-mist text-field-earth",
          )}
        >
          {data.status === "ready" ? "Ready to review & file" : "Draft"}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-field-terra/40 bg-field-terra/5 p-3 text-sm text-field-terra">
          {error}
        </div>
      )}

      {/* What still needs attention */}
      {data.missing.length > 0 && (
        <div className="rounded-lg border border-field-gold/50 bg-field-gold/10 p-4">
          <p className="text-sm font-semibold text-field-ink">
            {data.missing.length} field{data.missing.length === 1 ? "" : "s"} still
            need attention
          </p>
          <ul className="mt-2 space-y-1 text-sm text-field-earth">
            {([2, 1, 3] as FilingBucket[]).map((b) => {
              const items = missingByBucket(b);
              if (items.length === 0) return null;
              return (
                <li key={b}>
                  <span className="font-medium text-field-ink">
                    {BUCKET_LABEL[b]}:
                  </span>{" "}
                  {items.map((m) => m.label).join("; ")}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Section 1: Owner */}
      <CollapsibleSection title="Section 1 · Property owner">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField<OwnerType>
            label="Type of owner"
            value={owner.type}
            options={(Object.keys(OWNER_TYPE) as OwnerType[]).map((k) => ({
              value: k,
              label: OWNER_TYPE[k],
            }))}
            onChange={(v) => setOwner({ ...owner, type: v })}
          />
          {owner.type === "other" && (
            <TextField
              label="Specify owner type"
              value={owner.typeOther}
              onChange={(v) => setOwner({ ...owner, typeOther: v })}
            />
          )}
          <TextField
            label="Name of property owner"
            value={owner.name}
            onChange={(v) => setOwner({ ...owner, name: v })}
          />
          {owner.type === "individual" && (
            <TextField
              label="Date of birth"
              value={owner.dateOfBirth}
              placeholder="MM/DD/YYYY"
              onChange={(v) => setOwner({ ...owner, dateOfBirth: v })}
            />
          )}
          <TextField
            label="Physical address, city, state, ZIP"
            value={owner.physicalAddress}
            onChange={(v) => setOwner({ ...owner, physicalAddress: v })}
          />
          <TextField
            label="Mailing address (if different)"
            value={owner.mailingAddress}
            onChange={(v) => setOwner({ ...owner, mailingAddress: v })}
          />
          <TextField
            label="Primary phone"
            value={owner.phone}
            onChange={(v) => setOwner({ ...owner, phone: v })}
          />
          <TextField
            label="Email"
            value={owner.email}
            onChange={(v) => setOwner({ ...owner, email: v })}
          />
        </div>
      </CollapsibleSection>

      {/* Section 2: Authorized representative (entities only) */}
      {isEntity && (
        <CollapsibleSection title="Section 2 · Authorized representative">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField<RepBasis>
              label="Basis for authority"
              value={rep?.basis ?? "officer"}
              options={(Object.keys(REP_BASIS) as RepBasis[]).map((k) => ({
                value: k,
                label: REP_BASIS[k],
              }))}
              onChange={(v) =>
                setRep({ ...(rep ?? { basis: v }), basis: v })
              }
            />
            {rep?.basis === "other" && (
              <TextField
                label="Explain basis"
                value={rep?.basisOther}
                onChange={(v) => setRep({ ...(rep ?? { basis: "other" }), basisOther: v })}
              />
            )}
            <TextField
              label="Representative name"
              value={rep?.name}
              onChange={(v) => setRep({ ...(rep ?? { basis: "officer" }), name: v })}
            />
            <TextField
              label="Title"
              value={rep?.title}
              onChange={(v) => setRep({ ...(rep ?? { basis: "officer" }), title: v })}
            />
            <TextField
              label="Representative phone"
              value={rep?.phone}
              onChange={(v) => setRep({ ...(rep ?? { basis: "officer" }), phone: v })}
            />
            <TextField
              label="Representative email"
              value={rep?.email}
              onChange={(v) => setRep({ ...(rep ?? { basis: "officer" }), email: v })}
            />
            <TextField
              label="Representative mailing address"
              value={rep?.mailingAddress}
              onChange={(v) =>
                setRep({ ...(rep ?? { basis: "officer" }), mailingAddress: v })
              }
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Section 3: Property description + branch questions */}
      <CollapsibleSection title="Section 3 · Property description">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnly label="Appraisal district's county" value={p.appraisalDistrictCounty} />
          <ReadOnly
            label="Appraisal district account number"
            value={p.property.accountNumber}
            hint="Edit on the property page"
          />
          <ReadOnly label="Number of acres" value={String(p.property.numberOfAcres ?? "")} />
          <ReadOnly
            label="Legal description"
            value={p.property.legalDescription}
            hint="Edit on the property page"
          />
        </div>
        <div className="mt-4 divide-y divide-field-wheat/60 border-t border-field-wheat/60">
          <YesNo
            label="Was 1-d-1 appraisal allowed on this property last year? (Yes = renewal)"
            value={s3.allowedLastYear}
            onChange={(v) => setS3({ allowedLastYear: v })}
          />
          <YesNo
            label="Has ownership changed since Jan 1 of last year?"
            value={s3.ownershipChangedSinceLastYear}
            onChange={(v) => setS3({ ownershipChangedSinceLastYear: v })}
          />
          <YesNo
            label="Has the former owner passed away and are you the surviving spouse?"
            value={s3.deceasedSurvivingSpouse}
            onChange={(v) => setS3({ deceasedSurvivingSpouse: v })}
          />
          {s3.ownershipChangedSinceLastYear === true && (
            <YesNo
              label="Is the new owner using the land the same way, overseen by the same people?"
              value={s3.newOwnerSameUse}
              onChange={(v) => setS3({ newOwnerSameUse: v })}
            />
          )}
          <YesNo
            label="Is this property within the corporate limits of a city or town?"
            value={s3.withinCityLimits}
            onChange={(v) => setS3({ withinCityLimits: v })}
          />
        </div>
      </CollapsibleSection>

      {/* Section 4: Ag-use history */}
      <CollapsibleSection title="Section 4 · Agricultural use history" defaultOpen={false}>
        <Section4Editor
          history={answers.section4?.history ?? []}
          onChange={(history) =>
            setAnswers((a) => ({ ...a, section4: { ...a.section4, history } }))
          }
        />
      </CollapsibleSection>

      {/* Section 5: Wildlife management */}
      {p.wildlife ? (
        <CollapsibleSection title="Section 5 · Wildlife management">
          <div className="space-y-3">
            <ReadOnly
              label="Management practices (from your wildlife plan)"
              value={
                <ul className="list-disc pl-5 space-y-0.5">
                  {p.wildlife.practices.map((pr, i) => (
                    <li key={i}>{pr}</li>
                  ))}
                </ul>
              }
              hint="Edit these in the wildlife plan"
            />
            <ReadOnly
              label="Category of use prior to conversion"
              value={p.wildlife.priorUseCategory}
              hint="Set in the wildlife plan"
            />
          </div>
          <div className="mt-4 divide-y divide-field-wheat/60 border-t border-field-wheat/60">
            <YesNo
              label="Part of a larger qualified tract on Jan 1 of last year?"
              value={s5.partOfLargerTract}
              onChange={(v) => setS5({ partOfLargerTract: v })}
            />
            <YesNo
              label="Managed through a wildlife management property association?"
              value={s5.managedByAssociation}
              onChange={(v) => setS5({ managedByAssociation: v })}
            />
            <YesNo
              label="Designated habitat for an endangered/threatened species?"
              value={s5.endangeredHabitat}
              onChange={(v) => setS5({ endangeredHabitat: v })}
            />
            <YesNo
              label="Subject to a federal Endangered Species Act permit?"
              value={s5.esaPermit}
              onChange={(v) => setS5({ esaPermit: v })}
            />
            {s5.esaPermit === true && (
              <YesNo
                label="Included in a habitat preserve under a conservation easement / HCP?"
                value={s5.habitatPreserveEasement}
                onChange={(v) => setS5({ habitatPreserveEasement: v })}
              />
            )}
          </div>
        </CollapsibleSection>
      ) : (
        <CollapsibleSection title="Section 5 · Wildlife management">
          <p className="text-sm text-field-earth">
            This property has no wildlife plan for {year} yet, so Section 5 is
            blank.{" "}
            <Link
              href={`/properties/${propertyId}`}
              className="text-field-forest underline"
            >
              Build the wildlife plan
            </Link>{" "}
            to populate the practices and prior-use category.
          </p>
        </CollapsibleSection>
      )}

      {/* Section 6: Timber conversion */}
      <CollapsibleSection title="Section 6 · Conversion to timber" defaultOpen={false}>
        <div className="divide-y divide-field-wheat/60">
          <YesNo
            label="Was the land converted to timber production after Sept 1, 1997?"
            value={timber.convertedAfter1997}
            onChange={(v) => setTimber({ convertedAfter1997: v })}
          />
          {timber.convertedAfter1997 === true && (
            <>
              <div className="py-2">
                <TextField
                  label="Date converted to timber production"
                  value={timber.conversionDate}
                  onChange={(v) => setTimber({ conversionDate: v })}
                />
              </div>
              <YesNo
                label="Do you want the land to keep 1-d-1 appraisal?"
                value={timber.continueAs1d1}
                onChange={(v) => setTimber({ continueAs1d1: v })}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Section 7: Certification */}
      <CollapsibleSection title="Section 7 · Certification" defaultOpen={false}>
        <ReadOnly
          label="Printed name of person certifying"
          value={p.certification?.printedName}
        />
        <p className="mt-3 text-sm text-field-earth">
          The signature and date are intentionally left blank. You sign and date
          the printed form by hand.
        </p>
      </CollapsibleSection>

      {/* Save */}
      <div className="flex flex-wrap items-center gap-3">
        <button className={secondaryBtn} onClick={save} disabled={saving || generating}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button className={primaryBtn} onClick={generate} disabled={saving || generating}>
          {generating ? "Generating…" : data.hasPdf ? "Regenerate PDF" : "Generate PDF"}
        </button>
      </div>

      {/* Sworn-application notice + preview + gated download */}
      {data.hasPdf && data.pdfUrl && (
        <div className="space-y-4 rounded-lg border border-field-wheat bg-white p-5">
          <div className="rounded-lg border border-field-terra/40 bg-field-terra/5 p-4">
            <h3 className="text-base font-semibold text-field-ink">
              Before you file — this is a sworn application
            </h3>
            <p className="mt-1.5 text-sm text-field-earth">
              FieldFile prepared this form; it does <strong>not</strong> file for
              you. Section 7 is a sworn statement — a false statement is a criminal
              offense under Texas Penal Code 37.10.{" "}
              <strong>Review every field</strong>, then print, sign, date, and file
              it yourself with your county appraisal district. The signature and
              date are intentionally blank.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-field-earth">
              <li>
                • Attach your TPWD wildlife management plan (Section 5 requires it):{" "}
                <a
                  href={TPWD_PLAN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-field-forest underline"
                >
                  TPWD forms
                </a>
              </li>
              <li>
                • File with{" "}
                {cad ? (
                  <>
                    <a
                      href={cad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-field-forest underline"
                    >
                      {cad.name}
                    </a>
                    {" — "}
                    {cad.address}
                  </>
                ) : (
                  <>
                    your county appraisal district (
                    <a
                      href={CAD_DIRECTORY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-field-forest underline"
                    >
                      find your CAD
                    </a>
                    ). Deadline: before May 1 of the tax year.
                  </>
                )}
              </li>
            </ul>
          </div>

          {/* Inline preview */}
          <iframe
            title="Form 50-129 preview"
            src={data.pdfUrl}
            className="h-[600px] w-full rounded-md border border-field-wheat"
          />

          {/* Non-skippable acknowledgement gating the download */}
          <label className="flex items-start gap-2 text-sm text-field-ink">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>
              I understand I must review every field, then sign and file this
              application with the county myself.
            </span>
          </label>
          <a
            href={ack ? data.pdfUrl : undefined}
            download={`Form-50-129-${year}.pdf`}
            aria-disabled={!ack}
            className={cn(primaryBtn, !ack && "pointer-events-none opacity-60")}
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 4 editor — up to 8 year rows (current + 7 prior)
// ---------------------------------------------------------------------------

type AgRow = { category: string; acres: string | number };

function Section4Editor(props: {
  history: AgRow[];
  onChange: (rows: AgRow[]) => void;
}) {
  const label = (i: number) => (i === 0 ? "Current" : String(i));
  // Fixed 8-slot working view; edits keep their row position (only trailing
  // empty rows are trimmed, so an empty row above a filled one never collapses).
  const working: AgRow[] = Array.from({ length: 8 }).map(
    (_, i) => props.history[i] ?? { category: "", acres: "" },
  );

  const update = (i: number, patch: Partial<AgRow>) => {
    const next = working.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    let end = next.length;
    while (end > 0 && next[end - 1].category === "" && String(next[end - 1].acres) === "") {
      end--;
    }
    props.onChange(next.slice(0, end));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-field-earth">
        Current year first, then back through prior years (up to seven). Use the
        agricultural land-use categories from the form (e.g. Wildlife management,
        Native pastureland, Dry cropland).
      </p>
      {working.map((row, i) => {
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-field-earth">
              {label(i)}
            </span>
            <input
              className={inputCls}
              placeholder="Agricultural use category"
              value={row.category}
              onChange={(e) => update(i, { category: e.target.value })}
            />
            <input
              className={cn(inputCls, "w-28 shrink-0")}
              placeholder="Acres"
              value={String(row.acres ?? "")}
              onChange={(e) => update(i, { acres: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
