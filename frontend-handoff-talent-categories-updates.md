# Talent dashboard — multi-categories, discovery filters & admin CRUD

**Date:** 2026-06-12  
**Audience:** Talent dashboard SPA (`FRONTEND_TALENT_URL`), main website discovery, admin dashboard  
**Full API reference:** [`talent-api-endpoints.md`](talent-api-endpoints.md)

---

## Summary

| Topic | Change |
|-------|--------|
| Talent category badges | Multi-select tags (singer, magician, comedian, …) on application + live profile |
| Reference list | `GET /reference/talent-categories` (public) |
| Custom badges | `POST /talent-categories` when preset list has no match |
| Bulk sync | `PUT` on application (draft/rejected) and `PUT /me/talent-profile/categories` (live) |
| Discovery | `GET /talents` and `GET /talents/{slug}` return enriched `categories`; filter by slug or id |
| Vendor discovery | `GET /vendors` responses also return enriched `categories` + category filters |
| Admin CRUD | Full manage APIs for **talent** and **vendor** category taxonomies |

**Deploy**

```bash
php artisan migrate
```

Adds `talent_categories.created_by_user_id` (nullable) for user-created custom badges.

---

## 1. Talent category badges

Talents pick **multiple categories** as badges during onboarding and on the live profile. Preset badges come from the seeded reference list; talents can **create a custom badge** if none fits (same pattern as vendor service categories).

### Preset categories (seeded)

| `slug` | `name_en` |
|--------|-----------|
| `singer` | Singer |
| `musician` | Musician |
| `band` | Band |
| `dj` | DJ |
| `actor` | Actor |
| `comedian` | Comedian |
| `dancer` | Dancer |
| `host_mc` | Host / MC |
| `motivational` | Motivational Speaker |
| `poet` | Poet |
| `photographer` | Photographer |
| `videographer` | Videographer |
| `illusionist` | Illusionist / Magician |
| `athlete` | Athlete |
| `influencer` | Influencer |

---

## 2. List badges

**Public (no auth):**

```
GET /api/v1/main/reference/talent-categories
```

**Authenticated (same payload):**

```
GET /api/v1/main/talent-categories
```

**`200`**

```json
{
  "data": [
    {
      "id": 1,
      "slug": "singer",
      "name_en": "Singer",
      "name_ar": "مغني",
      "is_active": true,
      "display_order": 1,
      "is_custom": false,
      "created_by_user_id": null
    }
  ]
}
```

| Field | Meaning |
|-------|---------|
| `is_custom` | `true` when created by a talent user |
| `created_by_user_id` | User who created a custom badge; `null` for seeded/system badges |

---

## 3. Create custom badge

When the talent types a category that is not in the list:

```
POST /api/v1/main/talent-categories
```

```json
{
  "name_en": "Standup Comedian",
  "name_ar": "كوميدي ستاند أب"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name_en` | yes* | English label |
| `name` | yes* | Alias for `name_en` |
| `name_ar` | no | Defaults to `name_en` |

\* One of `name_en` or `name` is required.

**`201`** — returns the new (or existing) category with `is_custom: true`.

If another user already created the same `name_en`, the API returns the **existing** row (no duplicate).

---

## 4. Multi-category sync (bulk replace)

Use **`PUT`** to set all selected badges in one request instead of many `POST`/`DELETE` calls.

### During application (draft or rejected only)

```
PUT /api/v1/main/role-applications/talent/{role_application_id}/categories
```

`{role_application_id}` = `role_applications.id` from `POST /role-applications/talent`.

### On live profile (after approval)

```
PUT /api/v1/main/me/talent-profile/categories
```

### Request body

```json
{
  "categories": [
    { "talent_category_id": 1 },
    { "category_id": 1 },
    { "slug": "illusionist" },
    { "name_en": "Standup Comedian", "name_ar": "كوميدي" }
  ]
}
```

Each array item must include **one** of:

| Key | Description |
|-----|-------------|
| `talent_category_id` or `category_id` | ID from badge list |
| `slug` | e.g. `singer`, `illusionist` |
| `name_en` or `name` | Creates or reuses a custom badge |

Minimum **1** category in the array.

### Response `200`

```json
{
  "data": {
    "categories": [
      {
        "id": 8,
        "talent_application_id": 3,
        "talent_category_id": 1,
        "slug": "singer",
        "name_en": "Singer",
        "name_ar": "مغني",
        "is_active": true,
        "display_order": 1,
        "is_custom": false,
        "created_by_user_id": null
      }
    ]
  }
}
```

On live profile sync, rows use `talent_profile_id` instead of `talent_application_id`.

### Legacy single attach/detach (still supported)

```
POST   /role-applications/talent/{id}/categories   { "slug": "singer" }
DELETE /role-applications/talent/{id}/categories/{rowId}
```

`POST` also accepts `talent_category_id` or `category_id`.

Application category changes are only allowed while status is **`draft`** or **`rejected`**.

---

## 5. Enriched responses (talent profile & application)

These endpoints now include a `categories` array with slug, `name_en`, `name_ar`, and `is_custom` — not just pivot ids.

| Endpoint | Notes |
|----------|-------|
| `GET /me/talent-profile` | Live profile + `categories` |
| `PATCH /me/talent-profile` | Response includes `categories` |
| `GET /role-applications/talent/{id}` | `data.talent_application.categories` |

**Example `GET /me/talent-profile` fragment**

```json
{
  "data": {
    "id": 12,
    "slug": "magic-mike",
    "stage_name": "Magic Mike",
    "profile_image": "https://…",
    "categories": [
      {
        "id": 4,
        "talent_profile_id": 12,
        "talent_category_id": 13,
        "slug": "illusionist",
        "name_en": "Illusionist / Magician",
        "name_ar": "ساحر",
        "is_custom": false
      }
    ]
  }
}
```

On approval, application categories are copied to the live profile automatically (provisioning).

---

## 6. Public discovery (search & filter)

### List talents

```
GET /api/v1/main/talents
```

**Query filters**

| Param | Description |
|-------|-------------|
| `category_id` | Filter by `talent_categories.id` |
| `talent_category_id` | Same as `category_id` |
| `category_slug` | Filter by slug, e.g. `singer` |
| `category` | Alias for `category_slug` |
| `city_id` | Existing city filter |

Each item in `data` includes top-level `categories` (enriched).

### Talent detail

```
GET /api/v1/main/talents/{slug}
```

**`200`** — `data.categories` array on the profile object.

### List vendors (updated)

```
GET /api/v1/main/vendors
```

**Query filters**

| Param | Description |
|-------|-------------|
| `category_id` | Filter by `vendor_service_categories.id` |
| `service_category_id` | Same as `category_id` |
| `category_slug` / `category` | Filter by slug |
| `city_id` | Existing city filter |

```
GET /api/v1/main/vendors/{slug}
```

Both vendor list and detail now return enriched `categories` (same shape as vendor profile sync).

**Frontend filter chips:** load reference lists once, render chips by `name_en` / `name_ar`, call list APIs with `?category_slug=<slug>`.

---

## 7. Admin dashboard — category CRUD

Admins can manage both taxonomies. All routes require admin auth (`app.scope:admin_dashboard`).

### Talent categories

| Method | Path |
|--------|------|
| GET | `/api/v1/admin/talent-categories` |
| POST | `/api/v1/admin/talent-categories` |
| PATCH | `/api/v1/admin/talent-categories/{id}` |
| DELETE | `/api/v1/admin/talent-categories/{id}` |

**Create body**

```json
{
  "slug": "standup-comedian",
  "name_en": "Standup Comedian",
  "name_ar": "كوميدي ستاند أب",
  "is_active": true,
  "display_order": 20
}
```

**Delete** returns **`422`** if the category is assigned to any talent profile or application.

### Vendor service categories

| Method | Path |
|--------|------|
| GET | `/api/v1/admin/vendor-service-categories` |
| POST | `/api/v1/admin/vendor-service-categories` |
| PATCH | `/api/v1/admin/vendor-service-categories/{id}` |
| DELETE | `/api/v1/admin/vendor-service-categories/{id}` |

Same create/update/delete rules as talent categories.

### Admin talent directory (filter + categories on rows)

```
GET /api/v1/admin/profiles/talents
```

Supports `talent_category_id`, `category_id`, `category_slug`, and `category`. Each row includes `categories` and `profile.categories`.

---

## 8. Recommended frontend flows

### Onboarding wizard — categories step

1. `GET /reference/talent-categories` → render multi-select badge chips.
2. User selects multiple badges.
3. Optional: user types a new name → `POST /talent-categories` **or** include `{ "name_en": "..." }` in the bulk `PUT`.
4. `PUT /role-applications/talent/{id}/categories` with full selection before submit.

### Profile settings — categories (approved talent)

1. Load current badges from `GET /me/talent-profile` → `data.categories`.
2. On save → `PUT /me/talent-profile/categories` with updated `categories` array.

### Marketplace browse — talent filter

1. `GET /reference/talent-categories` for filter UI.
2. On chip click → `GET /talents?category_slug=singer` (or `category_id=1`).
3. Render `categories` badges on each card from list response.

### Admin — manage taxonomy

1. CRUD screens wired to `/api/v1/admin/talent-categories` and `/api/v1/admin/vendor-service-categories`.
2. Disable delete (or show error) when API returns 422 “assigned to profiles or applications”.

---

## 9. Tests

[`tests/Feature/Marketplace/TalentCategoryTest.php`](../tests/Feature/Marketplace/TalentCategoryTest.php) — covers:

- Reference talent categories
- Custom category creation
- Bulk category sync on application
- Discovery list/detail enriched categories + `category_slug` filter

Vendor category tests remain in [`VendorDashboardGapsTest.php`](../tests/Feature/Marketplace/VendorDashboardGapsTest.php).

---

## Related docs

- [`talent-api-endpoints.md`](talent-api-endpoints.md) — full talent endpoint reference
- [`frontend-handoff-talent-backend-updates.md`](frontend-handoff-talent-backend-updates.md) — earlier P0/P1 talent work
- [`frontend-handoff-vendor-categories-and-profile-updates.md`](frontend-handoff-vendor-categories-and-profile-updates.md) — vendor category pattern (mirror)
- [`marketplace-gaps-and-solutions.md`](marketplace-gaps-and-solutions.md) — cross-platform gap log
