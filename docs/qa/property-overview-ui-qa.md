# Property Overview UI — QA

Run signed in, on a preview deploy or local dev with real Clerk + Supabase keys.
The Session 1 migration (`add_property_overview_fields.sql`) must be applied first, or
create/edit/photo writes will fail. Use a test account that already has ≥1 property.

### 1. Cards render real data
Dashboard shows a "Your properties" section with one card per property the signed-in
user owns. Each card shows name, `{county} County · {acreage} acres`, an exemption-type
badge, and (if set) a status badge. Data matches the Supabase `properties` rows — no
demo/placeholder values.

### 2. Badges
Exemption type badge reads Wildlife / Agriculture / No exemption (neutral styling).
Status badge is color-coded: **active → green**, **pending → amber**, **at risk → red**.
A property with no `exemption_status` shows the type badge only, no status badge.

### 3. Photo: placeholder + upload
A property with no photo shows the landscape placeholder icon and an **Add photo**
button. Click it, pick an image: button shows **Uploading…**, then the card re-renders
with the photo (object-cover) and the button now reads **Change photo**. Reload — the
photo persists. Confirm the file landed in Supabase Storage under
`documents/properties/{propertyId}/…` and `properties.photo_url` is set.
Re-uploading a *different* image replaces it. Selecting the *same* file twice still works.

### 4. Add property
Click **Add property** (top-right of the section). Modal opens with an empty form;
type defaults to Wildlife, status to Pending. Fill name + county + acreage, submit.
Modal closes, a new card appears immediately (grid refetched). Confirm a new
`properties` row exists, scoped to your `user_id`, with a generated slug.

### 5. Edit property
Click **Edit** on a card. Modal opens prefilled with that property's values. Change
name, acreage, type, and status; Save changes. Card reflects the edits immediately and
the status badge color updates. Reload — changes persist. Address is optional and
editable.

### 6. Validation & errors
In the add/edit modal: empty name or county → inline error, no save. Non-numeric or
negative acreage → inline error. A failed save (e.g. network) surfaces an inline error
and the modal stays open. A failed photo upload surfaces an error on the card and the
button returns to its normal label.

### 7. Modal dismissal
Esc, the X, **Cancel**, and clicking the dark backdrop all close the modal without
saving. Clicking inside the modal does not close it.

### 8. Responsive layout
Cards stack 1-wide on mobile, 2-wide at `sm` (≥640px), 3-wide at `lg` (≥1024px). The
section header and Add button stay aligned. Long property names truncate rather than
overflow.

### 9. Ownership / auth
You only ever see your own properties (API scopes by Clerk `userId`). A second test
account sees only its own. Hitting `/api/properties` signed out returns 401.

### 10. Empty state (note)
With **zero** properties the dashboard still shows the `/setup` welcome CTA, not the
cards grid — so the Add-property button first appears once you have ≥1 property. Confirm
this is the intended first-property flow (flagged as an open design choice).
