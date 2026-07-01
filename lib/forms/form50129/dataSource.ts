/**
 * Data source for the Form 50-129 assembly layer.
 *
 * buildPayload() reads everything it needs through this interface so the
 * assembly logic can be unit-tested with in-memory fixtures (no Supabase, no
 * Clerk, no network). The default implementation is Supabase-backed, following
 * the app's server pattern: service-role client + Clerk userId filtering.
 *
 * Server-only.
 */

import { createClient } from "@supabase/supabase-js";
import type { PracticeType } from "@/lib/types";
import type { FilingAnswers } from "./buildPayload";

// --- Row shapes (only the columns buildPayload needs) -----------------------

export type PropertyRecord = {
  id: string;
  user_id: string;
  county: string;
  acreage: number | null;
  legal_description: string | null;
  appraisal_account: string | null;
  exemption_type: "wildlife" | "agriculture" | "none";
};

export type OwnerProfileRecord = {
  owner_type: "individual" | "partnership" | "corporation" | "other";
  owner_type_other: string | null;
  owner_name: string | null;
  date_of_birth: string | null;
  physical_address: string | null;
  mailing_address: string | null;
  phone: string | null;
  email: string | null;
  rep_basis:
    | "officer"
    | "general_partner"
    | "attorney"
    | "agent_tax_matters"
    | "other"
    | null;
  rep_basis_other: string | null;
  rep_name: string | null;
  rep_title: string | null;
  rep_phone: string | null;
  rep_email: string | null;
  rep_mailing_address: string | null;
};

export type PlanPracticeRecord = {
  practice_type: PracticeType;
  selected: boolean;
  documentation: { description?: string } | null;
};

export type PlanRecord = {
  id: string;
  status: string;
  pre_conversion_category: string | null;
  practices: PlanPracticeRecord[];
};

export type FilingRecord = {
  tax_year: number;
  status: "draft" | "ready" | "filed";
  answers: FilingAnswers;
};

// --- Interface --------------------------------------------------------------

export interface Form50129DataSource {
  getProperty(propertyId: string, userId: string): Promise<PropertyRecord | null>;
  getOwnerProfile(
    propertyId: string,
    userId: string,
  ): Promise<OwnerProfileRecord | null>;
  /** The wildlife plan for this property + tax year, with its practices. */
  getPlan(
    propertyId: string,
    taxYear: number,
    userId: string,
  ): Promise<PlanRecord | null>;
  /** The current filing row (for its Bucket-3 `answers`), if one exists. */
  getFiling(
    propertyId: string,
    taxYear: number,
    userId: string,
  ): Promise<FilingRecord | null>;
  /** Filings for earlier tax years — used to infer the renewal branch. */
  getPriorFilings(
    propertyId: string,
    taxYear: number,
    userId: string,
  ): Promise<FilingRecord[]>;
}

// --- Supabase-backed default implementation ---------------------------------

/**
 * Build the Supabase-backed data source. Reads env at call time so importing
 * this module never requires configuration (tests inject their own source).
 * Every query is scoped to the Clerk userId, matching the app's API pattern.
 */
export function createSupabaseDataSource(): Form50129DataSource {
  // Reads env at call time — importing this module never requires config, so
  // test paths that inject a fake source don't need the Supabase env vars.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  return {
    async getProperty(propertyId, userId) {
      const { data } = await supabase
        .from("properties")
        .select(
          "id, user_id, county, acreage, legal_description, appraisal_account, exemption_type",
        )
        .eq("id", propertyId)
        .eq("user_id", userId)
        .maybeSingle();
      return (data as PropertyRecord) ?? null;
    },

    async getOwnerProfile(propertyId, userId) {
      const { data } = await supabase
        .from("owner_profiles")
        .select("*")
        .eq("property_id", propertyId)
        .eq("user_id", userId)
        .maybeSingle();
      return (data as OwnerProfileRecord) ?? null;
    },

    async getPlan(propertyId, taxYear, userId) {
      const { data: plan } = await supabase
        .from("plans")
        .select("id, status, pre_conversion_category")
        .eq("property_id", propertyId)
        .eq("year", taxYear)
        .eq("user_id", userId)
        .maybeSingle();
      if (!plan) return null;
      const { data: practices } = await supabase
        .from("plan_practices")
        .select("practice_type, selected, documentation")
        .eq("plan_id", plan.id);
      return { ...(plan as Omit<PlanRecord, "practices">), practices: practices ?? [] };
    },

    async getFiling(propertyId, taxYear, userId) {
      const { data } = await supabase
        .from("form50129_filings")
        .select("tax_year, status, answers")
        .eq("property_id", propertyId)
        .eq("tax_year", taxYear)
        .eq("user_id", userId)
        .maybeSingle();
      return (data as FilingRecord) ?? null;
    },

    async getPriorFilings(propertyId, taxYear, userId) {
      const { data } = await supabase
        .from("form50129_filings")
        .select("tax_year, status, answers")
        .eq("property_id", propertyId)
        .eq("user_id", userId)
        .lt("tax_year", taxYear);
      return (data as FilingRecord[]) ?? [];
    },
  };
}
