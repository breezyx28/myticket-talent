# MyTicket Platform — Product Flow & Requirements Documentation

> **Status:** Brainstorm / Design Phase  
> **Last Updated:** April 2026

---

## 1. Overview

MyTicket is an entertainment ticketing platform that allows users to discover, book, and attend events using QR-based ticketing. The platform supports a structured role ecosystem including guests, talents, vendors, organizers, event scanners, and admins. It operates in **SAR (Saudi Riyal)** and supports **bilingual UI (Arabic + English)** with full RTL/LTR layout switching.

---

## 2. User Roles

| Role | Description | Capabilities |
|---|---|---|
| **Guest** | Default user / registered visitor | Browse events, buy tickets, gift tickets, rate attended events |
| **Talent** | Artist, performer, or entertainer | All guest capabilities + talent profile listing in Marketplace |
| **Vendor** | Service provider (venue, catering, security, AV, etc.) | All guest capabilities + vendor profile listing in Marketplace |
| **Organizer** | Event creator and manager | All talent capabilities + create/manage events, hire talents and vendors, assign scanners |
| **Event Scanner** | Created by Organizer, linked to their account | Scan QR codes at event entry via browser; can be assigned to multiple events |
| **Admin** | Platform superuser | Full moderation, approvals, analytics, user management, fee configuration |

### Role Rules

- All roles (Guest, Talent, Vendor, Organizer) can buy tickets using the same account.
- A user can hold **only one role at a time**.
- **Role selection is final.** Once a user upgrades from Guest to any role (Talent, Vendor, or Organizer), the decision is **permanent** — no further upgrades, downgrades, or role switching is allowed.
- **All role applications** (Talent, Vendor, and Organizer) require **Admin approval** before the role is granted.
- Admin is a permanent elevated role — not subject to the role selection flow.
- Event Scanner is a **temporary role** created by the Organizer and linked to the Organizer's account. A Scanner can be assigned to **multiple events** simultaneously.
- **Vendor** is a distinct role separate from Talent — Vendors provide logistical services (venue rental, security guards, catering, lighting, sound systems, staffing, etc.), while Talents provide artistic/performance services.

---

## 3. User Registration & Authentication

### Registration Flow

1. User visits the platform and can **browse events in guest mode** (no account required).
2. When the user attempts to **buy a ticket** (or perform any authenticated action), the system prompts them to register or log in before proceeding.
3. After registration, the user is returned to the purchase flow to continue seamlessly.

### Registration Methods

- **Email/Password:** Standard registration with email and password.
- **Google Social Login:** One-click registration/login via Google account.

### Terms of Service Agreement

During registration, the user must agree to the platform's **Terms of Service** and **Privacy Policy** before their account is created:

1. The Terms of Service and Privacy Policy are presented as readable documents (linked or inline).
2. The user must **read the terms** (scrollable content or link to full document).
3. The user checks a **mandatory checkbox** confirming they have read and agree to the terms.
4. The user clicks the **"Agree"** button to proceed with registration.
5. Registration **cannot proceed** without accepting the terms.
6. The terms include policies on: refunds (auction-only recovery), ticket gifting restrictions, overlapping event disclaimers, account deletion (data loss, automatic ticket auction), role finality, and platform liability.

### Required Registration Information

| Field | Required | Notes |
|---|---|---|
| Full name | Yes | First and last name |
| Email address | Yes | Must be verified via email confirmation link |
| Phone number | Yes | Must be verified via **OTP (one-time password)** |
| Profile image | No | Optional — users may upload a profile picture. All user profiles are **public**. |

### Verification Requirements

- **Email verification:** Confirmation link sent to the provided email address. Account is not fully activated until email is verified.
- **Phone OTP verification:** A one-time code is sent via SMS to the provided phone number. Must be completed during registration.
- Both verifications are **required** — the account is not usable until both are confirmed.

### Profile Management

Users can **edit their profile information** at any time from their account settings:

- **Editable fields:** full name, phone number, email address, profile image.
- **Re-verification required:** if the user changes their **email address**, a new email verification link is sent. If the user changes their **phone number**, a new OTP verification is required. The old contact method remains active until the new one is verified.
- **Future enhancement:** ID document verification option — users will be able to upload an official ID document for additional account verification and trust.

### Password Reset

Standard "Forgot Password" flow:

1. User clicks **"Forgot Password"** on the login page.
2. User enters their registered email address.
3. System sends a **password reset link** to the email.
4. User clicks the link and is directed to a secure page to set a new password.
5. Password is updated and the user can log in with the new credentials.

### Guest Browsing Mode

- Non-registered visitors can browse events, view event details, and explore the platform freely.
- Any action that requires identity (buying tickets, gifting, rating, accessing the Marketplace) triggers a **registration/login prompt**.
- After registering (via Google or email/password), the user is redirected back to continue the action they initiated.

---

## 4. Role Application & Approval Flow

1. User registers as Guest (default role upon registration).
2. User submits a role application (Talent, Vendor, or Organizer) with supporting documents.
3. Admin reviews and approves or rejects the application.
4. On approval: role is granted **permanently** and user receives email + in-app notification. The role **cannot be changed** after approval.
5. On rejection: user receives email + in-app notification with reason. The user may revise and resubmit.
6. **Talent profiles** are subject to admin review — the Admin approves or rejects the Talent based on profile quality, verification media, and certificates. A **disclaimer about upload quality** is shown to Talents during profile setup (e.g., minimum resolution, clear content, professional presentation).

---

## 5. Event Categories

Event categories are **managed by the Admin** and used to classify events across the platform.

### Category Properties

| Property | Required | Description |
|---|---|---|
| Name | Yes | Category display name (e.g., "Concerts", "Sports", "Theater") |
| Icon | Yes | Visual icon representing the category |
| Color | No | Optional accent color for UI presentation |

### Category Rules

- Categories are **predefined by the Admin** — Organizers cannot create custom categories.
- Admin can create, edit, or deactivate categories at any time.
- Each event must be assigned to at least one category during creation.
- Categories are used in search filters and on the home page for discovery.

---

## 6. Event Creation Flow (Organizer)

1. Organizer creates an event (title, description, dates, location, category).
2. Organizer configures **event duration and schedule** (see Event Duration & Recurring Events below).
3. Selects a **layout type**:
   - **Grid** — cinema-style, with rows and columns.
   - **Section** — stadium/concert style, grouped sections.
   - **Free** — open event (no assigned seats).
4. For Grid/Section layouts:
   - Organizer selects a **pre-built seat template** OR customizes manually:
     - Define number of rows and columns.
     - Set spacing between seats and between rows.
     - Apply spacing to specific rows or columns independently.
5. Organizer configures **ticket types and pricing** (see Ticket Types & Pricing below).
6. Organizer configures **accessibility seats** (see Accessibility Seating below).
7. Organizer configures **ticket entry mode** (see Ticket Entry Mode below).
8. Organizer optionally sets **purchase limits** (see Purchase Limits below).
9. Organizer **publishes the event** — it goes live immediately and is visible to the public.
10. Organizer assigns Event Scanner accounts (see Section 12).

### Ticket Types & Pricing

The Organizer can define **multiple ticket types** for a single event. Pricing is assigned **per-seat** — each individual seat is assigned a ticket type and its corresponding price:

| Ticket Type | Description | Price |
|---|---|---|
| **VIP** | Premium seating | Set by Organizer per seat |
| **Standard** | General seating | Set by Organizer per seat |
| **Economy** | Budget seating | Set by Organizer per seat |
| **Accessibility** | Designated accessible seats | Set by Organizer per seat |
| *(Custom)* | Organizer-defined label | Set by Organizer per seat |

- Each **individual seat** is assigned a ticket type and price by the Organizer in the layout editor.
- Seats are not grouped into pricing tiers by section or row — the Organizer has **per-seat control** over which ticket type and price each seat receives.
- For **free-layout events**, the Organizer sets a **maximum event capacity** (total number of attendees) and defines ticket types with quantity limits instead of seat assignments. The total of all ticket type quantities cannot exceed the maximum capacity.

### Accessibility Seating

- The Organizer can designate specific seats as **accessibility / special needs seats** directly from the seat layout UI.
- Accessibility seats are selected visually by clicking on individual seats or seat groups in the layout editor.
- These seats have their own **ticket type** (e.g., "Accessibility") with a price set by the Organizer.
- Accessibility seats are visually distinguished on the public seat map so users can identify them easily.

### Event Duration & Recurring Events

Events are **fully customizable** in terms of duration and recurrence:

**Single-Day Events:**
- Standard event with a single start date/time and end date/time.

**Multi-Day Events:**
- An event can span **multiple consecutive days** (e.g., a 3-day festival).
- The Organizer configures the start date and end date.
- Ticketing is customizable: the Organizer decides whether one ticket covers the full duration or separate tickets are required per day.

**Recurring Events:**
- Organizer can create **recurring events** with a defined schedule pattern.
- Configuration includes:
  - **Start date** and **end date** of the recurrence window (e.g., 1 April to 30 April).
  - **Recurrence pattern**: specific days of the week (e.g., "every Friday", "every Tuesday and Thursday").
- The system generates individual event occurrences based on the pattern.
- Each occurrence can be managed independently (e.g., cancel a single occurrence without affecting the rest).
- Recurring events share the same base configuration (layout, ticket types, pricing) but each occurrence has its own ticket inventory and booking state.

### Purchase Limits

- The Organizer can set a **maximum number of tickets** a single user can purchase per event.
- This setting is **optional** — if not set, there is no limit (unlimited purchases per user).
- The Admin can also set or override purchase limits at the platform level.
- Purchase limits help prevent ticket hoarding and ensure fair access.

### Ticket Entry Mode

Each event has a configurable **ticket entry mode** that determines how QR scanning behaves at the gate:

- **One-Time Entry (default):** The ticket is scanned once. After a successful scan, the ticket status is set to USED and cannot be scanned again. This is suitable for most events.
- **Multi-Scan Mode:** The Organizer can enable multi-scan, allowing the ticket to be scanned **multiple times** throughout the event duration. The ticket remains valid until the event ends. This is suitable for events where attendees may need to re-enter (e.g., multi-day festivals, venues with in-and-out privileges).

The entry mode is set during event creation and applies to all tickets for that event.

### Post-Publish Event Editing

Organizers **can edit** an event after it has been published. Editable fields include (but are not limited to): event date, time, location, description, layout, and ticket pricing.

**When an event is edited after tickets have been sold:**

1. The system displays a **strong alert with a disclaimer** to the Organizer before saving changes, warning them of the impact on existing ticket holders.
2. The system generates a **strong notification** (email + in-app) sent to every user who has already purchased a ticket for that event.
3. The notification clearly lists **each field that was changed**, showing the **old value** and the **new value** side by side, so users can see exactly what changed.
4. If the Organizer makes **significant changes** (e.g., event duration, date, time, location), the **Organizer is responsible for issuing refunds** to affected ticket holders. The platform facilitates the refund process, but the decision and financial responsibility lie with the Organizer.
5. If the Organizer changes the seat layout in a way that affects already-booked seats, those specific ticket holders are prioritized for notification and refund eligibility.

---

## 7. Event Discovery, Search & Categories

### Home Page Discovery

- The home page displays a **Featured Events** section.
- Featured events use an **algorithmic mode by default** — automatically featuring events based on popularity (most sold, most viewed, etc.).
- The **Admin** can **override the algorithm** at any time by manually selecting specific events to feature.
- If the Admin does not set any manual overrides, the algorithm remains the default.
- Events are browsable by **category** — category cards/tabs are displayed prominently for quick filtering.

### Event Card (Browse View)

When browsing events (home page, search results, category pages), each event is displayed as a **card** showing the most important information at a glance:

| Element | Description |
|---|---|
| **Cover image** | Primary event image / banner |
| **Event name** | Title of the event |
| **Location** | Venue name and/or city |
| **Description** | Short summary / excerpt |
| **Available tickets** | Number of tickets still available (e.g., "42 tickets left") |
| **CTA button** | Primary action button (e.g., "View Event" or "Get Tickets") |

### Event Detail Page (Full View)

Clicking on an event card opens a **dedicated event page** with comprehensive information:

| Section | Content |
|---|---|
| **Event info** | Full title, complete description, date & time, location with map, category |
| **Cover & gallery** | Cover image + additional event images/videos uploaded by the Organizer |
| **Ticket options** | All available ticket types with prices, seat map (for seated events), and purchase CTA |
| **Organizer info** | Organizer profile summary (name, logo, bio, link to full profile) |
| **Talents** | List of Talents associated with the event (name, photo, link to profile) — **shown only if the Organizer enables it** (per-event toggle) |
| **Vendors** | List of Vendors associated with the event (name, service type, link to profile) — **shown only if the Organizer enables it** (per-event toggle) |
| **Ratings** | Average star rating from past attendees (for recurring or past events) |
| **Share** | Social media sharing buttons and copy-link option |

### Search & Filters

Users can search and filter events using the following criteria:

| Filter | Type | Description |
|---|---|---|
| **Keyword** | Text search | Search by event title, description, or artist name |
| **Category** | Dropdown / tags | Filter by admin-defined event categories |
| **Date range** | Date picker | From date → to date |
| **Location / City** | Dropdown or map | Filter by city or geographic area |
| **Price range** | Slider / min-max | Filter by ticket price range |
| **Layout type** | Toggle / checkbox | Seated (Grid/Section) vs. Free-layout |
| **Availability** | Toggle | Show only events with available tickets |

---

## 8. Booking Flow (Guest / Any Role)

1. User browses and selects an event.
2. **For seated events (Grid / Section):**
   - User views the seat map.
   - User selects one or more available seats (one ticket = one seat).
3. **For free-layout events:**
   - User selects quantity of tickets (for self, friends, or family).
4. User proceeds to checkout.
5. **If user is not logged in:** registration/login prompt is displayed. After authentication, the user continues the checkout flow seamlessly.
6. Selected seats are **locked** while the payment is being processed (see Seat Locking Logic below).
7. Payment is processed via Payment Gateway.
8. On **payment success:**
   - Booking record is created.
   - Each seat is marked as BOOKED (lock becomes permanent).
   - A unique QR ticket is generated per seat/ticket.
   - User receives QR tickets via **email (with ticket PDF attached)** + in-app notification.
   - A **success dialog modal** is displayed with celebration/party animations, containing a link to the **ticket details page** (see Booking Confirmation below).
9. On **payment failure:**
   - Seat locks are **released** immediately, making the seats available to other users.
   - User is notified and may retry.

### Booking Confirmation

After a successful purchase, the user sees a **success dialog modal** with:

- **Celebration animation** — party/confetti effect to create a positive purchase moment.
- **Order summary** — event name, number of tickets, total amount paid, order/receipt number.
- **"View My Tickets" link** — redirects to the user's **ticket details page** within their profile.

The ticket details page (within the user's profile) shows:

| Element | Description |
|---|---|
| **Order/receipt number** | Unique reference for this booking |
| **Event details** | Event name, date, time, location |
| **Ticket list** | Each ticket with seat info, ticket type, QR code preview |
| **Download options** | PDF download button, "Add to Wallet" button (Apple/Google) |
| **Actions** | "Gift Ticket", "Drop to Auction" buttons per ticket |
| **Payment summary** | Ticket prices, fees, total paid, payment method |

### My Tickets Page

The **My Tickets** page in the user's profile provides a central view of all their tickets:

| Ticket Status | Description | Available Actions |
|---|---|---|
| **Active** | Valid, upcoming event, not yet used | Gift, Auction, Download PDF, Add to Wallet |
| **In Auction** | Currently listed for resale | View listing, Cancel auction listing |
| **Gifted** | Transferred to another user | View gift confirmation (read-only) |
| **Used** | Scanned and admitted at event | View details, Rate event |
| **Expired** | Event has ended, ticket not used | View details (read-only) |
| **Cancelled** | Event was cancelled, refund issued | View refund details |

### Group Booking & Ticket Assignment

When a user books multiple tickets in a single transaction, each ticket is generated **separately** (one ticket per seat, not a combined ticket). The buyer has two options:

- **Hold all tickets:** The buyer is the holder of all tickets. All QR codes are sent to the buyer's account. The group enters the event together using the buyer's tickets. No name assignment is required.
- **Gift individual tickets:** The buyer can send any individual ticket to another person via their **email address**. If the recipient is a **registered user**, they receive the ticket PDF + a link to their profile dashboard. If the recipient is **not registered**, the email includes a **registration link** — after registering, the ticket is claimed automatically to their account. See Section 9 (Ticket Gifting) for full gifting rules.

### Overlapping Event Warning

If a user attempts to purchase tickets for an event that **overlaps in date and time** with another event they already have tickets for, the system displays:

1. A clear **warning alert** informing the user that they already hold tickets for another event at the same time.
2. A **disclaimer statement**: _"MyTicket is not responsible for scheduling conflicts resulting from your decision to purchase overlapping event tickets."_
3. A **"Read here"** link that opens the relevant section of the Terms of Service explaining that overlapping-event purchases are **non-refundable** — the user cannot request a refund based on a scheduling conflict they chose to ignore.
4. An **"Ignore & Continue"** button allowing the user to proceed with the purchase at their own risk.
5. If the user does not click "Ignore & Continue", the purchase is not completed and they are returned to the event page.

### Refund Policy (User-Initiated)

- There is **no direct refund** for change of mind. Users cannot cancel a ticket and request a refund simply because they no longer wish to attend.
- The **auction system is the only way** for a user to recover their ticket value — by listing the ticket for resale before the event day. The seller can set the auction price at the **original purchase price or less**.
- If the Organizer does not offer a direct bank refund, the user's recourse is to resell through the auction. A **disclaimer** explaining the refund duration and refund policy is displayed, and the ticket is **deactivated automatically** upon expiry.
- Refunds are only issued in the following cases:
  - **Event cancellation** by the Organizer or Admin — handled per the cancellation agreement with the organizer (see Section 14).
  - **Significant event edit** — the **Organizer is responsible** for issuing refunds when they make major changes (date, duration, location).
  - **Seat conflict** — payment reversed due to a race condition.

### Seat Locking Logic

- Seats are **locked when the user proceeds to checkout/payment**. The lock is held while the payment transaction is being processed.
- On **payment success**: the lock becomes a permanent booking — the seat is marked as BOOKED.
- On **payment failure**: the lock is **released immediately**, making the seat available to other users.
- Locks have a **timeout** — if a payment is not completed within a reasonable window, the lock expires and the seat is released.

### Race Condition Handling

When two users attempt to purchase the same seat at the same time (simultaneous checkout), the system uses a **fairness-first approach**:

1. **Both users' transactions are rejected** — neither user gets the seat.
2. Both users receive a clear **alert message**: _"A conflict occurred for the selected seat. Please try again."_
3. Both users are **redirected back to the seat selection view** with the seat map updated to reflect current availability.
4. The seats involved in the conflict are **released** so either user (or anyone else) can attempt to book them again.
5. Any payment holds or pre-authorizations for both transactions are released immediately.

---

## 9. Ticket Gifting & Direct Transfer

Users can gift (transfer) tickets directly to another person, outside of the auction system.

### Gifting Flow

1. User navigates to their tickets and selects **"Gift Ticket"** on one or more eligible tickets.
2. User enters the recipient's **email address** or **MyTicket username**.
3. The system checks if the recipient has a registered MyTicket account:
   - **If registered:** The gift is processed immediately. The recipient receives the ticket PDF via email + a link to their profile dashboard + in-app notification.
   - **If not registered:** The system sends an **invitation email** to the recipient containing a **registration link**. After the recipient registers, the ticket is **automatically claimed** to their new account.
4. On confirmation:
   - The sender's QR code for that ticket is **immediately invalidated**.
   - A **brand-new QR code** is generated for the recipient with fresh `ticketId`, `secureHash`, and updated ownership.
   - The sender receives a confirmation that the gift was delivered (or is pending registration for unregistered recipients).
5. The gifted ticket appears in the recipient's **My Tickets** section once claimed.

### Gifting Rules

- Only **valid** tickets can be gifted (not expired, not used, not cancelled, not currently listed in auction).
- Gifting is **free** — no platform fee is charged for direct transfers.
- Recipients do **not** need to have an existing MyTicket account. If unregistered, they receive an invitation email with a registration link to claim the ticket.
- Gifting does **not** involve any money exchange — it is a pure ownership transfer at no cost.
- **A gifted ticket cannot be re-gifted.** Once a ticket is received as a gift, the new holder cannot transfer it again to another user.
- **A gifted ticket cannot be listed in the auction.** The recipient must use the ticket themselves or let it expire — they cannot resell it.

---

## 10. Ticket Auction System

When a user can no longer attend an event, they may list their ticket(s) for resale via the platform's internal auction system.

### Auction Rules

- The seller can list a ticket at the **original purchase price or less** — no price increases above the original price are allowed.
- Auction is available **before the event day starts**.
- Once the event day begins, the auction window closes and no new listings are accepted.
- No refunds are available after the auction window closes.
- The auction has a **countdown timer** visible to buyers.
- Users can auction **individual tickets** from a multi-ticket booking — they are not required to auction all tickets at once. The user has full control: selectable, all, single, or custom selection.
- Only **valid** tickets can be listed for auction. Tickets that are expired, already used, or cancelled are not eligible.
- The platform takes a **commission** on auction sales (configurable by Admin). The seller receives the sale price minus the platform commission.
- **Auction-purchased tickets can be re-auctioned** — the buyer can list the ticket for resale again. However, **auction-purchased tickets cannot be gifted** — the buyer must use the ticket or re-auction it.

### Auction Flow

1. User navigates to their tickets and selects "Drop to Auction" on one or more eligible tickets.
2. Each selected ticket is listed individually in the Auction area at its original purchase price.
3. Another user purchases the auctioned ticket.
4. **QR Transfer:** The original seller's QR code is **immediately invalidated**. A **brand-new QR code** with a fresh `ticketId`, `secureHash`, and updated ownership is generated for the buyer. The old QR cannot be used for entry.
5. Original seller receives the sale proceeds automatically (sale price minus platform commission).
6. Buyer receives the newly generated QR ticket via email + in-app notification.
7. If the ticket is not sold before the auction deadline, it expires unsold — no refund issued to the seller.

### Auction UI

- **Auction area** displays event cards.
- Each event card shows the number of tickets currently available for resale.
- Buyers browse available tickets by event.
- Countdown timer displayed per listing and per event card.
- For seated events, the specific seat information (section, row, seat number, ticket type) is visible to potential buyers.

---

## 11. QR Code Ticket System

### QR Payload

Each QR code contains:
- `ticketId` — unique ticket identifier.
- `eventId` — the event the ticket belongs to.
- `secureHash` — cryptographic hash to prevent forgery.

### Ticket Appearance & Format

Each ticket is presented as a **professional, informative digital ticket** that gives the user everything they need at a glance:

| Element | Description |
|---|---|
| **QR code** | Scannable code for event entry (prominently displayed) |
| **Event name** | Full title of the event |
| **Date & time** | Event date, start time, and end time |
| **Location** | Venue name and address |
| **Seat details** | Section, row, and seat number (for seated events) or "General Admission" (for free-layout) |
| **Ticket type** | VIP, Standard, Economy, Accessibility, or custom label |
| **Ticket holder** | Name of the person the ticket belongs to |
| **Booking reference** | Unique booking/order ID for support queries |
| **Event cover image** | Small event banner for visual identification |

### Ticket Download & Wallet

- Users can **download their ticket as a PDF** — a clean, printable format with all ticket details and the QR code.
- Users can **save the ticket to their mobile wallet** (Apple Wallet / Google Wallet) for quick access at the event entrance.
- Tickets are also always accessible from the **My Tickets** section within the app/website.

### QR Lifecycle

A QR code is **regenerated** (old invalidated, new created) whenever ticket ownership changes:
- On **auction sale** — seller's QR invalidated, buyer gets new QR.
- On **ticket gift/transfer** — sender's QR invalidated, recipient gets new QR.

### Validation Logic

1. Scanner (browser-based) scans a QR code.
2. System checks if user (scanner) is logged in:
   - If **not logged in**: redirected to login page.
   - If **logged in**: scan result is displayed immediately.
3. Possible scan results:

**One-Time Entry Mode (default):**
   - ✅ **Succeeded** — ticket is valid, entry granted. Ticket status set to USED atomically.
   - ❌ **Failed** — hash mismatch or ticket not found.
   - 🔁 **Used** — ticket already scanned/used.
   - ⏰ **Expired** — event has ended.

**Multi-Scan Mode:**
   - ✅ **Succeeded** — ticket is valid, entry granted. Ticket remains ACTIVE (not set to USED) and can be scanned again for re-entry.
   - ❌ **Failed** — hash mismatch or ticket not found.
   - ⏰ **Expired** — event has ended. Ticket is automatically set to USED/EXPIRED when the event concludes.

4. Atomic update ensures no duplicate entry is possible in one-time mode (race-condition safe). In multi-scan mode, each scan is logged for attendance tracking.

---

## 12. Event Scanner System

### Scanner Assignment

- Organizer creates Event Scanner accounts by providing email addresses.
- Scanner accounts are **linked to the Organizer** — they belong to the Organizer, not to individual events.
- The Organizer **assigns scanners to specific events** from their dashboard. A single scanner can be assigned to **multiple events** simultaneously.
- The Organizer has full control over scanner-event associations: they can add, remove, or reassign scanners at any time.

### Scanner Lifecycle

- After an event ends, the scanner account remains active under the Organizer's management (it may still be assigned to other events).
- Organizer can create, update, or delete scanner accounts at any time from their dashboard.

### Scanner Interface

- Scanner logs in via browser.
- Browser opens camera to scan QR codes.
- Result is displayed instantly on screen (Succeeded / Failed / Used / Expired).
- Scanner has no other platform capabilities.

---

## 13. Organizer Dashboard

The Organizer has a **comprehensive, professional dashboard** that provides full visibility and control over their events, bookings, revenue, and marketplace activity.

### Event Management

| Feature | Description |
|---|---|
| **My Events** | List of all events (active, draft, archived) with status indicators |
| **Create Event** | Quick access to event creation flow |
| **Edit Event** | Modify any published or draft event |
| **Duplicate Event** | Clone an archived or past event as a starting point for a new one |
| **Event Status** | Visual indicators: Draft, Published, Sold Out, In Progress, Ended, Cancelled, Archived |
| **Scanner Management** | Create, assign, update, and delete Event Scanner accounts; assign scanners to multiple events |

### Sales & Booking Analytics

| Metric | Description |
|---|---|
| **Total tickets sold** | Aggregate and per-event breakdown |
| **Tickets remaining** | Available inventory per ticket type |
| **Revenue** | Total revenue, per-event revenue, per-ticket-type revenue |
| **Sales over time** | Timeline chart showing ticket sales velocity (daily/weekly/monthly) |
| **Ticket type distribution** | Breakdown of sales by VIP, Standard, Economy, Accessibility, etc. |
| **Booking list** | Detailed list of all bookings with buyer info, seat, ticket type, purchase date |
| **Auction activity** | Tickets currently in auction, sold via auction, expired unsold |

### Attendance & Scanner Activity

| Metric | Description |
|---|---|
| **Attendance count** | Number of tickets scanned (USED) vs. total sold |
| **Attendance rate** | Percentage of sold tickets that were actually scanned |
| **Scanner activity log** | Real-time or recent log of scans (timestamp, scanner, result) |
| **No-show count** | Tickets sold but not scanned by event end |

### Financial Overview

| Feature | Description |
|---|---|
| **Gross revenue** | Total ticket sales before fees |
| **Platform fees** | Fees deducted (if applicable, based on admin configuration) |
| **Net revenue** | Revenue after fees |
| **Refunds issued** | Total refunds processed (cancellations, event edits, auction returns) |
| **Payout status** | Payment settlement status from the payment gateway |

### Marketplace & Hiring

| Feature | Description |
|---|---|
| **Chat conversations** | All active and past chat threads with Talents and Vendors |
| **Hired Talents** | Talents currently committed to the Organizer's events |
| **Hired Vendors** | Vendors currently committed, with event associations |
| **Talent–Event association** | Manage which talents are publicly linked to which events (show/hide toggle) |
| **Vendor–Event association** | Manage which vendors are publicly linked to which events (show/hide toggle) |

### Event Archive & Post-Event

| Feature | Description |
|---|---|
| **Archived events** | Access past events for reference, duplication, or proof of business |
| **Post-event media** | Upload production videos, highlight reels, or recap content after an event ends |
| **Ratings received** | View average star ratings from attendees for past events |

---

## 14. Event Cancellation & Refund Flow

1. Organizer or Admin confirms event cancellation.
2. The refund method is determined by the **cancellation agreement** between the platform and the Organizer (this agreement must be established in advance). The specific refund method (automatic via gateway, manual bank transfer, etc.) depends on this agreement. *(Details TBD — pending finalization with project owner.)*
3. All tickets for the event are marked CANCELLED.
4. Each affected user receives:
   - Email notification with cancellation details and refund information.
   - In-app notification.
5. Tickets listed in auction are also cancelled and refunded per the agreement terms.

---

## 15. Marketplace — Talent, Vendor & Organizer

The Marketplace enables Organizers to discover, evaluate, and hire **Talents** and **Vendors** for their events. The platform facilitates **discovery and connection only** — it does **not** process or mediate any financial transactions between parties.

### 15.1 Talent Profile Requirements

To be listed in the Marketplace, a Talent must complete their profile with:

- **Personal information:** full name, contact details.
- **Bio:** description of their skills, experience, and specialties.
- **Location details** *(optional)*: city/region, willingness to travel — shown publicly only if the Talent opts in.
- **Verification media:** at least one proof of talent — **video** and/or **images** demonstrating their work.
- **Certificate / approval document** *(optional)*: any official certification, license, or credential that validates their talent (e.g., music degree, performer license).

### 15.2 Vendor Profile Requirements

To be listed in the Marketplace, a Vendor must complete their profile with:

- **Business/personal information:** full name or business name, contact details.
- **Bio:** description of the services offered and experience.
- **Service categories:** the types of services provided. Examples include:

| Service Category | Description |
|---|---|
| Venue / Place | Event space rental and management |
| Security / Guards | Event security and crowd control |
| Catering / Food | Food and beverage services |
| Staffing / Servants | Event staff and service personnel |
| Lighting | Stage and venue lighting setup |
| Sound Systems / AV | Audio and visual equipment and operation |
| *(Custom)* | Any other service relevant to events |

- **Verification documents** *(required)*: business license, commercial registration, or equivalent proof of legitimacy.
- **Image gallery:** photos of past work, equipment, venues, or service demonstrations.
- **Location details:** city/region and service coverage area.

### 15.3 Organizer Profile Requirements

To use the Marketplace (and to create events), an Organizer must complete their profile with:

- **Personal information:** full name, contact details.
- **Bio:** description of the organization or event hosting background.
- **Organization document** *(required)*: official documentation proving the legitimacy of the organization or ownership/management of the event venue.
- **Image gallery** *(multiple images)*: photos of the venue, past events, or the organization itself.
- **Venue details** *(if applicable)*: venue size, location/address, maximum audience capacity, available facilities.
- **Organization details:** logo, social media links, website/link, previous events hosted, typical event duration, event types/categories.

### 15.4 Discovery & Hiring Flow (Talent and Vendor)

The hiring process is facilitated through a **real-time chat system** and works the same for both Talents and Vendors:

1. **Browse & Discover:** The Organizer browses Talent and Vendor profiles in the Marketplace. Both parties can view each other's public profile information.
2. **Initiate Chat:** The Organizer opens a **real-time chat** with a Talent or Vendor directly from their profile. The chat serves as the primary communication channel.
3. **Negotiate:** All negotiation happens within the chat — pricing, terms, scheduling, event details, and any other arrangement. Both parties can exchange messages, share documents, and discuss requirements in real time.
4. **Accept or Decline:** The Talent/Vendor either **accepts** or **declines** the engagement through the chat.
   - On **accept**: the Talent/Vendor's availability status is automatically changed to **"Reserved"** (visible on their Marketplace profile).
   - On **decline**: the Organizer is notified. No status change occurs.
5. **Post-Acceptance:** The Talent/Vendor can manually update their status back to **"Available"** or any other status at any time. The chat remains available for ongoing communication.

### 15.5 Talent–Event & Vendor–Event Association

- Both **Talents** and **Vendors** hired for a specific event can be **publicly associated with that event** on the event page.
  - Talent example: _"Performing: [Talent Name]"_
  - Vendor example: _"Official catering by [Vendor Name]"_
- The Organizer has a **per-event show/hide toggle** for each association — they can choose to display or hide individual Talent and Vendor associations on the public event page.
- The Organizer manages all Talent–Event and Vendor–Event associations from their event dashboard.

### 15.6 Availability Status (Talent & Vendor)

| Status | Meaning |
|---|---|
| **Available** | Open to new offers and bookings |
| **Reserved** | Has accepted an offer and is committed (set automatically on accept, changeable by the user) |

### 15.7 Financial Independence

- The platform does **not** handle, process, or escrow any payments between Talents/Vendors and Organizers.
- All financial arrangements (payment method, timing, invoicing) are handled **directly between the two parties** outside the platform.
- MyTicket's role is strictly limited to **discovery, profile verification, and connection facilitation**.

---

## 16. Ratings

The platform uses a **star rating system only** — there are no written text reviews. Ratings provide a quick, quantitative measure of quality and satisfaction.

### Event Ratings

- Users who **attended an event** (ticket status = USED) can leave a **star rating** for the event after it concludes.
- The average star rating is displayed on the event page for future reference.

### Talent & Vendor Ratings (Mutual)

- **Organizers** can rate Talents and Vendors they have hired through the Marketplace.
- **Talents and Vendors** can rate Organizers they have worked with.
- Ratings are displayed on the respective Marketplace profiles and contribute to overall reputation.

### Rating Rules

- Ratings are available **only after** an event is attended (ticket USED) or after a hiring engagement is completed.
- Each user can rate only **once** per event or per engagement.
- Ratings are **public** and visible on the relevant profile or event page.

---

## 17. Event Sharing & Social

### Sharing Options

- Every event has **shareable links** that users can distribute through:
  - **Social media platforms** — direct sharing to popular platforms (Twitter/X, WhatsApp, Instagram, etc.).
  - **In-platform sharing** — users can share event links or invite friends directly within MyTicket.
  - **Copy link** — generate a shareable URL for any channel.

---

## 18. Waitlist & Event Reminders

### Waitlist System

- When an event is **sold out**, users can join a **waitlist** for that event.
- The waitlist **auto-notifies** users when tickets become available — either through new auction listings or booking cancellations.
- Notifications are sent in the order users joined the waitlist (first come, first served for notification priority).

### Event Reminders

- The system sends **event reminders** to ticket holders before the event.
- Reminder timing and channels are **configured by the Admin** — the Admin decides which notification channels to use for reminders (email, in-app, push notification, or all).
- Typical reminder intervals: 24 hours before and 1 hour before the event (configurable by Admin).

---

## 19. Support & Complaints

### Chat Support

- The platform provides an **open chat support** feature accessible to all registered users.
- Users can initiate a live chat session with the support team for real-time assistance with any issue: event problems, ticket issues, technical bugs, disputes with organizers, etc.

### Text Box (Offline Support)

- In addition to live chat, users can submit a **text-based support message** describing their issue.
- This is useful when live support is unavailable or when the user prefers asynchronous communication.
- Each message is submitted to the **Admin support dashboard**.

### Admin Support Dashboard

- All support conversations (chat sessions and text messages) appear in a centralized **support dashboard** in the Admin panel.
- Admin can review, respond to, and resolve support requests.
- Users receive a notification when their support request is reviewed or resolved.

---

## 20. Account Deletion

Users can request to **delete their account** from the platform. Deletion results in **permanent loss of all account data**. The user is shown a clear disclaimer before proceeding.

### Pre-Deletion Disclaimer

Before deletion, the system displays a **disclaimer alert** warning the user:

- All personal data, profile information, and account history will be **permanently deleted**.
- All **valid/active tickets** will be **automatically sent to the auction** for re-sell. The user may recover value if the tickets sell before the auction deadline.
- Tickets **already listed in auction** (pending auctions) will **not be affected** — they continue as-is until sold or expired.
- This action is **irreversible**. This policy is also documented in the **Terms of Service**.

### Deletion Execution

1. User reviews the disclaimer and acknowledges the consequences.
2. User confirms account deletion.
3. The system **automatically lists all valid/active tickets** in the auction for re-sell.
4. Account data is permanently removed (personal info, profile, credentials).
5. The user receives a final confirmation email that their account has been deleted.
6. Auction proceeds from any sold tickets are processed according to the standard auction flow (minus platform commission).

---

## 21. Admin Capabilities

### Core Administration

- Approve or reject role applications (Talent, Vendor, Organizer).
- **Approve or reject Talent profiles** — review Talent verification media, certificates, and profile quality. Provide a **disclaimer about upload quality requirements** (minimum resolution, clear content, professional presentation).
- Manage and moderate users (suspend accounts). Note: role changes are not permitted after approval (roles are final).
- Cancel events and trigger refunds (per cancellation agreement with organizer).
- Moderate listings (Talent profiles, Vendor profiles).
- Manage **event categories** (create, edit, deactivate categories with icon, name, and optional color).
- Control **Featured Events** section — algorithm is the default; Admin can override manually to feature specific events.
- Configure **platform fees** — full control over fee structure, percentages, flat fees, third-party profit-sharing splits, and **auction commission** (see Section 23).
- Configure **notification channels** for event reminders (email, in-app, push, or any combination).
- Manage **support conversations** from the support dashboard (chat sessions and text messages).

### Admin Analytics Dashboard

The Admin has a **professional, comprehensive analytics dashboard** providing full visibility into every aspect of the platform:

**Financial Analytics:**

| Metric | Description |
|---|---|
| **Total platform revenue** | All-time and period-based revenue (daily/weekly/monthly/yearly) |
| **Revenue breakdown** | By event, by organizer, by ticket type, by category |
| **Platform fees collected** | Total fees earned by the platform |
| **Refunds processed** | Total refunds issued (cancellations, event edits, conflicts) |
| **Organizer payouts** | Total paid out, pending, and overdue payouts |
| **Revenue trends** | Charts showing revenue over time |

**Platform Counters (Totals):**

| Counter | Description |
|---|---|
| **Total users** | All registered users, broken down by role (Guest, Talent, Vendor, Organizer) |
| **Total events** | All events ever created (by status: active, ended, cancelled, archived) |
| **Total tickets sold** | Platform-wide ticket sales count |
| **Total bookings** | Platform-wide booking count |
| **Total vendors** | Registered and approved vendors |
| **Total talents** | Registered and approved talents |
| **Total organizers** | Registered and approved organizers |
| **Total ratings** | Ratings submitted platform-wide |

**Top / Leaderboard Metrics:**

| Metric | Description |
|---|---|
| **Top events** | Events with the most ticket sales, revenue, or attendance |
| **Top organizers** | Organizers with the most events, revenue, or ticket sales |
| **Top categories** | Most popular event categories by sales or event count |
| **Top-selling ticket types** | Which ticket types (VIP, Standard, etc.) sell the most |
| **Top-rated events** | Events with the highest average star rating |
| **Top talents** | Talents with the most bookings or highest ratings |
| **Top vendors** | Vendors with the most bookings or highest ratings |

---

## 22. Notification System

### User Notification Preferences

Users can **customize their notification preferences** from their account settings. For each notification type, users can choose which channels they want to receive it through (email, in-app, push — or disable specific channels). The system respects user preferences while ensuring critical notifications (e.g., booking confirmations, refunds, security alerts) are always delivered through at least one channel.

### Notification Triggers

Notifications are triggered for the following events:

| Trigger | Channel |
|---|---|
| Role application approved/rejected | Email + In-App |
| Talent profile approved/rejected by Admin | Email + In-App |
| Ticket booking confirmed (with ticket PDF) | Email + In-App |
| QR tickets generated | Email + In-App |
| Event cancelled | Email + In-App |
| Event details changed (post-publish edit by Organizer) | Email + In-App |
| Auction ticket sold — seller notified, QR invalidated | Email + In-App |
| Auction ticket purchased — buyer receives new QR | Email + In-App |
| Auction countdown expiring (seller) | In-App |
| Refund processed | Email + In-App |
| Seat conflict during checkout (race condition — both rejected) | In-App |
| New chat message from Organizer/Talent/Vendor | Email + In-App |
| Ticket gifted — sender confirmation | Email + In-App |
| Ticket gifted — recipient receives new QR (or invitation to register) | Email + In-App |
| Waitlist — tickets now available for a sold-out event | Email + In-App |
| Event reminder (before event) | Admin-configured (Email / In-App / Push / All) |
| Overlapping event warning during checkout | In-App |
| Support request status update (reviewed/resolved) | Email + In-App |
| New rating received on profile or event | In-App |

---

## 23. Platform Fees & Revenue Model

### Fee Structure

Platform fees are **fully configurable by the Admin** from the admin dashboard. The Admin has complete control over:

- **Fee type:** percentage-based, flat fee, or a combination of both.
- **Fee payer:** whether the fee is charged to the buyer (added on top of ticket price) or deducted from the organizer's revenue.
- **Third-party profit sharing:** the Admin can configure profit-sharing splits for cases where a third party is involved in the revenue chain.
- **Fee amount:** adjustable at any time by the Admin.

### Fee Rules

- **Event listing fee** — *(TBD: under discussion between the project manager and project owner. May be free or paid.)*
- **Auction sales carry a platform commission** — the Admin configures the commission percentage. The seller receives the sale price minus the platform commission.
- **Ticket gifting is free** — no fees are charged for direct ticket transfers.
- Platform fees are **dynamic**, based on the agreement with each stakeholder. The Admin can configure different fee arrangements per organizer or globally.
- All other fee configurations are at the Admin's full discretion, allowing the platform to adapt its revenue model as needed.

---

## 24. Payment & Currency

- The platform currency is **SAR (Saudi Riyal)**.
- Payment gateway is under evaluation — candidates include **Stripe** and **local Saudi payment gateways**.
- The chosen gateway must support: instant payment processing, refund automation, and pre-authorization holds.
- Refund processing time depends on the selected gateway (some offer instant refunds, others take 5–10 business days). The platform will display estimated refund timelines to users.

### Organizer Payouts

*(TBD — payout model not yet decided. Pending finalization with project owner.)*

The Organizer payout structure (percentage, schedule, digital vs. manual, and financial tracking) will be defined after the agreement between the project manager and project owner is completed.

---

## 25. Language & Localization

- The platform is **bilingual**: Arabic and English.
- The UI supports **full RTL (right-to-left)** layout for Arabic and **LTR (left-to-right)** layout for English.
- Users can **switch between languages** at any time from the UI.
- All platform content, labels, notifications, and system messages must be available in both languages.
- User-generated content (event descriptions, bios) is displayed in the language it was written in.

---

## 26. Event Lifecycle & Archive

### Event Statuses

An event progresses through the following lifecycle:

| Status | Description |
|---|---|
| **Draft** | Event created but not yet published — only visible to the Organizer |
| **Published** | Event is live and visible to the public, tickets can be purchased |
| **Sold Out** | All tickets are booked — waitlist is available |
| **In Progress** | Event is currently happening (event day/time has started) |
| **Ended** | Event has concluded — scanning is closed, tickets marked expired |
| **Cancelled** | Event was cancelled — refunds processed per agreement |
| **Archived** | Post-event state — removed from public view, accessible to Organizer |

### Post-Event Archive

When an event ends, it transitions to **Archived** status:

- **Not visible to the public** — archived events are removed from search results, category pages, and the home page.
- **Accessible to the Organizer** via their dashboard for reference, analytics, and reuse.
- The Organizer can **duplicate an archived event** to create a new event with the same base configuration (layout, ticket types, pricing, description), applying small updates for the next occurrence.
- Archived events serve as **proof of business** — the Organizer can reference past events to demonstrate their track record when connecting with Talents, Vendors, or seeking platform credibility.

### Post-Event Media

After an event ends, the Organizer can upload **post-event media** to the archived event:

- **Production videos** — highlight reels, recap videos, professional recordings of the event.
- **Photos** — additional event photography taken during the event.
- This media is stored on the Organizer's profile and associated with the event for:
  - **Marketing** — showcasing past work to attract future attendees, talents, and vendors.
  - **Client approvals** — demonstrating event quality to potential business partners.
  - **Portfolio building** — building the Organizer's reputation on the platform.

---

## 27. MVP Scope

1. User authentication (register, login, email verification, phone OTP, Google social login, password reset, Terms of Service agreement).
2. User profile management (edit info, re-verification on changes, public profiles).
3. Role application and admin approval flow (Guest, Talent, Vendor, Organizer) — **roles are final** once assigned.
4. Talent profile approval by Admin (with upload quality disclaimer).
5. Event creation with layout selection, seat templates, per-seat ticket types and pricing, accessibility seats, multi-day and recurring event support.
6. **Ticket entry mode** — one-time entry (default) or multi-scan mode (organizer-configurable).
7. Event categories managed by Admin.
8. Event discovery with advanced search, filters, featured events (algorithm default, admin override), event cards, and detailed event pages.
9. Seat-based and quantity-based booking with **seat locking during payment** and **fairness-first race condition handling** (reject both).
10. **Overlapping event warning** with disclaimer and no-refund terms.
11. Purchase limits (per-event, optional).
12. Group booking with separate ticket generation and gifting options (including to unregistered users via invitation email).
13. **Booking confirmation** with success modal (celebration animation), ticket details page, and email with ticket PDF.
14. **My Tickets page** with ticket statuses and quick actions (gift, auction, download, rate).
15. Payment integration with success/failure handling (SAR).
16. Professional ticket display with PDF download and mobile wallet (Apple Wallet / Google Wallet) support.
17. QR code generation and regeneration per ticket (on sale, gift, and transfer).
18. Browser-based QR scanning with login gate, supporting one-time and multi-scan modes.
19. Auction system (list at original price or less, countdown, purchase, QR regeneration, platform commission) — primary method for user-initiated ticket recovery.
20. Ticket gifting (direct transfer by email, including to unregistered users with registration invitation).
21. Marketplace for Talent, Vendor, and Organizer discovery with **real-time chat** for hiring and negotiation.
22. **Star ratings** (no written reviews) for events, talents, vendors, and organizers.
23. Event sharing (social media + in-platform).
24. Waitlist for sold-out events with auto-notification.
25. Event reminders (admin-configured channels and timing).
26. **Chat support + text box** with admin support dashboard.
27. Email + in-app notifications for all critical actions with user-customizable preferences.
28. Organizer dashboard (event management, sales analytics, attendance tracking, financial overview, chat management, event archive).
29. **Admin dashboard** with comprehensive analytics (financial, counters, top/leaderboard metrics), role approvals, talent profile approvals, cancellations, user management, fee configuration (including auction commission), categories, featured events.
30. Event lifecycle management (draft → published → ended → archived) with post-event media upload.
31. Account deletion with automatic ticket auctioning and disclaimer.
32. Bilingual UI (Arabic + English) with RTL/LTR support.
33. Talent–Event and Vendor–Event association with per-event show/hide toggle.

---

## 28. Future Enhancements

1. Advanced seat map customization UI (drag-and-drop, visual editor).
2. Real-time seat availability updates (WebSocket / optimistic locking).
3. Offline QR validation (cached event data in scanner app).
4. Mobile app (iOS / Android).
5. Multi-currency and international payment gateway support.
6. Push notifications (mobile/browser).
7. Vendor portfolio and service showcase pages.
8. Advanced analytics and reporting exports (CSV/PDF) for Organizers and Admins.
9. Event admin approval flow (optional per-event content review before publishing).
10. Written text reviews with moderation pipeline (if needed in future).

---

## 29. Key Business Rules Summary

- One ticket = one seat (for seated events). Each seat is assigned a ticket type and price individually by the Organizer.
- Seats are **locked during checkout/payment** and remain locked until the transaction completes (success or failure).
- If a seat conflict occurs (simultaneous checkout), **both users' transactions are rejected** (fairness-first). Both are alerted to try again.
- Events go live **immediately** when the Organizer publishes them — no admin event approval required.
- Organizers can define **multiple ticket types** (VIP, Standard, Accessibility, custom) with pricing assigned **per-seat**.
- Organizers **can edit** published events; affected ticket holders are notified of exact changes. The **Organizer is responsible for refunds** on significant changes (date, duration, location).
- Events support **single-day, multi-day, and recurring** schedules — fully customizable by the Organizer.
- Organizers can set optional **purchase limits** (max tickets per user per event).
- **Ticket entry mode**: one-time entry by default; Organizer can enable multi-scan mode for re-entry during the event.
- **No direct refund for change of mind** — the **auction is the primary way** for users to recover ticket value. If the Organizer does not offer a bank refund, auction is the only option.
- Auction price can be the **original purchase price or less** — no price increases. The platform takes a **commission** on auction sales (admin-configurable).
- Auction window closes when the event day starts — no exceptions.
- Users can auction **individual tickets** from a multi-ticket booking (selectable, all, single, or custom).
- On auction sale or ticket gift, the sender's QR is **invalidated** and a **new QR** is generated for the recipient.
- Ticket gifting is free. Recipients do **not** need an existing account — unregistered users receive an invitation email to register and claim the ticket.
- **Gifted tickets cannot be re-gifted or listed in auction** — they are locked to the recipient.
- **Auction-purchased tickets can be re-auctioned** but **cannot be gifted**.
- Tickets are **professional digital tickets** with full event details, downloadable as **PDF** and saveable to **mobile wallets** (Apple Wallet / Google Wallet).
- **Overlapping events**: users are warned when buying tickets for conflicting times. If they ignore the warning, the purchase is **non-refundable** for scheduling conflicts.
- Refunds for cancelled events are handled per the **cancellation agreement** with the Organizer *(details TBD)*.
- **Organizer payouts** — *(TBD: pending finalization with project owner)*.
- Scanner accounts are **linked to the Organizer** and can be **assigned to multiple events** simultaneously.
- Free-layout events require a **maximum capacity** set by the Organizer.
- Both **Talents and Vendors** can be associated with events, with a **per-event show/hide toggle** controlled by the Organizer.
- A user can hold **only one role at a time**. **Role selection is final** — once assigned, it cannot be changed (no upgrades, no downgrades).
- **All role applications** (Talent, Vendor, Organizer) require **Admin approval**. Talent profiles are additionally reviewed for quality.
- **Vendor** is a distinct role from Talent — Vendors provide logistical services, Talents provide artistic services.
- The platform facilitates discovery and connection between Talents/Vendors and Organizers via **real-time chat**. Financial arrangements are handled **externally**.
- Platform currency is **SAR (Saudi Riyal)**.
- Event listing fee — *(TBD: under discussion)*.
- Platform fees on ticket purchases are **fully configurable by the Admin** (percentage, flat, or both; buyer-side or organizer-side; dynamic per-stakeholder agreements; third-party splits supported).
- Event categories are **admin-managed** (icon + name + optional color).
- Featured events use **algorithm by default**; Admin can override manually.
- Profile image is **optional**. All user profiles are **public**.
- Registration requires **full name, email, phone number** + email verification + phone OTP + Terms of Service agreement.
- Users can **edit their profile** with re-verification required for email/phone changes.
- The platform uses **star ratings only** (no written text reviews) for events, talents, vendors, and organizers.
- Users can **customize notification preferences** per channel (email, in-app, push).
- Account deletion **automatically sends all valid tickets to auction**. Pending auctions are unaffected. User data is permanently deleted. A disclaimer alert is shown before deletion.
- Ended events are **archived** (not public) — Organizers can reuse, duplicate, and add post-event media for marketing and proof of business.
- The platform is **bilingual (Arabic + English)** with full RTL/LTR support.
- Support is provided via **live chat and text box**, managed through the admin support dashboard.
