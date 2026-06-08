# Backend gaps — Talent Dashboard (`talent.myticket.com`)

> **Audience:** Backend / API team  
> **Date:** 2026-06-08  
> **Frontend:** [`talent/`](../talent/) — standalone SPA at `https://myticket-talent.kat-jr.com` (staging) / `https://talent.myticket.com` (prod)  
> **API prefix:** `/api/v1/main` (Sanctum bearer, `app.scope:main_website`)  
> **Canonical API guide:** [`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md)  
> **Platform reference:** [`../myticket_shared_flow.md`](../myticket_shared_flow.md)

This document lists what the **Talent Dashboard frontend** needs from the API that is **missing, underspecified, untested, or misaligned** with the shipped client. Use it alongside [`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md) and [`../api/docs/API_REFERENCE.md`](../api/docs/API_REFERENCE.md).

## Legend

| Status | Meaning |
|--------|---------|
| **Missing** | No route or no usable contract; frontend blocked or degraded |
| **Underspecified** | Route exists; success/error body not documented or inconsistent |
| **Misaligned** | Route exists but request/response field names or rules differ from client |
| **Untested** | Route may work; no feature test / sample JSON in repo (`ENDPOINT_TEST_COVERAGE.md` marks **GAP**) |
| **Config** | `.env` / CORS / OAuth / infra — not a new route, but required for production |

## Priority summary

| P | Gap | Status |
|---|-----|--------|
| P0 | File upload service for application media | **Missing** |
| P0 | `GET /me/engagements/{id}/messages` (or embed `messages` on list) | **Missing** |
| P0 | `FRONTEND_TALENT_URL` + CORS for talent origin | **Config** |
| P1 | Submit validation vs product rules (bio, media, disclaimer) | **Misaligned** |
| P1 | Accept engagement → auto `reserved` availability | **Missing** (product rule) |
| P1 | Role-application response field names (`region_id` vs `saudi_region_id`, `profile_image_url` vs `profile_image`) | **Misaligned** |
| P1 | OAuth redirect allowlist for talent SPA callback | **Config** |
| P1 | Notification deep links → talent subdomain | **Underspecified** |
| P2 | `POST /auth/refresh` contract + long-session behavior | **Underspecified** |
| P2 | Post-approval profile media (image / gallery / categories) | **Missing** |
| P2 | Talent application categories during onboarding | **Missing** (optional product) |
| P2 | Feature tests for talent-profile + engagements | **Untested** |
| P3 | `GET /me/engagements/{id}` detail endpoint | **Missing** (nice-to-have) |
| P3 | Cross-subdomain auth cookie domain (staging/prod) | **Config** |

---

## Environment & platform (P0–P1)

### 1. `FRONTEND_TALENT_URL` — CORS and front-end registry

**Status:** **Config — Missing**

The API already registers other frontends in [`api/.env`](../api/.env) and [`api/config/cors.php`](../api/config/cors.php):

- `FRONTEND_MAIN_URL`
- `FRONTEND_ADMIN_URL`
- `FRONTEND_ORGANIZER_URL`
- `FRONTEND_SCANNER_URL`

**Talent dashboard is not registered.**

**Required for staging:**

```env
FRONTEND_TALENT_URL=https://myticket-talent.kat-jr.com
```

**Required changes:**

1. Add `FRONTEND_TALENT_URL` to `api/.env.example` and deployment secrets.
2. Append it to `config/cors.php` allowed origins.
3. If notification templates or mailers build “open app” links, add talent URL builder (mirror organizer/scanner).
4. Document in [`API_REFERENCE.md`](../api/docs/API_REFERENCE.md) § environment.

**Acceptance:** Browser `fetch` from `https://myticket-talent.kat-jr.com` to `https://myticket-api.kat-jr.com/api/v1/main/*` succeeds with credentials/Authorization and no CORS errors.

---

### 2. Sanctum / cross-app session (main ↔ talent)

**Status:** **Config — Underspecified**

The talent app stores Sanctum tokens in first-party cookies (`myticket_at`, `myticket_rt`) via [`talent/src/api/authToken.ts`](src/api/authToken.ts). Main site registration redirects guests to the talent dashboard [`/application`](src/pages/application/ApplicationWizardPage.tsx).

| Environment | Expected behavior |
|-------------|-------------------|
| **Production** (`*.myticket.com`) | Shared cookie `Domain=.myticket.com` so main → talent handoff avoids re-login |
| **Staging** (`*.kat-jr.com`) | Same pattern with `Domain=.kat-jr.com` if product wants seamless handoff |
| **Local dev** (ports 5173 / 5175) | Separate origins — re-login on talent port is acceptable |

**Backend ask:**

- Confirm Sanctum `SANCTUM_STATEFUL_DOMAINS` includes `myticket-talent.kat-jr.com` and production talent host (if using cookie SPA auth in addition to bearer).
- If only bearer tokens: document that login on talent uses `POST /auth/login` independently after main registration redirect.

---

### 3. Google OAuth — talent SPA callback

**Status:** **Config — Underspecified**

Talent dashboard implements:

- `POST /auth/oauth/{provider}/start` → redirect to provider
- Provider returns to **`https://<talent-host>/auth/oauth/{provider}/callback`**
- SPA calls `POST /auth/oauth/{provider}/callback` with `{ code, state }`

**Backend / Google Cloud Console must allow:**

| Item | Value (staging example) |
|------|---------------------------|
| Authorized JavaScript origin | `https://myticket-talent.kat-jr.com` |
| Authorized redirect URI (SPA) | `https://myticket-talent.kat-jr.com/auth/oauth/google/callback` |
| API callback (existing) | `https://myticket-api.kat-jr.com/api/v1/main/auth/oauth/google/callback` |

**OAuth start response** must include `state` for CSRF (client stores in `sessionStorage`):

```json
{ "redirect_url": "https://accounts.google.com/...", "state": "random-csrf" }
```

**Login success envelope** (same as main) — see [`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md) § Authentication.

**Role gate:** After OAuth, users with `role` `organizer` or `vendor` must receive a normal auth payload; talent SPA rejects them client-side. Prefer **`403`** or a clear error if login from talent dashboard should be impossible for those roles.

---

## File uploads (P0)

### 4. CDN / multipart upload for role-application media

**Status:** **Missing**

The role-application API accepts **URLs only** (`profile_image`, `POST .../media` with `value` URL). There is **no** `POST /api/v1/main/...` upload route for talent (organizer has `POST /me/profile/logo`, etc.).

Talent wizard calls [`uploadToCdn()`](src/lib/upload.ts):

```http
POST {VITE_UPLOAD_URL}
Content-Type: multipart/form-data
file=<binary>
```

Expected response:

```json
{ "url": "https://cdn.example.com/path/file.jpg", "content_type": "image/jpeg" }
```

Without `VITE_UPLOAD_URL`, **all wizard uploads fail** (“Upload service is not configured.”).

**Proposed options (pick one):**

**Option A — Dedicated main upload endpoint (recommended)**

```http
POST /api/v1/main/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

| Field | Rules |
|-------|-------|
| `file` | Required; image/video/pdf per product policy |
| `context` | Optional: `talent_application`, `talent_profile` |

Response `201`:

```json
{
  "data": {
    "url": "https://cdn.example.com/talent/abc.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 102400
  }
}
```

**Option B — Presigned S3 URL**

`POST /api/v1/main/uploads/presign` → client `PUT` to storage → pass returned public URL into role-application JSON.

**Acceptance:** Applicant can upload headshot + gallery in wizard; URLs persist via `PATCH /role-applications/talent/{id}` and `POST .../media`.

---

## Engagements (P0–P1)

### 5. List engagement messages for talent inbox

**Status:** **Missing**

**Organizer API has:**

- `GET /api/v1/organizer/engagements/{id}/messages` ✅

**Main API (talent/vendor target) has only:**

- `POST /me/engagements/{id}/messages` ✅
- `GET /me/engagements/{id}/messages` ❌ **not routed**

[`MainEngagementsController::mine()`](../api/app/Http/Controllers/Api/V1/Main/Engagements/MainEngagementsController.php) returns a plain paginator **without** `messages[]`. The talent UI reads `engagement.messages` in [`EngagementsPage.tsx`](src/pages/engagements/EngagementsPage.tsx). After posting, optimistic UI shows the new message; **on refresh or opening a thread, history is empty**.

**Proposed (mirror organizer):**

```http
GET /api/v1/main/me/engagements/{id}/messages
Authorization: Bearer <token>
```

Response `200`:

```json
{
  "data": [
    {
      "id": 44,
      "engagement_id": 5,
      "sender_user_id": 19,
      "sender": "talent",
      "body": "I can do 90 minutes",
      "attachment_url": null,
      "read_at": null,
      "created_at": "2026-05-21T10:00:00.000000Z"
    }
  ]
}
```

**Alternative:** Embed `messages` (latest N, asc) on each row in `GET /me/engagements` — document N and sort order.

**Acceptance:** Talent accepts engagement, sends messages, reloads page — full thread visible.

---

### 6. Accept engagement → availability `reserved`

**Status:** **Missing** (product rule)

[`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md) and platform flow state that accepting a booking sets talent to **reserved**. [`EngagementService::transition()`](../api/app/Domains/Hiring/Services/EngagementService.php) updates engagement status only; it does **not** update `talent_profiles.availability_status`.

**Proposed behavior:**

| Event | `talent_profiles.availability_status` |
|-------|--------------------------------------|
| `POST .../accept` (target is talent) | `reserved` |
| `POST .../complete` or `.../decline` / cancel from accepted | `available` (confirm product rule) |

Invalidate or document interaction with manual `PUT /me/talent-availability`.

---

### 7. Engagement list filters & pagination

**Status:** **Underspecified**

Client calls `GET /me/engagements?page=1&per_page=50`. Controller uses fixed `paginate(20)` and does not document query params.

**Ask:**

- Honor `page`, `per_page` (max cap e.g. 50).
- Optional `status=pending|accepted|...` filter for inbox tabs.
- Confirm `organizer_profile_snapshot.display_name` is always present (UI fallback: `'Organizer'`).

---

### 8. `GET /me/engagements/{id}` (optional)

**Status:** **Missing** (P3)

Mobile/detail route [`/engagements/:id`](src/pages/engagements/EngagementDetailPage.tsx) uses list cache only. A detail endpoint would simplify deep links (`?focus={id}`) and notification targets.

---

## Role applications (P1)

### 9. Submit validation vs frontend product rules

**Status:** **Misaligned**

| Rule | Frontend ([`onboardingValidation.ts`](src/lib/onboardingValidation.ts)) | Backend ([`TalentPayloadValidator`](../api/app/Domains/RoleApplications/Services/Validators/TalentPayloadValidator.php)) |
|------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `stage_name` | Required | Required ✅ |
| `contact_email` | Required | Required ✅ |
| `bio` ≥ 30 chars | Required for submit | Not validated ❌ |
| ≥ 1 media item | Required | Not validated ❌ |
| `accepted_quality_disclaimer` | Required | Not validated ❌ |

Client blocks incomplete submit in UI; API still allows `POST .../submit` with only name + email.

**Ask:** Extend `TalentPayloadValidator` (or submit service) to match product rules and return field-level `422` errors, **or** explicitly document that admin review catches incomplete applications (frontend will keep stricter client validation).

---

### 10. Response field naming on `talent_application`

**Status:** **Misaligned**

| Client PATCH / read | API DB / `toArray()` response | Issue |
|-------------------|-------------------------------|-------|
| `saudi_region_id` | `region_id` | Wizard hydrates `ta.saudi_region_id` — **region/city not repopulated** after reload if only `region_id` returned |
| `profile_image` | `profile_image_url` | Wizard shows `detail.talent_application.profile_image` — **headshot preview may be blank** after reload |

**Ask (pick one):**

**Option A:** API resource aliases in JSON responses: `saudi_region_id`, `profile_image` (write) + `profile_image_url` (read) documented together.

**Option B:** Document canonical names (`region_id`, `profile_image_url`) only; frontend will map (backend still should document in OpenAPI).

`GET /role-applications/talent/{id}` should always include nested `talent_application.media[]` (already loaded in [`roleApplicationPayload()`](../api/app/Http/Controllers/Api/V1/Main/RoleApplications/RoleApplicationController.php)).

---

### 11. Talent categories during application (optional)

**Status:** **Missing** (product)

[`ProvisionMarketplaceProfileListener`](../api/app/Domains/Marketplace/Services/ProvisionMarketplaceProfileListener.php) copies `talent_application.categories` into `talent_profile_categories` on approval. The talent wizard **does not** collect categories yet; profile UI displays `#{talent_category_id}` if present.

If marketplace discovery requires categories at apply time, expose:

```http
PATCH /role-applications/talent/{id}
{ "category_ids": [1, 4, 7] }
```

Or `POST /role-applications/talent/{id}/categories`.

---

## Approved talent profile (P2)

### 12. Post-approval profile image & gallery mutations

**Status:** **Missing**

[`PATCH /me/talent-profile`](../api/app/Http/Controllers/Api/V1/Main/Marketplace/MyMarketplaceProfileController.php) allows: `stage_name`, `bio`, `website_url`, `instagram_handle`, `travel_ready`, `location_public`.

**Not supported after approval:**

- `profile_image_url` update
- Gallery add/remove/reorder
- Category edits

Handoff doc notes gallery is copied at approval only. If talents may update portfolio later, add routes (mirror organizer `POST /me/profile/gallery` pattern) or extend PATCH.

---

### 13. `GET/PATCH /me/talent-profile` — tests & sample JSON

**Status:** **Untested**

[`api/ENDPOINT_TEST_COVERAGE.md`](../api/ENDPOINT_TEST_COVERAGE.md) marks **GAP** for:

- `GET /api/v1/main/me/talent-profile`
- `PATCH /api/v1/main/me/talent-profile`

**Ask:**

- Add feature tests (approved talent user, 404 for guest applicant).
- Publish one recorded `200` body including `slug`, `rating_average`, `rating_count`, `completed_bookings`, `categories[]`, `gallery[]` for OpenAPI/Scribe.

---

## Auth & session (P2)

### 14. `POST /auth/refresh` — long-lived sessions

**Status:** **Underspecified**

Talent `baseApi` clears session on **401** and redirects to `/login` ([`baseApi.ts`](src/api/baseApi.ts)). It does **not** yet call `POST /auth/refresh` before logout (main has the hook; talent does not).

**Document for talent SPA:**

```http
POST /api/v1/main/auth/refresh
Authorization: Bearer <expired_or_valid_access_token>
Cookie: myticket_rt=<refresh>   # if using cookie refresh
```

Response:

```json
{ "token": "...", "refresh_token": "...", "expires_at": "..." }
```

Confirm whether refresh accepts body `{ "refresh_token": "..." }` only (bearer-less). Frontend will implement retry-on-401 once contract is fixed.

---

## Ratings (P2)

### 15. `GET /talents/{slug}/ratings` — comment visibility

**Status:** **Underspecified**

Talent [`RatingsPage`](src/pages/ratings/RatingsPage.tsx) displays **stars + date only** (no comment text). API returns `comment` from organizers.

**Ask:** Confirm `is_visible=false` ratings are excluded from public list. If talent should see moderated/hidden state in dashboard, add `GET /me/ratings/received` or include moderation flags.

---

## Notifications (P1)

### 16. Deep links to talent dashboard

**Status:** **Underspecified**

Expected notification targets ([`myticket_talent_dashboard_guide.md`](myticket_talent_dashboard_guide.md) §11.3):

| Trigger | URL |
|---------|-----|
| New engagement message | `https://<talent-host>/engagements?focus={id}` |
| Application approved | `https://<talent-host>/` |
| Application rejected | `https://<talent-host>/application/status` |

**Ask:** Notification payload `action_url` (or template variable) should use `FRONTEND_TALENT_URL`, not main website `/profile`.

---

## Endpoint coverage checklist (talent dashboard)

Routes the **shipped talent SPA** calls today:

| Method | Path | Used for |
|--------|------|----------|
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Sign out |
| POST | `/auth/oauth/{provider}/start` | Google OAuth |
| POST | `/auth/oauth/{provider}/callback` | OAuth completion |
| POST | `/auth/password/forgot` | Reset request |
| POST | `/auth/password/reset` | Reset confirm |
| GET | `/me` | Session user |
| GET/PATCH | `/me/preferences` | Language (EN/AR) |
| GET | `/role-applications/me` | Application summary |
| GET | `/role-applications/talent/{id}` | Wizard + status |
| POST | `/role-applications/talent` | Create draft |
| PATCH | `/role-applications/talent/{id}` | Autosave |
| POST | `/role-applications/talent/{id}/media` | Gallery URLs |
| DELETE | `/role-applications/talent/{id}/media/{mediaId}` | Remove media |
| POST | `/role-applications/talent/{id}/submit` | Submit |
| POST | `/role-applications/talent/{id}/resubmit` | Resubmit rejected |
| POST | `/role-applications/talent/{id}/withdraw` | Withdraw |
| GET | `/me/talent-profile` | Approved dashboard gate |
| PATCH | `/me/talent-profile` | Profile edit |
| GET/PUT | `/me/talent-availability` | Availability toggle |
| GET | `/me/engagements` | Inbox |
| POST | `/me/engagements/{id}/accept` | Accept |
| POST | `/me/engagements/{id}/decline` | Decline |
| POST | `/me/engagements/{id}/messages` | Chat |
| POST | `/me/engagements/{id}/complete` | Close |
| GET | `/talents/{slug}/ratings` | Ratings page |
| GET | `/reference/saudi-regions` | Region/city pickers |

**Not wired in talent SPA yet (no gap for v1):** `POST /auth/refresh`, `GET /me/notifications`, account email/phone change, 2FA setup.

---

## Suggested implementation order

1. **Config:** `FRONTEND_TALENT_URL`, CORS, OAuth redirect URIs  
2. **Upload service** (blocks onboarding in production)  
3. **`GET /me/engagements/{id}/messages`** (blocks engagement inbox)  
4. **Submit validation** alignment + **response field naming** on role applications  
5. **Accept → reserved** availability side effect  
6. **Feature tests** + Scribe/OpenAPI samples for talent-profile and engagements  
7. **Notification deep links** + optional post-approval gallery APIs  

---

## References

| Document | Path |
|----------|------|
| Talent API handoff | [`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md) |
| Main API reference | [`../api/docs/API_REFERENCE.md`](../api/docs/API_REFERENCE.md) |
| Endpoint test gaps | [`../api/ENDPOINT_TEST_COVERAGE.md`](../api/ENDPOINT_TEST_COVERAGE.md) |
| Engagements sprint | [`../api/docs/sprints/PHASE-12-engagements-and-ratings.md`](../api/docs/sprints/PHASE-12-engagements-and-ratings.md) |
| Role applications sprint | [`../api/docs/sprints/PHASE-04-role-applications.md`](../api/docs/sprints/PHASE-04-role-applications.md) |
| Marketplace provisioning | [`../api/docs/sprints/PHASE-05-marketplace-profiles.md`](../api/docs/sprints/PHASE-05-marketplace-profiles.md) |
| Talent dashboard README | [`README.md`](README.md) |

---

*Generated from the shipped talent dashboard client (`talent/`). Update this file when backend closes a gap — prefix the section with `[Resolved]` and link to `API_REFERENCE.md`.*
