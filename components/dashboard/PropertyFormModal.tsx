"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ExemptionStatus,
  ExemptionType,
  PropertyWithDetails,
} from "@/lib/types";
import {
  createProperty,
  deleteProperty,
  updateProperty,
  updatePropertyPhoto,
} from "@/lib/hooks";
import { uploadLandDocument } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PLACEHOLDER_PHOTO = "/images/property-placeholder.jpg";

type PropertyFormModalProps = {
  // When set, the modal edits this property. When null, it creates a new one.
  property: PropertyWithDetails | null;
  onClose: () => void;
  // Called after a successful create/update so the parent can refetch.
  onSaved: () => void;
};

type FormState = {
  name: string;
  county: string;
  acreage: string;
  exemptionType: ExemptionType;
  exemptionStatus: ExemptionStatus;
  address: string;
};

const EXEMPTION_TYPES: { value: ExemptionType; label: string }[] = [
  { value: "none", label: "No exemption" },
  { value: "wildlife", label: "Wildlife" },
  { value: "agriculture", label: "Agriculture" },
];

const STATUS_LABELS: Record<ExemptionStatus, string> = {
  active: "Active",
  pending: "Pending",
  at_risk: "At risk",
  applying: "Applying",
};

// Which statuses make sense for a given exemption type. With no exemption the
// landowner is applying for one; with a real exemption it's active/pending/at_risk.
const STATUS_OPTIONS_BY_TYPE: Record<ExemptionType, ExemptionStatus[]> = {
  none: ["applying"],
  wildlife: ["pending", "active", "at_risk"],
  agriculture: ["pending", "active", "at_risk"],
};

const defaultStatusForType = (type: ExemptionType): ExemptionStatus =>
  STATUS_OPTIONS_BY_TYPE[type][0];

const inputClass =
  "w-full rounded-lg border border-field-wheat bg-field-cream px-3 py-2 text-field-ink focus:outline-none focus:ring-2 focus:ring-field-forest/40 focus:border-field-forest";
const labelClass = "block text-sm font-medium text-field-ink mb-1";

export function PropertyFormModal({
  property,
  onClose,
  onSaved,
}: PropertyFormModalProps) {
  const isEdit = property !== null;

  const initialType: ExemptionType = property?.exemptionType ?? "none";
  // Keep the status consistent with the type (e.g. an old row's status that no
  // longer fits, or a brand-new property defaulting to "applying").
  const initialStatus: ExemptionStatus =
    property?.exemptionStatus &&
    STATUS_OPTIONS_BY_TYPE[initialType].includes(property.exemptionStatus)
      ? property.exemptionStatus
      : defaultStatusForType(initialType);

  const [form, setForm] = useState<FormState>({
    name: property?.name ?? "",
    county: property?.county ?? "",
    acreage: property?.acreage != null ? String(property.acreage) : "",
    exemptionType: initialType,
    exemptionStatus: initialStatus,
    address: property?.address ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo: a newly chosen file (uploaded on save) and a local preview URL.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Revoke the object URL when the preview changes or the modal unmounts.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Changing the type may invalidate the current status — snap it to a valid one.
  const setType = (type: ExemptionType) =>
    setForm((f) => ({
      ...f,
      exemptionType: type,
      exemptionStatus: STATUS_OPTIONS_BY_TYPE[type].includes(f.exemptionStatus)
        ? f.exemptionStatus
        : defaultStatusForType(type),
    }));

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // What to show in the preview: the freshly picked file, else the saved photo,
  // else the default placeholder.
  const previewSrc = photoPreview || property?.photoUrl || PLACEHOLDER_PHOTO;
  const hasNewPhoto = photoFile !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    const county = form.county.trim();
    const acreage = parseFloat(form.acreage);

    if (!name || !county || Number.isNaN(acreage) || acreage <= 0) {
      setError("Name, county, and acreage are required.");
      return;
    }

    const fields = {
      name,
      county,
      acreage,
      exemptionType: form.exemptionType,
      exemptionStatus: form.exemptionStatus,
      address: form.address.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEdit && property) {
        // Upload the new photo first (if any) so it saves with the edits.
        let photoUrl: string | undefined;
        if (photoFile) {
          const uploaded = await uploadLandDocument(photoFile, property.id);
          if (!uploaded) throw new Error("Photo upload failed.");
          photoUrl = uploaded.url;
        }
        await updateProperty(property.slug ?? property.id, {
          ...fields,
          ...(photoUrl ? { photoUrl } : {}),
        });
      } else {
        // Create first to get an id, then upload the photo against it.
        const created = await createProperty(fields);
        if (photoFile) {
          const uploaded = await uploadLandDocument(photoFile, created.id);
          if (uploaded) {
            await updatePropertyPhoto(created.id, uploaded.url);
          }
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save property.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;
    const confirmed = window.confirm(
      `Delete "${property.name}"? This removes its activities, documents, and filings. This can't be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setDeleting(true);
    try {
      await deleteProperty(property.slug ?? property.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete property."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-field-ink/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit property" : "Add property"}
        className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-field-wheat px-6 py-4">
          <h2 className="text-lg font-semibold text-field-ink">
            {isEdit ? "Edit property" : "Add property"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-field-earth hover:text-field-ink transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Photo */}
          <div>
            <span className={labelClass}>Photo</span>
            <div className="relative w-full h-36 rounded-lg overflow-hidden bg-field-mist border border-field-wheat">
              <Image
                src={previewSrc}
                alt={form.name || "Property photo"}
                fill
                sizes="(max-width: 768px) 100vw, 28rem"
                className="object-cover"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelected}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm font-medium text-field-forest hover:text-field-forest/80 transition-colors"
            >
              {hasNewPhoto || property?.photoUrl ? "Change photo" : "Add a photo"}
            </button>
          </div>

          <div>
            <label htmlFor="prop-name" className={labelClass}>
              Property name
            </label>
            <input
              id="prop-name"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Cedar Creek Ranch"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prop-county" className={labelClass}>
                County
              </label>
              <input
                id="prop-county"
                type="text"
                value={form.county}
                onChange={(e) => set("county", e.target.value)}
                className={inputClass}
                placeholder="e.g. Hays"
              />
            </div>
            <div>
              <label htmlFor="prop-acreage" className={labelClass}>
                Acreage
              </label>
              <input
                id="prop-acreage"
                type="number"
                min="0"
                step="any"
                value={form.acreage}
                onChange={(e) => set("acreage", e.target.value)}
                className={inputClass}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prop-address" className={labelClass}>
              Address <span className="text-field-earth font-normal">(optional)</span>
            </label>
            <input
              id="prop-address"
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputClass}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prop-type" className={labelClass}>
                Exemption type
              </label>
              <select
                id="prop-type"
                value={form.exemptionType}
                onChange={(e) => setType(e.target.value as ExemptionType)}
                className={inputClass}
              >
                {EXEMPTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prop-status" className={labelClass}>
                Status
              </label>
              <select
                id="prop-status"
                value={form.exemptionStatus}
                onChange={(e) =>
                  set("exemptionStatus", e.target.value as ExemptionStatus)
                }
                className={inputClass}
              >
                {STATUS_OPTIONS_BY_TYPE[form.exemptionType].map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-field-terra">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="text-sm font-medium text-field-terra hover:text-field-terra/80 transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete property"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-field-earth font-medium hover:bg-field-mist transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className={cn(
                  "px-4 py-2 rounded-lg bg-field-forest text-white font-medium",
                  "hover:bg-field-forest/90 transition-colors disabled:opacity-60"
                )}
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add property"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
