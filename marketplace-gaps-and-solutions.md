# Marketplace gaps & solutions

**Date:** 2026-05-18  
**Scope:** Talent dashboard, vendor dashboard, main API backend, admin dashboard, and cross-cutting production fixes from the talent/vendor rollout.

This document consolidates identified gaps and how each was resolved. Existing flows (role applications, provisioning, organizer KYC, admin suspend/unsuspend) were preserved; new endpoints extend rather than replace them.

---

## Talent frontend (`FRONTEND_TALENT_URL`)

| Gap | Solution |
|-----|----------|
| No file upload for application media | Use `POST /api/v1/main/uploads` with `context=talent_application`; bind returned `data.url` to application media fields. See [`frontend-handoff-talent-backend-updates.md`](frontend-handoff-talent-backend-updates.md). |
| Engagement thread not loadable | `GET /api/v1/main/me/engagements/{id}/messages` returns messages ascending by `created_at`. |
| Engagement list lacks pagination/filters | `GET /api/v1/main/me/engagements?page=&per_page=&status=` (max `per_page` 50). |
| Accept engagement did not reserve availability | `EngagementService` sets talent/vendor `availability_status` to `reserved` on accept; returns to `available` on complete/cancel from accepted. |
| Submit validation mismatch (bio, media, disclaimer) | Server enforces bio ≥ 30 chars, ≥ 1 media item, disclaimer accepted via `TalentPayloadValidator`. |
| Response field aliases (`saudi_region_id`, `profile_image`) | Role-application and profile responses include aliases alongside legacy names. |
| Notification deep links pointed at wrong host | Approve/reject/message notifications use `FrontendUrl::talent(...)` from `FRONTEND_TALENT_URL`. |
| CORS blocked talent origin | `FRONTEND_TALENT_URL` added to `config/frontends.php` and `config/cors.php`. |
| `GET /me/talent-profile` 404 after admin approval | Backend auto-provisions missing profile on read (`ResolveMarketplaceProfileService`) and fixed provisioning listener import bug. Talent SPA should call `GET /me/talent-profile` after approval. |
| No way to update live profile photo | `POST /uploads` → `PATCH /me/talent-profile` with `profile_image` (alias for `profile_image_url`). GET returns `profile_image`. |
| Government ID upload/verify not available to talent | **New:** `GET/POST /api/v1/main/me/government-id-verification`. Upload images via `/uploads`, then submit document metadata and image URLs. Poll GET for `status` (`pending` \| `verified` \| `rejected`). Resubmit after reject by POSTing again (creates new pending row). |
| Post-approval gallery/categories PATCH | **Still open (P2):** No dedicated `PATCH` for gallery/categories on live profile; use role-application media during onboarding or follow up in a later sprint. |

### Talent government ID flow (frontend)

```
1. POST /api/v1/main/uploads  (front, back, selfie images)
2. POST /api/v1/main/me/government-id-verification
   {
     "document_type": "national_id|iqama|passport",
     "document_number": "optional",
     "front_image_url": "required",
     "back_image_url": "optional",
     "selfie_url": "optional",
     "issue_date": "optional",
     "expiry_date": "optional"
   }
3. GET /api/v1/main/me/government-id-verification  → latest submission
```

---

## Vendor frontend (`FRONTEND_VENDOR_URL`)

| Gap | Solution |
|-----|----------|
| No vendor availability endpoints | `GET/PUT /api/v1/main/me/vendor-availability`. |
| No service categories reference | `GET /api/v1/main/reference/vendor-service-categories`. |
| Application categories attach/detach | `POST/DELETE /api/v1/main/role-applications/vendor/{id}/categories`. |
| Submit validation (bio, documents, gallery, category) | `VendorPayloadValidator` mirrors product rules. |
| `GET /me/vendor-profile` missing relations | Response includes `categories` and `gallery`. |
| Hybrid availability on engagements | Same as talent: accept → `reserved`; complete/cancel → `available`. |
| Notification deep links | `FrontendUrl::vendor(...)` for approve/reject/messages. |
| CORS / env | `FRONTEND_VENDOR_URL` in `config/frontends.php` and CORS. |
| Government ID for vendors | Same `GET/POST /me/government-id-verification` as talent (user must have vendor profile or non-rejected vendor application). Admin reviews via profile endpoints below. |

See [`frontend-handoff-vendor-backend-updates.md`](frontend-handoff-vendor-backend-updates.md).

---

## Main API backend (`/api/v1/main`)

| Gap | Solution |
|-----|----------|
| Shared multipart upload missing | `POST /api/v1/main/uploads` — image/PDF, max 12 MB; contexts: `talent_application`, `vendor_application`, `vendor_document`. |
| Register duplicate phone → SQL error | `RegisterRequest` validates `unique:users,phone` with 422 and clear message. |
| Profile not created after approval (silent failure) | **Root cause:** missing `use App\Models\RoleApplication` in `ProvisionMarketplaceProfileListener` caused TypeError and transaction rollback. **Fix:** import + `provisionForApplication()` + logging. **Heal:** `php artisan role-applications:reprovision-profiles`. **Read path:** `ResolveMarketplaceProfileService` auto-provisions on `GET /me/talent-profile` and `GET /me/vendor-profile` when application is approved but profile row missing. |
| Government ID table existed but no user API | **New service:** `GovernmentIdVerificationService`. **Routes:** `GET/POST /me/government-id-verification`. Submissions write `government_id_verifications` and sync `talent_applications.government_id_status`. |
| Engagement messages route missing | `GET /me/engagements/{id}/messages` on `MainEngagementsController`. |

### Demo credentials (non-production, after `db:seed`)

| Role | Email | Password |
|------|-------|----------|
| Talent | `talent@myticket.test` | `password` |
| Vendor | `vendor@myticket.test` | `password` |

---

## Admin dashboard (`/api/v1/admin`)

| Gap | Solution |
|-----|----------|
| Approve talent returned 404 (wrong id) | Use `role_application_id` from directory, not `talent_profiles.id`. `AdminRoleApplicationResolver` accepts role application id, typed application id, or profile id. |
| Re-approving approved application errored | `ApproveRoleApplicationService` is idempotent when status is already `approved`; re-runs provisioning if profile missing. |
| Talent directory lacked approval status / filters | `GET /admin/profiles/talents` returns `approval_status`, `role_application_id`, nested `profile`. Filters: `?status=`, `?is_active=`, `?government_id_status=`. |
| Talent detail missing government ID context | `GET /admin/profiles/talents/{id}` includes `government_id_status` and full `government_id_verification` (latest). |
| Government ID verify only (no reject, no queue fields) | **Kept:** `POST /admin/profiles/{type}/{id}/verify-government-id`. **Added:** `POST /admin/profiles/{type}/{id}/reject-government-id` with `{ "reason": "..." }`. Both sync `talent_applications.government_id_status` and write `audit_logs`. `type` = `talents` \| `vendors` \| `organizers`. |
| Approve endpoint id confusion | Prefer `POST /admin/role-applications/{role_application_id}/approve` with id from `role_application_id` field on directory rows. |

### Admin government ID flow

```
1. List: GET /admin/profiles/talents?government_id_status=pending
2. Detail: GET /admin/profiles/talents/{profileId}
   → government_id_verification.front_image_url etc. on linked row
3. Approve: POST /admin/profiles/talents/{profileId}/verify-government-id
4. Reject:  POST /admin/profiles/talents/{profileId}/reject-government-id
   Body: { "reason": "..." }
```

Use **`profileId`** (`talent_profiles.id` from directory `id` or `profile.id`), not `role_application_id`, for government ID routes (unchanged from existing verify contract).

---

## Cross-cutting / operations

| Gap | Solution |
|-----|----------|
| Approved users stuck without profile in production | Deploy fixes, then run `php artisan role-applications:reprovision-profiles`. Auto-heal on profile GET reduces need for manual repair going forward. |
| API docs out of date after new routes | Regenerate Scribe/OpenAPI after deploy (`php artisan scribe:generate` if used in your pipeline). |
| PHPUnit locally fails (MySQL) | Tests use `DatabaseTransactions`; ensure `.env.testing` DB is reachable in CI. Feature coverage: `GovernmentIdVerificationTest`, `TalentDashboardGapsTest`, `AdminTalentDirectoryTest`, `MarketplaceProvisioningTest`. |

---

## Related handoff docs

| Document | Audience |
|----------|----------|
| [`frontend-handoff-talent-backend-updates.md`](frontend-handoff-talent-backend-updates.md) | Talent SPA — P0/P1 contracts |
| [`frontend-handoff-vendor-backend-updates.md`](frontend-handoff-vendor-backend-updates.md) | Vendor SPA — P0/P1 contracts |
| [`TALENT_BACKEND_GAPS.md`](../TALENT_BACKEND_GAPS.md) | Original talent gap inventory (P0/P1 marked resolved) |
| [`vendor-backend-gaps.md`](../vendor-backend-gaps.md) | Original vendor gap inventory (P0/P1 marked resolved) |

---

## New endpoints summary (2026-05-18)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/main/me/government-id-verification` | main |
| POST | `/api/v1/main/me/government-id-verification` | main |
| POST | `/api/v1/admin/profiles/{type}/{id}/reject-government-id` | admin |

Existing endpoint unchanged: `POST /api/v1/admin/profiles/{type}/{id}/verify-government-id`.
