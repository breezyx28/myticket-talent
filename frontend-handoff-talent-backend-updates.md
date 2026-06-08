# Talent dashboard — backend updates (P0/P1 resolution)

**Date:** 2026-05-18  
**Audience:** Talent dashboard SPA (`FRONTEND_TALENT_URL`)  
**Supersedes gaps in:** [`TALENT_BACKEND_GAPS.md`](../TALENT_BACKEND_GAPS.md) (P0/P1 items)  
**Base guide:** [`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md)

---

## Summary

| Topic | Status |
|-------|--------|
| `FRONTEND_TALENT_URL` + CORS | Added — see [`config/frontends.php`](../config/frontends.php), [`config/cors.php`](../config/cors.php) |
| Shared file upload | `POST /api/v1/main/uploads` |
| Engagement messages | `GET /me/engagements/{id}/messages` (asc by `created_at`) |
| Engagement list filters | `page`, `per_page` (max 50), optional `status` |
| Hybrid availability | Accept → `reserved`; complete/cancel from accepted → `available` |
| Submit validation | Bio ≥ 30 chars, ≥ 1 media, disclaimer required |
| Response aliases | `saudi_region_id`, `profile_image` on `talent_application` |
| Notifications | Approve/reject + engagement messages use `FrontendUrl::talent(...)` |

---

## Environment

```env
FRONTEND_TALENT_URL=https://myticket-talent.kat-jr.com
FRONTEND_VENDOR_URL=https://myticket-vendor.kat-jr.com
```

Notification deep links:

| Event | `href` |
|-------|--------|
| Application approved | `{FRONTEND_TALENT_URL}/` |
| Application rejected | `{FRONTEND_TALENT_URL}/application/status` |
| New engagement message (recipient is talent) | `{FRONTEND_TALENT_URL}/engagements?focus={engagementId}` |

OAuth: existing `POST /auth/oauth/{provider}/start` returns `{ redirect_url, state }`. Ensure talent origin is allowed in provider redirect URIs and `SANCTUM_STATEFUL_DOMAINS` if using cookie auth.

---

## `POST /api/v1/main/uploads`

**Auth:** Bearer (`app:main`)

Multipart form:

| Field | Required | Notes |
|-------|----------|-------|
| `file` | Yes | Image or PDF, max 12 MB |
| `context` | No | `talent_application`, `vendor_application`, `vendor_document` |

**`201`**

```json
{
  "data": {
    "url": "https://<host>/storage/marketplace/talent-media/abc.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 102400
  }
}
```

Use returned `url` in `PATCH /role-applications/talent/{id}` (`profile_image`) and `POST .../media` (`value`).

```ts
async function uploadToCdn(file: File, context = 'talent_application') {
  const form = new FormData();
  form.append('file', file);
  form.append('context', context);
  const res = await api.post<{ data: { url: string } }>('/uploads', form);
  return res.data.url;
}
```

---

## Engagements

### List — `GET /me/engagements`

Query params:

| Param | Default | Notes |
|-------|---------|-------|
| `page` | 1 | Laravel pagination |
| `per_page` | 20 | Capped at 50 |
| `status` | — | Filter: `pending`, `accepted`, `declined`, `closed`, `cancelled` |

### Messages — `GET /me/engagements/{id}/messages`

**Auth:** Participant (`target_user_id` or `organizer_user_id`)

Returns `{ data: messages[] }` ordered **ascending** by `created_at` (chat UI). Organizer API uses `latest` — talent/vendor inbox uses ascending.

```ts
type EngagementMessage = {
  id: number;
  engagement_id: number;
  sender: 'organizer' | 'talent' | 'vendor';
  body: string;
  attachment_url: string | null;
  created_at: string;
};
```

### Hybrid availability

| Action | Talent `availability_status` |
|--------|------------------------------|
| `POST .../accept` | `reserved` |
| `POST .../decline` (from pending) | unchanged |
| `POST .../complete` (from accepted) | `available` |
| `POST .../cancel` (from accepted) | `available` |
| `PUT /me/talent-availability` | manual override |

Manual `PUT /me/talent-availability` still works for override.

---

## Role application — submit validation

On `POST /role-applications/talent/{id}/submit`, **`422`** with field errors when:

| Field | Rule |
|-------|------|
| `bio` | Trimmed length ≥ 30 |
| `media` | ≥ 1 `talent_application_media` row |
| `accepted_quality_disclaimer` | Must be `true` |

---

## Role application — response aliases

`GET /role-applications/talent/{id}` and `PATCH` responses include **both** canonical DB fields and frontend aliases on `talent_application`:

| Alias | Canonical |
|-------|-----------|
| `saudi_region_id` | `region_id` |
| `profile_image` | `profile_image_url` |

`PATCH` already accepts `saudi_region_id` and `profile_image`.

---

## Frontend unblock checklist

- [x] Replace local upload stub with `POST /uploads` → pass `url` into PATCH/media
- [x] Load thread via `GET /me/engagements/{id}/messages` instead of empty state
- [x] Use `per_page` + `status` on engagement inbox
- [x] After accept/complete, refetch availability or profile badge
- [x] Map submit `422` errors to wizard fields
- [x] Prefer `saudi_region_id` / `profile_image` in forms; keep reading canonical fields for backward compat

---

## Tests

[`tests/Feature/Marketplace/TalentDashboardGapsTest.php`](../tests/Feature/Marketplace/TalentDashboardGapsTest.php)
