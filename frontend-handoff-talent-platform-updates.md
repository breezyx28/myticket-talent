# Frontend handoff: Talent platform updates

**Date:** 2026-06-22  
**Audience:** Talent dashboard / SPA  
**API base:** `https://<host>/api/v1/main` (all talent routes live on main API)  
**Auth:** Sanctum token with `app:main`  
**Related:** [`frontend-handoff-talent-api.md`](frontend-handoff-talent-api.md), [`frontend-handoff-register-with-role.md`](frontend-handoff-register-with-role.md), [`frontend-handoff-api-localization.md`](frontend-handoff-api-localization.md)

---

## Summary

| Area | What changed | Frontend action |
|------|----------------|-----------------|
| Register (`role: talent`) | Returns main-app token in `201` | Store token after signup on main |
| Talent profile images | Full URLs on read | Use `profile_image` / `profile_image_url` as `src` |
| Notifications | Arabic via `Accept-Language` | Locale header on inbox calls |
| Localization | Validation & errors localized | Send `Accept-Language` on all requests |

---

## 1. Signup with `role: talent`

**Endpoint:** `POST /api/v1/main/auth/register`

```json
{
  "email": "talent@example.com",
  "password": "Password123!",
  "full_name": "Talent User",
  "role": "talent"
}
```

**201 response:**

```json
{
  "message": "Registered successfully.",
  "user_id": 6,
  "role": "talent",
  "token": "1|…",
  "refresh_token": null,
  "expires_at": "2026-06-23T12:00:00+00:00",
  "user": {
    "id": 6,
    "email": "talent@example.com",
    "full_name": "Talent User",
    "role": "talent"
  }
}
```

### Flow

```
POST /main/auth/register { role: "talent" }  → store token
→ email verify link (optional gating)
POST /main/auth/login                        → still valid if you need a fresh token
GET  /main/me/talent-profile                 → 404 until approved + provisioned
```

After admin approval, `GET /me/talent-profile` returns the live profile. Direct register does **not** use role-application endpoints.

---

## 2. Profile image absolute URLs

**Endpoints:** `GET /me/talent-profile`, `PATCH /me/talent-profile`

Both fields are now the **same absolute URL**:

```json
{
  "data": {
    "profile_image_url": "https://myticket-api.kat-jr.com/storage/users/profile-images/6/avatar.jpg",
    "profile_image": "https://myticket-api.kat-jr.com/storage/users/profile-images/6/avatar.jpg"
  }
}
```

### Implementation

- Use either field for display (`profile_image` is an alias).
- On `PATCH`, you may still send a URL from `POST /uploads` or `POST /me/profile-image`; storage keeps relative paths server-side.
- External CDN URLs (`https://cdn…`) pass through unchanged.

---

## 3. Notifications

**Base:** `/api/v1/main/me/notifications` (same token as talent routes)

Send `Accept-Language: ar` or `en` so titles/bodies resolve in the user’s UI language.

Relevant notification kinds for talent:

| `kind` | Typical trigger |
|--------|-----------------|
| `role_application_approved` | Admin approved application |
| `role_application_rejected` | Application needs changes |
| `government_id_verified` / `government_id_rejected` | ID review |
| `engagement` | New engagement message |
| `waitlist` | Seat available |

Role application bodies localize `:type` (`talent` → `الموهبة` in Arabic).

---

## 4. Localization

Add to your API client:

```http
Accept-Language: ar
```

Covers: validation on profile PATCH, auth errors, notification inbox, engagement errors.

Reference data (no auth):

| Endpoint | Use |
|----------|-----|
| `GET /reference/talent-categories` | Category picker |
| `GET /reference/saudi-regions` | Region + nested cities |
| `GET /reference/saudi-cities?region_id=` | City list |

---

## QA checklist

- [ ] Register as talent → token works on `GET /me/talent-profile` after approval
- [ ] Profile avatar renders without prepending API host
- [ ] Notification list in Arabic when UI is Arabic
- [ ] Category / region pickers use reference endpoints
