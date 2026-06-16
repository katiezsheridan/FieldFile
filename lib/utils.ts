import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-status-draft",
    ready_to_file: "bg-status-ready",
    filed: "bg-status-filed",
    accepted: "bg-status-accepted",
    needs_followup: "bg-status-followup",
    not_started: "bg-red-100 text-red-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    evidence_uploaded: "bg-blue-100 text-blue-800",
    complete: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100";
}

export function slugify(name: string): string {
  const slug = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "property";
}

export function getExemptionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    wildlife: "Wildlife",
    agriculture: "Agriculture",
    none: "No exemption",
  };
  return labels[type] || type;
}

export function getExemptionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    at_risk: "At risk",
  };
  return labels[status] || status;
}

// Badge classes for an exemption status pill (bg + text), using field-* tokens.
export function getExemptionStatusBadge(status: string): string {
  const styles: Record<string, string> = {
    active: "bg-field-forest/10 text-field-forest",
    pending: "bg-field-gold/20 text-field-earth",
    at_risk: "bg-field-terra/10 text-field-terra",
  };
  return styles[status] || "bg-field-mist text-field-earth";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    ready_to_file: "Ready to File",
    filed: "Filed",
    accepted: "Accepted",
    needs_followup: "Needs Follow-up",
    not_started: "Not Started",
    in_progress: "In Progress",
    evidence_uploaded: "Evidence Uploaded",
    complete: "Complete",
  };
  return labels[status] || status;
}
