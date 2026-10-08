"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PRACTICE_DEFS, SUB_ACTIVITY_BY_CODE } from "@/lib/sub-activities";
import { containerHref, gapContainerId } from "@/lib/annual-report/links";
import type { ReportGap } from "@/lib/annual-report/gap-analysis";
import type { BlankBasis, ReportBlank } from "@/lib/annual-report/pwd888/combine";
import type { AnnualReportPatch, PartIInput } from "@/lib/annual-report/pwd888/questions";
import type { Pwd888Assembly, Pwd888Entry, Pwd888Exhibit } from "@/lib/annual-report/pwd888/types";
import type { FieldValue } from "@/lib/types";

/**
 * Review the assembled PWD-888 before it is rendered.
 *
 * Shows what we already filled in, asks only what is still open, and sends
 * anything that has to be fixed at the source (an undated activity, a census
 * with no counts) back to that record. Nothing here is saved until the
 * landowner presses a button: a pre-selected proposal is a suggestion, not an
 * answer (CLAUDE.md > "Propose, do not assert").
 */

type ReviewResponse = Pwd888Assembly & {
  taxYear: number;
  blockingCount: number;
  ready: boolean;
  /** Signed URL of the last generated PDF for this year, if any. */
  pdfUrl: string | null;
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-03-04" → "Mar 4, 2026", parsed as a calendar date (no timezone shift). */
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtValue(v: FieldValue, unit?: string): string {
  if (v === null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return unit ? `${v} ${unit}` : String(v);
  if (typeof v === "string") return ISO_DATE.test(v) ? fmtDate(v) : v;
  if (Array.isArray(v)) return v.map((x) => (ISO_DATE.test(x) ? fmtDate(x) : x)).join(", ");
  return [v.from, v.to].filter(Boolean).map((x) => fmtDate(x!)).join(" – ");
}

const BASIS_LABEL: Record<BlankBasis, string | null> = {
  entered: null,
  combined: "combined",
  derived: "from your records",
  answered: "your answer",
};

function basisNote(b: ReportBlank): string | null {
  if (b.basis === "combined") return `combined from ${b.sourceIds.length} activities`;
  return BASIS_LABEL[b.basis];
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-md border border-field-wheat bg-white px-3 py-2 text-sm text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/40 focus:border-field-forest";
const primaryBtn =
  "inline-flex items-center rounded-md bg-field-forest px-4 py-2 text-sm font-medium text-white hover:bg-field-forest/90 disabled:opacity-50";

function Card(props: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-field-wheat bg-white p-5">
      <h3 className="text-base font-semibold text-field-ink">{props.title}</h3>
      {props.subtitle && <p className="mt-0.5 text-sm text-field-earth">{props.subtitle}</p>}
      <div className="mt-4">{props.children}</div>
    </section>
  );
}

function Field(props: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", props.className)}>
      <span className="mb-1 block text-sm font-medium text-field-earth">{props.label}</span>
      {props.children}
    </label>
  );
}

function ChoiceButton(props: {
  selected: boolean;
  suggested?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "rounded-md border px-4 py-2 text-sm font-medium",
        props.selected
          ? "border-field-forest bg-field-forest text-white"
          : props.suggested
            ? "border-field-forest border-dashed bg-white text-field-forest"
            : "border-field-wheat bg-white text-field-ink hover:border-field-forest"
      )}
    >
      {props.children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function AnnualReportReview({
  propertyId,
  initialYear,
}: {
  propertyId: string;
  initialYear: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    fetch(`/api/properties/${propertyId}/annual-report?year=${year}`)
      .then(async (r) => {
        const body = await r.json();
        if (!active) return;
        if (!r.ok) setError(body.error ?? "Could not load the report");
        else setData(body);
      })
      .catch(() => active && setError("Could not load the report"));
    return () => {
      active = false;
    };
  }, [propertyId, year]);

  /** Save, then show the re-assembled report the server sends back. */
  const save = useCallback(
    async (what: string, patch: Omit<AnnualReportPatch, "taxYear">) => {
      setSaving(what);
      setError(null);
      try {
        const r = await fetch(`/api/properties/${propertyId}/annual-report`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...patch, taxYear: year }),
        });
        const body = await r.json();
        if (!r.ok) setError(body.error ?? "Could not save");
        else setData(body);
      } catch {
        setError("Could not save");
      } finally {
        setSaving(null);
      }
    },
    [propertyId, year]
  );

  const thisYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[thisYear, thisYear - 1].map((y) => (
          <ChoiceButton key={y} selected={y === year} onClick={() => setYear(y)}>
            {y}
          </ChoiceButton>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-field-terra/40 bg-field-terra/5 px-4 py-3 text-sm text-field-terra">
          {error}
        </p>
      )}

      {!data ? (
        !error && <div className="h-32 animate-pulse rounded-lg bg-field-wheat/50" />
      ) : (
        <>
          <Summary data={data} />
          <Questions data={data} saving={saving} save={save} />
          <FixList data={data} propertyId={propertyId} />
          <Preview data={data} />
          <Generate data={data} propertyId={propertyId} />
          <p className="text-sm text-field-earth">
            FieldFile prepares the report. You review it, sign it, and submit it
            to your county appraisal district — not to Texas Parks and Wildlife.
          </p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function Summary({ data }: { data: ReviewResponse }) {
  const { analysis, blockingCount, ready } = data;
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        ready ? "border-field-forest/40 bg-field-forest/5" : "border-field-wheat bg-white"
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-field-ink">
          {ready ? "Ready to generate" : `${blockingCount} thing${blockingCount === 1 ? "" : "s"} to settle`}
        </h2>
        <span
          className={cn(
            "text-sm font-medium",
            analysis.meetsMinimum ? "text-field-forest" : "text-field-terra"
          )}
        >
          {analysis.qualifyingPractices} of 3 required practices documented
        </span>
      </div>
      <p className="mt-1 text-sm text-field-earth">
        {ready
          ? "Everything the form needs is in place. Review the preview below."
          : "Answer the questions below and fix the records listed, and the report fills itself in."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Questions: Part I, Part III, conflicts
// ---------------------------------------------------------------------------

type SaveFn = (what: string, patch: Omit<AnnualReportPatch, "taxYear">) => Promise<void>;

function Questions(props: { data: ReviewResponse; saving: string | null; save: SaveFn }) {
  return (
    <div className="space-y-4">
      <PartIForm {...props} />
      <PartIIIForm {...props} />
      {props.data.conflicts.map((c) => (
        <ConflictForm key={`${c.subActivityCode}.${c.key}`} conflict={c} {...props} />
      ))}
    </div>
  );
}

/** Best-effort split of "City, ST 12345" for editing; free text otherwise. */
function parseCityLine(line: string | null) {
  const m = /^(.*?),\s*([A-Za-z]{2})\.?\s+(\d{5}(?:-\d{4})?)$/.exec(line ?? "");
  return m ? { city: m[1], state: m[2], zip: m[3] } : { city: line ?? "", state: "TX", zip: "" };
}

function PartIForm({ data, saving, save }: { data: ReviewResponse; saving: string | null; save: SaveFn }) {
  const p = data.payload.partI;
  const initial = () => ({
    ownerName: p.ownerName ?? "",
    street: p.mailingAddress ?? "",
    ...parseCityLine(p.cityStateZip),
    phone: p.phone ?? "",
    accountNumber: p.accountNumber ?? "",
    additionalCounties: p.additionalCounties ?? "",
  });
  const [f, setF] = useState(initial);
  useEffect(() => setF(initial()), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: keyof ReturnType<typeof initial>) => (e: { target: { value: string } }) =>
    setF((x) => ({ ...x, [k]: e.target.value }));

  const openGaps = data.gaps.filter((g) => g.section === "Part I");
  const countiesAnswered = !data.gaps.some((g) => g.key === "identity.additionalCounties");

  const submit = () => {
    const partI: PartIInput = {
      ownerName: f.ownerName,
      phone: f.phone,
      accountNumber: f.accountNumber,
      mailingAddress: { street: f.street, city: f.city, state: f.state, zip: f.zip },
    };
    save("partI", { partI, answers: { "identity.additionalCounties": f.additionalCounties } });
  };

  return (
    <Card
      title="Part I — Owner information"
      subtitle={
        openGaps.length
          ? `${openGaps.length} item${openGaps.length === 1 ? "" : "s"} missing. Saved once and reused every year, and on your 1-d-1 application.`
          : "Saved once and reused every year. Check it is still current."
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Owner's name">
          <input className={inputCls} value={f.ownerName} onChange={set("ownerName")} />
        </Field>
        <Field label="Appraisal district account number">
          <input className={inputCls} value={f.accountNumber} onChange={set("accountNumber")} />
        </Field>
        <Field label="Mailing address (street)" className="sm:col-span-2">
          <input className={inputCls} value={f.street} onChange={set("street")} />
        </Field>
        <div className="grid grid-cols-[1fr_4rem_6rem] gap-2 sm:col-span-2">
          <Field label="City">
            <input className={inputCls} value={f.city} onChange={set("city")} />
          </Field>
          <Field label="State">
            <input className={inputCls} value={f.state} maxLength={2} onChange={set("state")} />
          </Field>
          <Field label="ZIP">
            <input className={inputCls} value={f.zip} inputMode="numeric" onChange={set("zip")} />
          </Field>
        </div>
        <Field label="Phone number">
          <input className={inputCls} value={f.phone} inputMode="tel" onChange={set("phone")} />
        </Field>
        <Field label="Additional counties, if any">
          <input
            className={inputCls}
            value={f.additionalCounties}
            placeholder={countiesAnswered ? "None" : "Leave blank if none"}
            onChange={set("additionalCounties")}
          />
        </Field>
      </div>
      <p className="mt-3 text-xs text-field-earth">
        Tract name ({p.tractName ?? "—"}) and majority county ({p.majorityCounty ?? "—"}) come
        from the property record.
      </p>
      <div className="mt-4">
        <button type="button" className={primaryBtn} disabled={saving === "partI"} onClick={submit}>
          {saving === "partI" ? "Saving…" : "Save owner information"}
        </button>
      </div>
    </Card>
  );
}

function PartIIIForm({ data, saving, save }: { data: ReviewResponse; saving: string | null; save: SaveFn }) {
  const { member, associationName } = data.payload.partIII;
  const proposal = data.proposals.find((p) => p.key === "association.member");
  const [choice, setChoice] = useState<boolean | null>(member);
  const [name, setName] = useState(associationName ?? "");
  useEffect(() => {
    setChoice(member);
    setName(associationName ?? "");
  }, [member, associationName]);

  const suggested = member === null && proposal ? (proposal.value as boolean) : null;
  const dirty = choice !== member || (choice === true && name !== (associationName ?? ""));

  return (
    <Card
      title="Part III — Wildlife management association"
      subtitle={
        member === null
          ? "Not answered yet. Asked once; you'll only need to confirm it next year."
          : "Answered. Change it if your membership has changed."
      }
    >
      {suggested !== null && choice === null && (
        <p className="mb-3 text-sm text-field-earth">
          Your 1-d-1 application says you {suggested ? "are" : "are not"} managed through an
          association. Tap to confirm, or choose the other answer.
        </p>
      )}
      <p className="mb-2 text-sm text-field-ink">
        Are you a member of a wildlife management property association?
      </p>
      <div className="flex gap-2">
        <ChoiceButton selected={choice === true} suggested={suggested === true} onClick={() => setChoice(true)}>
          Yes
        </ChoiceButton>
        <ChoiceButton selected={choice === false} suggested={suggested === false} onClick={() => setChoice(false)}>
          No
        </ChoiceButton>
      </div>
      {choice === true && (
        <Field label="Association name" className="mt-4">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      )}
      <div className="mt-4">
        <button
          type="button"
          className={primaryBtn}
          disabled={choice === null || !dirty || saving === "partIII" || (choice && !name.trim())}
          onClick={() =>
            save("partIII", {
              answers: {
                "association.member": choice,
                "association.name": choice ? name.trim() : null,
              },
            })
          }
        >
          {saving === "partIII" ? "Saving…" : "Save answer"}
        </button>
      </div>
    </Card>
  );
}

function ConflictForm({
  conflict,
  data,
  saving,
  save,
}: {
  conflict: ReviewResponse["conflicts"][number];
  data: ReviewResponse;
  saving: string | null;
  save: SaveFn;
}) {
  const sub = SUB_ACTIVITY_BY_CODE[conflict.subActivityCode];
  const unit = sub?.fields.find((f) => f.key === conflict.key)?.unit;
  const key = `partIV.${conflict.subActivityCode}.${conflict.key}`;
  const [pick, setPick] = useState<number | null>(null);

  return (
    <Card
      title={`Part IV — ${sub?.name ?? conflict.subActivityCode}`}
      subtitle={`Your activities this year give different answers for “${conflict.formLabel}”. The form has one blank — choose what applied in ${data.taxYear}.`}
    >
      <div className="space-y-2">
        {conflict.values.map((v, i) => (
          <label key={i} className="flex items-start gap-3 text-sm text-field-ink">
            <input
              type="radio"
              name={key}
              checked={pick === i}
              onChange={() => setPick(i)}
              className="mt-0.5 accent-field-forest"
            />
            <span>
              <span className="font-medium">{fmtValue(v.value, unit)}</span>
              <span className="text-field-earth"> — on {v.performedOn.map(fmtDate).join(", ")}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-4">
        <button
          type="button"
          className={primaryBtn}
          disabled={pick === null || saving === key}
          onClick={() => save(key, { answers: { [key]: conflict.values[pick!].value } })}
        >
          {saving === key ? "Saving…" : "Use this answer"}
        </button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Fix in your records
// ---------------------------------------------------------------------------

/**
 * Gaps the questionnaire cannot close, because the fix belongs on the record:
 * a container with no date, no sub-activity, no evidence, or a blank the form
 * asks for. Part I and III gaps and conflicts are answered above instead.
 */
function FixList({ data, propertyId }: { data: ReviewResponse; propertyId: string }) {
  const answeredAbove = (g: ReportGap) =>
    g.section === "Part I" || g.section === "Part III" || g.key.endsWith(".conflict");
  const gaps = data.gaps.filter((g) => !answeredAbove(g));
  if (gaps.length === 0) return null;

  const entryFor = (code: string) => data.payload.partIV.find((e) => e.code === code);
  const hrefFor = (g: ReportGap): string | null => {
    const cid = gapContainerId(g.key);
    if (cid) return containerHref(propertyId, cid);
    const m = /^report\.([A-Z]{2}-\d{2})\./.exec(g.key);
    const first = m ? entryFor(m[1])?.containerIds[0] : undefined;
    return first ? containerHref(propertyId, first) : null;
  };

  return (
    <Card
      title="Fix in your records"
      subtitle="These are fixed on the activity or census entry itself, so the change carries everywhere."
    >
      <ul className="space-y-2">
        {gaps.map((g) => {
          const href = hrefFor(g);
          const dot = (
            <span
              aria-hidden
              className={cn(
                "mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                g.severity === "blocking" ? "bg-field-terra" : "bg-field-gold"
              )}
            />
          );
          const text = (
            <span>
              <span className="mr-1.5 text-xs text-field-earth">{g.section}</span>
              {g.label}
            </span>
          );
          return (
            <li key={g.key} className="flex items-start gap-2 text-sm text-field-ink">
              {dot}
              {href ? (
                <Link href={href} className="hover:underline">
                  {text}
                </Link>
              ) : (
                text
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

/**
 * Draw the report onto the TPWD form. Allowed before it is ready — the PDF is
 * then stamped DRAFT on every page — so the landowner can see where it stands.
 */
function Generate({ data, propertyId }: { data: ReviewResponse; propertyId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; draft: boolean } | null>(null);
  const url = result?.url ?? data.pdfUrl;

  const generate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/properties/${propertyId}/annual-report/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxYear: data.taxYear }),
      });
      const body = await r.json();
      if (!r.ok || !body.pdfUrl) setErr(body.error ?? "Could not generate the PDF");
      else setResult({ url: body.pdfUrl, draft: body.draft });
    } catch {
      setErr("Could not generate the PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Generate the PDF"
      subtitle={
        data.ready
          ? "Fills the official TPWD form, with your photos and census sheets attached as exhibits."
          : "You can generate it now to see where it stands — every page will be marked DRAFT until the items above are settled."
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={primaryBtn} disabled={busy} onClick={generate}>
          {busy ? "Generating…" : data.ready ? "Generate PDF" : "Generate draft PDF"}
        </button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-field-forest hover:underline"
          >
            Open {result ? (result.draft ? "draft " : "") : "last generated "}PDF →
          </a>
        )}
      </div>
      {err && <p className="mt-3 text-sm text-field-terra">{err}</p>}
      {url && (
        <p className="mt-3 text-xs text-field-earth">
          Regenerate after any change — the PDF does not update itself. The link expires after an hour.
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

function Preview({ data }: { data: ReviewResponse }) {
  const f = data.payload;
  const row = (label: string, value: string | null) => (
    <div className="flex justify-between gap-4 border-b border-field-mist py-1.5 text-sm">
      <span className="text-field-earth">{label}</span>
      <span className={cn("text-right", value ? "text-field-ink" : "text-field-terra")}>
        {value || "missing"}
      </span>
    </div>
  );

  return (
    <section className="rounded-lg border border-field-wheat bg-white p-5">
      <h3 className="text-base font-semibold text-field-ink">Report preview — PWD-888 for {f.years}</h3>
      <p className="mt-0.5 text-sm text-field-earth">What will be printed on the form.</p>

      <h4 className="mt-5 text-sm font-semibold text-field-ink">Part I. Owner information</h4>
      {row("Account number", f.partI.accountNumber)}
      {row("Owner's name", f.partI.ownerName)}
      {row("Current mailing address", f.partI.mailingAddress)}
      {row("City, state and zip", f.partI.cityStateZip)}
      {row("Phone number", f.partI.phone)}
      {row("Tract name", f.partI.tractName)}
      {row("Majority county", f.partI.majorityCounty)}
      <div className="flex justify-between gap-4 border-b border-field-mist py-1.5 text-sm">
        <span className="text-field-earth">Additional counties</span>
        <span className="text-field-ink">{f.partI.additionalCounties || "None"}</span>
      </div>

      <h4 className="mt-5 text-sm font-semibold text-field-ink">Part II. Qualifying practices</h4>
      <ul className="mt-1 grid gap-1 sm:grid-cols-2">
        {PRACTICE_DEFS.map((p) => (
          <li key={p.code} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px]",
                f.partII[p.code] ? "border-field-forest bg-field-forest text-white" : "border-field-wheat"
              )}
            >
              {f.partII[p.code] ? "✓" : ""}
            </span>
            <span className={f.partII[p.code] ? "text-field-ink" : "text-field-ink/50"}>{p.name}</span>
          </li>
        ))}
      </ul>

      <h4 className="mt-5 text-sm font-semibold text-field-ink">Part III. Association membership</h4>
      <p className="text-sm text-field-ink">
        {f.partIII.member === null
          ? <span className="text-field-terra">Not answered</span>
          : f.partIII.member
            ? `Yes — ${f.partIII.associationName ?? ""}`
            : "No"}
      </p>

      <h4 className="mt-5 text-sm font-semibold text-field-ink">Part IV. Activities</h4>
      {f.partIV.length === 0 ? (
        <p className="text-sm text-field-earth">No documented activities yet for {f.years}.</p>
      ) : (
        <div className="mt-1 space-y-3">
          {f.partIV.map((e) => (
            <EntryPreview key={e.code} entry={e} />
          ))}
        </div>
      )}

      <h4 className="mt-5 text-sm font-semibold text-field-ink">Part V. Supporting documentation</h4>
      {f.partV.length === 0 ? (
        <p className="text-sm text-field-earth">No exhibits yet.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {f.partV.map((x) => (
            <ExhibitRow key={x.id} exhibit={x} />
          ))}
        </ul>
      )}

      <p className="mt-5 border-t border-field-mist pt-3 text-xs text-field-earth">
        The certification, signature and date are left blank for you to sign.
      </p>
    </section>
  );
}

function EntryPreview({ entry }: { entry: Pwd888Entry }) {
  const sub = SUB_ACTIVITY_BY_CODE[entry.code];
  return (
    <div className="rounded-md bg-field-mist/60 px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-field-ink">☑ {entry.name}</span>
        <span className="text-xs text-field-earth">{entry.workDates.map(fmtDate).join(", ")}</span>
      </div>
      {entry.blanks.length > 0 && (
        <dl className="mt-1 space-y-0.5">
          {entry.blanks.map((b) => {
            const note = basisNote(b);
            return (
              <div key={b.key} className="flex flex-wrap gap-x-2 text-sm">
                <dt className="text-field-earth">{b.formLabel}:</dt>
                <dd className="text-field-ink">
                  {fmtValue(b.value, sub?.fields.find((x) => x.key === b.key)?.unit)}
                  {note && <span className="ml-1.5 text-xs text-field-earth">({note})</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      {entry.overflowDates.length > 0 && (
        <p className="mt-1 text-xs text-field-earth">
          Also counted on {entry.overflowDates.map(fmtDate).join(", ")} — listed on a continuation page.
        </p>
      )}
    </div>
  );
}

const EXHIBIT_KIND: Record<Pwd888Exhibit["kind"], string> = {
  document: "Document",
  field_log: "Field photo",
  census_photo: "Census photo",
  census_record: "Census data sheet",
};

function ExhibitRow({ exhibit: x }: { exhibit: Pwd888Exhibit }) {
  const kind = x.docType === "receipt" ? "Receipt" : EXHIBIT_KIND[x.kind];
  const when = x.capturedAt ? fmtDate(x.capturedAt.slice(0, 10)) : null;
  return (
    <li className="text-sm text-field-ink">
      <span className="font-medium">Exhibit {x.number}</span>
      <span className="text-field-earth">
        {" "}— {kind}, {SUB_ACTIVITY_BY_CODE[x.subActivityCode]?.name ?? x.subActivityCode}
        {when && `, ${when}`}
      </span>
      {x.censusCounts && (
        <span className="text-field-earth">
          {" "}({x.censusCounts.map((c) => `${c.species}: ${c.count}`).join(", ")})
        </span>
      )}
    </li>
  );
}
