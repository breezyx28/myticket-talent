# Vendor Dashboard — Backend Gaps Handoff

**Audience:** Backend / API team  
**Date:** 2026-06-08  
**Frontend:** Vendor dashboard (`vendor.myticket.com`, dev port `5176`) — **shipped** with workarounds below  
**API base:** `https://<host>/api/v1/main`  
**Auth:** Sanctum Bearer token, ability `app:main`

**Related docs**

- [`frontend-handoff-vendor-api.md`](frontend-handoff-vendor-api.md) — current vendor API contract
- [`myticket_vendor_dashboard_guide.md`](myticket_vendor_dashboard_guide.md) — full frontend build guide
- Talent parity reference: [`api/docs/frontend-handoff-talent-api.md`](../api/docs/frontend-handoff-talent-api.md)
- Existing validator: `api/app/Domains/RoleApplications/Services/Validators/VendorPayloadValidator.php`
- DB seed (categories): `api/database/seeders/Reference/VendorServiceCategoriesSeeder.php`

---

## Executive summary

The vendor dashboard is **functional against the current API**, but several endpoints are missing or under-specified compared to talent. The frontend has **client-side fallbacks** that must be replaced with real API support before production hardening.

| Priority | Gap | Frontend workaround today |
|----------|-----|---------------------------|
| **P0** | No vendor availability update endpoint | Read-only availability UI |
| **P0** | No service-categories reference or application attach API | Hardcoded 15 categories; **selections are not persisted** |
| **P0** | Weak submit validation (`profile_name` + `contact_email` only) | Client gate in `isVendorApplicationReady()` |
| **P1** | `GET /me/vendor-profile` omits `categories` + `gallery` | Preview/profile pages show incomplete data |
| **P2** | No auto `reserved` on engagement accept | Manual availability unavailable; status may stay `available` |
| **P2** | No post-approval gallery/category PATCH | Documented out of scope; categories frozen at provisioning |

---

## P0 — Vendor availability (talent parity)

### Problem

Talent has dedicated availability endpoints:

- `GET /me/talent-availability`
- `PUT /me/talent-availability` `{ "status": "available" | "reserved" }`

Vendor has **no equivalent**. `availability_status` exists on `vendor_profiles` and is returned by `GET /me/vendor-profile`, but vendors cannot change it.

**API today:** `api/routes/api_main.php` registers talent routes only; `MyMarketplaceProfileController` has `talentAvailability` / `updateTalentAvailability` but no vendor methods.

### Frontend impact

- `/availability` page is **read-only**
- Home dashboard shows availability badge but toggle is disabled
- After accepting an engagement, frontend refetches `GET /me/vendor-profile` expecting `reserved` — **backend does not update this today**

### Proposed contract (mirror talent)

```
GET  /api/v1/main/me/vendor-availability
PUT  /api/v1/main/me/vendor-availability
```

**GET `200`**

```json
{ "status": "available" }
```

**PUT body**

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | string | Yes | `available` \| `reserved` |

**PUT `200`**

```json
{ "status": "reserved" }
```

**Rules**

- Auth: approved vendor with `vendor_profiles` row (`user.role === vendor`)
- `404` if no profile
- `422` if invalid status

### Acceptance criteria

- [ ] Routes registered in `api_main.php` + OpenAPI
- [ ] Feature test: vendor can toggle `available` ↔ `reserved`
- [ ] Same validation rules as talent (`in:available,reserved`)
- [ ] Frontend unblocks `AvailabilityToggle` + `PUT` mutation in vendor dashboard

### Implementation hint

Copy `talentAvailability` / `updateTalentAvailability` in `MyMarketplaceProfileController`, target `VendorProfile` instead of `TalentProfile`.

---

## P0 — Service categories (reference + application attach)

### Problem

The database already supports vendor service categories:

- `vendor_service_categories` (seeded — 15 rows in `VendorServiceCategoriesSeeder`)
- `vendor_application_categories` (links application → category)
- `vendor_profile_categories` (copied at provisioning in `ProvisionMarketplaceProfileListener`)

**But there is no public API to:**

1. List categories for the wizard picker
2. Attach/detach categories on a draft vendor application

The application wizard **shows a category picker**, but selections live only in React state (`selectedCategories`) and are **never sent to the API**. Approved vendor profiles may therefore have **zero categories** unless seeded manually in tests/demo.

**API routes today** (`api/routes/api_main.php`):

- `POST /role-applications/vendor/{id}/documents` ✅
- `POST /role-applications/vendor/{id}/gallery` ✅
- `POST /role-applications/vendor/{id}/categories` ❌ missing
- `GET /reference/vendor-service-categories` ❌ missing (compare: `GET /reference/saudi-regions` exists)

`roleApplicationPayload()` loads `vendorApplication.documents` and `vendorApplication.gallery` but **not** `vendorApplication.categories`.

### Frontend impact

- Hardcoded list in `vendor/src/lib/vendorServiceCategories.ts` (slugs aligned with seeder)
- Category chips on `/preview` and `/profile` show `#service_category_id` only when API returns categories
- Marketplace filtering by service type will be wrong for real applicants

### Proposed contracts

#### 1. Reference list (public or auth-optional)

```
GET /api/v1/main/reference/vendor-service-categories
```

**`200`**

```json
{
  "data": [
    {
      "id": 1,
      "slug": "catering",
      "name_en": "Catering",
      "name_ar": "تموين الطعام",
      "is_active": true,
      "display_order": 1
    }
  ]
}
```

Filter `is_active = true`, order by `display_order`.

#### 2. Attach category to application (auth, draft only)

```
POST /api/v1/main/role-applications/vendor/{id}/categories
```

**Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `service_category_id` | integer | Yes | FK → `vendor_service_categories.id` |
| **or** `slug` | string | No | Resolve to id if provided |

**`201`**

```json
{
  "data": {
    "id": 12,
    "vendor_application_id": 3,
    "service_category_id": 2
  }
}
```

**`DELETE /role-applications/vendor/{id}/categories/{categoryRowId}`** → `{ "message": "Deleted" }`

**Business rules**

- Application must be `draft` or `rejected` (same as documents/gallery)
- Unique `(vendor_application_id, service_category_id)`
- Return categories in `GET /role-applications/vendor/{id}` payload

### Acceptance criteria

- [ ] Reference endpoint returns seeded categories (EN + AR)
- [ ] POST/DELETE categories on vendor application
- [ ] `GET /role-applications/vendor/{id}` includes `vendor_application.categories[]`
- [ ] Provisioning copies application categories → `vendor_profile_categories` (listener already expects `vendorApplication.categories` — verify eager load)
- [ ] At least one category required before submit (see next section)

---

## P0 — Submit validation hardening

### Problem

`VendorPayloadValidator` only checks:

```php
$typed->profile_name === '' || $typed->contact_email === ''
```

It does **not** enforce:

- Minimum bio length
- At least one verification document
- At least one gallery image
- At least one service category
- City / coverage area (optional product rules)

Talent validator is equally minimal (`stage_name` + `contact_email`), but vendor onboarding UI **requires** docs + gallery + bio client-side.

### Frontend client gate (today)

`vendor/src/lib/onboardingValidation.ts` — `isVendorApplicationReady()`:

- `profile_name` or `business_name`
- `contact_email`
- `bio` ≥ 25 characters
- `documents.length > 0`
- `gallery.length > 0`

Submit is blocked in the wizard if this fails, but **API accepts incomplete payloads** if called directly.

### Recommended server rules (align with frontend)

On `POST /role-applications/vendor/{id}/submit`, reject with `422` and message `"Vendor application payload is incomplete."` when any of:

| Check | Rule |
|-------|------|
| Identity | `profile_name` and `contact_email` present (existing) |
| Bio | `bio` trimmed length ≥ 25 (match frontend `VENDOR_BIO_MIN_CHARS`) |
| Documents | ≥ 1 `vendor_application_documents` row |
| Gallery | ≥ 1 `vendor_application_gallery` row |
| Categories | ≥ 1 `vendor_application_categories` row (after categories API ships) |

Return field-level `errors` where practical, e.g.:

```json
{
  "message": "Vendor application payload is incomplete.",
  "errors": {
    "documents": ["At least one verification document is required."],
    "gallery": ["At least one gallery image is required."]
  }
}
```

### Acceptance criteria

- [ ] `VendorPayloadValidator` enforces table above
- [ ] Feature tests: submit fails without docs/gallery/bio; succeeds when complete
- [ ] Frontend can remove redundant client-only gate or keep as UX prefetch

---

## P1 — `GET /me/vendor-profile` should include relations

### Problem

Public discovery already eager-loads relations:

```php
// MarketplaceDiscoveryController
VendorProfile::query()->active()->where('slug', $slug)->with(['categories', 'gallery'])
```

But the **authenticated** endpoint does not:

```php
// MyMarketplaceProfileController::myVendor
VendorProfile::query()->where('user_id', $user->id)->firstOrFail();
```

### Frontend impact

- Vendor `/profile` and `/preview` cannot show gallery grid or category chips from `GET /me/vendor-profile`
- Frontend falls back to public slug fetch only on preview (not implemented — profile pages show empty gallery)

### Proposed fix

```php
VendorProfile::query()
    ->where('user_id', $user->id)
    ->with(['categories', 'gallery'])
    ->firstOrFail();
```

Optionally embed resolved category labels:

```json
"categories": [
  {
    "id": 1,
    "service_category_id": 2,
    "slug": "catering",
    "name_en": "Catering",
    "name_ar": "تموين الطعام"
  }
]
```

### Acceptance criteria

- [ ] `GET /me/vendor-profile` returns `categories` and `gallery` arrays (same shape as `GET /vendors/{slug}`)
- [ ] Feature test coverage
- [ ] OpenAPI updated

---

## P2 — Availability side effects on engagements

### Problem

Product expectation (from platform flow): when a vendor **accepts** an engagement, they may appear as **reserved** in the marketplace.

**Current backend:** `EngagementService::transition(..., 'accepted')` does not touch `vendor_profiles.availability_status`. No hiring-domain code references `availability`.

### Options (pick one)

**A. Manual toggle only** — Ship P0 `PUT /me/vendor-availability`; vendors set `reserved` themselves.

**B. Auto-reserve on accept** — In engagement accept handler, if `target_type === 'vendor'`, set `availability_status = 'reserved'`.

**C. Hybrid** — Auto-reserve on accept; auto-release on `closed` / `declined` / `cancelled`.

### Frontend today

`acceptEngagement` invalidates `VendorProfile` tag; UI refetches profile. **No status change occurs** until backend implements B or C.

### Acceptance criteria (if B or C chosen)

- [ ] Document transition rules in API handoff
- [ ] Feature test: accept → profile `reserved`; complete → `available` (if C)
- [ ] Notify frontend team to enable non-read-only toggle

---

## P2 — Post-approval profile mutations (optional)

Documented as **out of scope** in [`frontend-handoff-vendor-api.md`](frontend-handoff-vendor-api.md): gallery and categories are copied at approval; no PATCH for gallery/categories on live profile.

If product later needs vendor self-service updates:

| Endpoint | Purpose |
|----------|---------|
| `POST /me/vendor-profile/gallery` | Add image URL + caption |
| `DELETE /me/vendor-profile/gallery/{id}` | Remove image |
| `PUT /me/vendor-profile/categories` | Replace category set |

Not required for initial vendor dashboard launch.

---

## Not gaps (working as designed)

These are intentional; no backend change requested.

| Topic | Notes |
|-------|-------|
| **`profile_name` vs `business_name`** | Create uses `profile_name`; PATCH uses `business_name` → same DB column. Frontend enforces via Yup `.noUnknown()`. |
| **File uploads** | API accepts CDN URLs only (`documents`, `gallery`). No multipart on role-application routes. |
| **Engagements** | `GET /me/engagements`, accept/decline/message/complete work for `target_type: "vendor"`, `sender: "vendor"`. |
| **Ratings** | `GET /vendors/{slug}/ratings` works; frontend shows **stars only** (hides `comment`). |
| **Admin approval** | Admin routes out of scope for vendor dashboard. |
| **Organizer `POST /me/engagements`** | Organizer-side; already implemented on main website. |

---

## Suggested implementation order

1. **Categories reference + application attach** — unblocks real onboarding data
2. **Submit validation** — security/compliance hardening
3. **`GET /me/vendor-profile` relations** — dashboard preview accuracy
4. **`PUT /me/vendor-availability`** — feature parity with talent
5. **Engagement → availability side effects** — if product wants automation

---

## Frontend unblock checklist (for API team)

When each item ships, frontend will:

| Backend delivery | Frontend change |
|------------------|-----------------|
| `GET /reference/vendor-service-categories` | Replace `vendorServiceCategories.ts` hardcoded list |
| `POST/DELETE .../categories` | Persist wizard selections; remove local-only state |
| Stronger submit validation | Align error display with `422` field map |
| `GET /me/vendor-profile` + relations | Show gallery/categories on profile & preview |
| `PUT /me/vendor-availability` | Enable toggle on `/availability` + home dashboard |

---

## Contact / references

- **Frontend repo path:** `vendor/` in monorepo
- **API routes file:** `api/routes/api_main.php`
- **Vendor profile controller:** `api/app/Http/Controllers/Api/V1/Main/Marketplace/MyMarketplaceProfileController.php`
- **Role applications controller:** `api/app/Http/Controllers/Api/V1/Main/RoleApplications/RoleApplicationController.php`

*Generated from vendor dashboard implementation (June 2026) and live API code inspection.*
