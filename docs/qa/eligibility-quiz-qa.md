# Eligibility Quiz — QA

Run on a preview deploy (reCAPTCHA, Supabase, and Resend need real keys). Use a test inbox.

### 1. Happy path
Walk all 6 steps. Progress reads "Step N of 6", Q1/Q3/Q4/Q5 auto-advance on tap, the zip step needs Continue, and Back works on every step (none on Step 1). Submitting a valid email shows the confirmation screen.

### 2. Zip validation & county
Digits only, exactly 5 to advance. Non-Texas zips (e.g. `90210`) are blocked. `78666` → Hays, `78130` → Comal, `78606` → Blanco all flag as a target county; a valid non-target TX zip (e.g. `75001`) goes through with no county.

### 3. Segments (the core logic)
Confirm the right segment + lead temp for each path. Q1="buying" → `future_buyer`; Q5="exploring" → `exploring`; wildlife valuation or "maintain wildlife" → `wildlife_maintain` (hot); ag → `ag_to_wildlife` (hot); market/unsure + "new valuation" → `new_valuation` (warm). Each should show the matching confirmation copy.

### 4. Lead saved correctly
After a submission, check the Supabase `quiz_leads` row: email, zip_raw, county, in_target_county, the q1/q3/q4/q5 fields, and the computed segment/lead_temp are all correct. (Requires the migration to be applied first.)

### 5. Emails
The user gets the segment-specific results email (correct subject, no "files on your behalf" wording), and the team notification arrives tagged `[HOT]/[WARM]/[NURTURE]` with segment + county.
