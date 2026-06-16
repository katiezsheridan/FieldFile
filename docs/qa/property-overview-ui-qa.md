# Property Overview UI — QA

Run signed in, on a preview deploy or local dev with real Clerk + Supabase keys.
Both Session 1 (`add_property_overview_fields.sql`) and the `applying`-status
migration (`add_applying_exemption_status.sql`) must be applied first, or
create/edit/photo/status writes will fail. Use a test account with ≥1 property.

### 1. Cards render real data
Dashboard shows a "Your properties" section with one card per property the signed-in
user owns: photo, name, `{county} County · {acreage} acres`, an exemption-type badge,
and (if set) a status badge. Data matches the Supabase `properties` rows.

### 2. Badges
Type badge reads No exemption / Wildlife / Agriculture (neutral). Status badge is
color-coded: **active → green**, **pending → amber**, **at risk → red**,
**applying → slate blue**. No `exemption_status` → type badge only.

### 3. Default photo
A property with no photo shows the default Hill Country placeholder
(`/images/property-placeholder.jpg`), not a blank/icon. A property with a photo shows it.

### 4. Add property
Click **Add property**. Modal opens with type defaulting to **No exemption** and status
to **Applying** (the only status option while type is No exemption). Fill name + county +
acreage, submit → modal closes, new card appears (grid refetched). A new `properties` row
exists, scoped to your `user_id`, with a generated slug.

### 5. Exemption type ↔ status coupling
In the modal, switching type to **Wildlife** or **Agriculture** changes the status options
to Pending / Active / At risk (defaulting to Pending). Switching back to **No exemption**
forces status to **Applying**. The card badge reflects the saved status + color.

### 6. Photo upload (in the modal)
Open Add or Edit. The modal shows a photo preview (placeholder if none). Click
**Add a photo / Change photo**, pick an image → preview updates immediately. On save the
file uploads to Supabase Storage (`documents/properties/{propertyId}/…`) and `photo_url`
is written. Reload — the photo shows on the card and persists. For Add, the property is
created first, then the photo attaches to it.

### 7. Edit property
Click **Edit** on a card → modal prefilled with that property's values (incl. existing
photo). Change name, acreage, type, status, and/or photo; Save changes. Card updates
immediately and persists on reload. Address is optional.

### 8. Delete property
In the Edit modal, click **Delete property** → confirm the dialog. Modal closes, the card
disappears (grid refetched), and the `properties` row is gone. Its activities, documents,
and filings cascade-delete too. Cancelling the confirm leaves everything intact.

### 9. Validation & errors
Empty name or county, or acreage that is blank, `0`, negative, or non-numeric →
inline error **"Name, county, and acreage are required."**, no save. A failed save or
photo upload surfaces an inline error and the modal stays open.

### 10. Modal dismissal
Esc, the X, **Cancel**, and the dark backdrop all close without saving. Clicking inside
the modal does not close it.

### 11. Responsive layout
Cards stack 1-wide on mobile, 2-wide at `sm` (≥640px), 3-wide at `lg` (≥1024px). Header +
Add button stay aligned; long names truncate.

### 12. Ownership / auth
You only see your own properties (API scopes by Clerk `userId`). A second account sees
only its own. `/api/properties` (GET) and `/api/properties/[id]` (PATCH/DELETE) signed
out return 401.

### 13. Empty state (note)
With **zero** properties the dashboard still shows the `/setup` welcome CTA, not the cards
grid — so the Add-property button first appears once you have ≥1 property. Confirm this is
the intended first-property flow (flagged as an open design choice).
