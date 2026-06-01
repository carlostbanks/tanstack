# Wayfare — Project Spec

A private, authed travel companion for logging bookings, budget, and photos across trips
(initially **Paris** + **New York**). Master-detail UI: a landing page of everything booked,
click any item to go one level deeper into details + map enrichment.

> This document is the source of truth for implementation. The HTML file in this folder
> (`wayfare-design-preview.html`) is **design guidance only** — it shows the intended look,
> screens, and states. It is not the implementation and should not be treated as spec.

---

## 1. Purpose & learning goals

Primary goal is **learning TanStack** (Router, Query, Table) in a real app, not a toy.
Secondary goal (Phase B) is GraphQL + Postgres + auth via Supabase.

TanStack concepts this project must exercise:
- **Query** — queries, caching, `staleTime`/`gcTime`, dependent queries, parallel queries, mutations with optimistic updates, persistence.
- **Router** — typed routes, route params, loaders, search-params-as-state, pending/error components, prefetch.
- **Table** — sorting, filtering, grouping, aggregation (the budget ledger).

GraphQL is the transport in Phase B; **TanStack Query stays the cache layer** (via `graphql-request`, not Apollo).

## 2. Roles

- **Orchestrator** — the human. Sets direction, approves, prioritizes.
- **Driver** — planning/design assistant. Produces specs, design, task breakdown (this document).
- **Investigator / Implementer** — Claude Code CLI, working per-repo. Builds from this spec.

## 3. Scope (locked)

- Multiple **trips**, each with **items** of type: `flight | train | hotel | activity | restaurant`.
- Bookings are the user's own data (seeded from PDFs/email confirmations, then add-item form).
  Public APIs **enrich** items (map, nearby POIs, weather, blurb) — they never source the bookings.
- **Master-detail**: landing (cards + agenda) → `/item/$itemId` detail.
- **Agenda** views: day / week / all, with day tabs.
- **Budget** page: planned (from items) vs actual (expenses ledger), by category and day.
- **Tickets**: store + display the real ticket (PDF / `.pkpass` / link); render a QR from a stored
  payload/link. **Do not** fabricate a gate barcode — the gate scans the issuer's own barcode.
- **Photos**: attach to items / trips; receipts attach to expenses.
- **Auth**: private app. Google SSO and/or username+passcode. **No signup page** (accounts pre-provisioned).
  Email **allowlist** + Row Level Security gate access.
- Solo learning repo → work on **`main`**, plain `git commit`, no feature branches.
- **TypeScript** throughout.

## 4. Stack

| Layer | Choice |
|---|---|
| Build | Vite + React + TypeScript |
| Routing | TanStack Router (file-based) |
| Data/cache | TanStack Query |
| Tables | TanStack Table |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, via `@tailwindcss/vite`) |
| Maps | Leaflet + OpenStreetMap tiles (keyless) |
| Backend (Phase B) | Supabase — Postgres + Auth + Storage + GraphQL (pg_graphql) |
| GraphQL client | `graphql-request` + TanStack Query (no Apollo) |
| Hosting | Vercel (frontend) |

## 5. Build phasing

**Phase A — Frontend, mock/local data (this is where TanStack is learned).**
Finish design, build all screens + states in React + TanStack with seed/local data. No backend.
Budget UI, ticket/QR display, agenda, detail enrichment via the public APIs.

**Phase B — Backend.**
Stand up Supabase (schema + RLS + auth), swap mock data → GraphQL via Query, add photo upload,
deploy to Vercel. (GraphQL + Postgres + auth learned here.)

Free-tier note: Supabase free projects **pause after 7 days of inactivity** — add a cron/uptime ping to keep warm.
Storage free tier is ~1 GB — **compress/resize photos on upload** (long edge ~1600px).

## 6. Design system (see HTML)

- **Aesthetic**: warm-paper editorial / boarding-pass. Ink on cream, terracotta primary, perforation
  dividers, monospace confirmation codes.
- **Fonts**: Fraunces (display), Hanken Grotesk (body), JetBrains Mono (codes/figures).
- **Core palette**: paper `#FBF6EC`, paper2 `#F3EADB`, ink `#1F1B16`, ink2 `#6B6258`, line `#E2D5C0`,
  terra `#C2562F`, terradeep `#9C3F1E`.
- **Per-type accent colors**: flight `#2D6E8E`, train `#3F7A5A`, hotel `#B07A1E`, activity `#7A4FA3`, food `#B23A48`.
- **Screens + states** (all mocked in the HTML): Login, Login·Denied, Landing (loaded/loading/empty),
  Cards (5 type variants + hover), Agenda (day/week/all + empty day), Budget (tiles + category bars +
  ledger table), Detail (hotel/train/flight, + loading/error/partial), Ticket+QR block, 404.
- Mobile-first; layouts confirmed working on phone + desktop.
- **Detail is one shared component** (`DetailLayout`). Shared across all item types: header, facts grid, **photos**, **map**. Type-specific blocks slot in conditionally — ticket/QR for `flight` & `train`, nearby-POIs for `hotel`. Build once, branch on `item.type`; do not build five separate detail pages.
- **Add-expense modal**: bottom-sheet on mobile, centered dialog on desktop — one responsive component, capped ~78vh so the dimmed page shows behind on mobile. Fields: amount + **currency dropdown** (live USD conversion shown inline, snapshot stored), description, category chips (color dots), date, attach-to-item, optional receipt photo. Actions: Cancel · Save & add another · Save.

## 7. Data model

All money stored as `numeric`. Timestamps `timestamptz`. Primary keys `uuid` (default `gen_random_uuid()`).
Every owned table carries ownership for RLS (directly via `user_id`, or transitively via `trip_id → trips.user_id`).

### `trips`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | owner; RLS key |
| name | text | "Paris" |
| destination | text | display city |
| start_date | date | |
| end_date | date | |
| home_currency | text | default `USD`; budget display currency |
| created_at / updated_at | timestamptz | |

### `items` (bookings)
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| type | text/enum | `flight \| train \| hotel \| activity \| restaurant` |
| title | text | "MIA → CDG", "Hôtel du Marais" |
| status | text | "Confirmed", "e-Ticket", "Reserved" |
| start_at | timestamptz | departure / check-in / reservation time |
| end_at | timestamptz null | arrival / checkout |
| confirmation_code | text null | |
| notes | text null | |
| planned_cost | numeric null | native amount |
| planned_currency | text null | e.g. `EUR` |
| planned_cost_usd | numeric null | converted snapshot |
| planned_fx_rate | numeric null | native→USD rate at entry |
| loc_name | text null | primary / origin location label |
| loc_address | text null | |
| loc_lat / loc_lng | numeric null | geocoded primary point |
| dest_name | text null | secondary point (flight/train only) |
| dest_lat / dest_lng | numeric null | |
| created_at / updated_at | timestamptz | |

> Decision: single primary location + optional secondary covers 1-point and 2-point items without a
> join table. Revisit with a `locations` table only if multi-stop routes are needed.

### `expenses` (actual spend / budget ledger)
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| item_id | uuid FK → items null | optional attach to a booking |
| description | text | "Café Charlot — lunch" |
| category | text/enum | `flight \| hotel \| food \| activity \| transport \| other` |
| amount | numeric | native amount |
| currency | text | dropdown selection, e.g. `EUR` |
| amount_usd | numeric | converted snapshot (totals sum this) |
| fx_rate | numeric | native→USD rate used at entry |
| spent_at | timestamptz | defaults to now |
| receipt_photo_id | uuid FK → photos null | |
| created_at | timestamptz | |

> Decision: planned cost lives on `items`; actual spend lives in `expenses`. Budget page compares the two.

### `photos`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| item_id | uuid FK → items null | item gallery; null = trip-level |
| kind | text | `gallery \| receipt \| ticket` |
| storage_path | text | path in Supabase Storage bucket |
| caption | text null | |
| width / height | int null | |
| created_at | timestamptz | |

### `ticket_assets`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| item_id | uuid FK → items | |
| kind | text | `pdf \| pkpass \| qr_payload \| url` |
| storage_path | text null | uploaded PDF / pkpass |
| qr_payload | text null | string the QR renders from |
| external_url | text null | link to airline pass / lookup |
| label | text null | "Boarding pass — passenger 1" |
| created_at | timestamptz | |

### `allowed_emails`
| column | type | notes |
|---|---|---|
| email | text PK | the SSO allowlist; sign-in rejected if absent |
| note | text null | |

### Relationship summary
```
auth.users 1───* trips
trips      1───* items
trips      1───* expenses
items      0..1─* expenses        (expense.item_id nullable)
items      1───* photos           (also trips 1───* photos, trip-level)
items      1───* ticket_assets
expenses   0..1─1 photos          (receipt)
```

## 8. Currency handling

- Expense modal (and item planned cost) has a **currency dropdown** (USD, EUR, GBP, …).
- On entry, **auto-convert to USD** via `open.er-api.com` (keyless) and **store the snapshot**:
  native `amount` + `currency` + `amount_usd` + `fx_rate`.
- Budget totals/aggregations sum `amount_usd`. Snapshotting the rate keeps historical totals honest
  even when live rates move.
- FX fetch is a TanStack Query (cache the daily rate table; `staleTime` ~ hours).

## 9. Auth & OPSEC

- **Supabase Auth** handles credential hashing (bcrypt). Do **not** hand-roll password hashing.
  Never use a fast hash (SHA-256) for passwords; if a custom passcode is ever required, Argon2id/bcrypt server-side only.
- **No signup UI** — pre-provision accounts in the Supabase dashboard.
- **Google SSO requires an allowlist** — sign-in alone authenticates anyone with a Google account.
  Gate access by checking the email against `allowed_emails` (and/or enforce via RLS).
- **Row Level Security ON, default-deny**, on every table. Policies allow access only where the row's
  owner = `auth.uid()`. Without RLS, the public anon key shipped in the frontend can read the whole DB.
- Only the **anon key** ships client-side (safe *only* with RLS on). Never ship the `service_role` key.

## 10. External APIs (all free)

| Purpose | API | Key? |
|---|---|---|
| Geocode address → coords | Nominatim (OSM) | no |
| Nearby POIs (food/museums) | Overpass (OSM) | no |
| Weather for trip dates | Open-Meteo | no |
| Destination/landmark blurb | Wikipedia REST | no |
| Map tiles | OpenStreetMap via Leaflet | no |
| FX rate (native → USD) | open.er-api.com | no |

Optional upgrade: Geoapify (one free key) for faster/cleaner geocode + places vs Nominatim/Overpass.

## 11. Tickets & QR

- Store the real ticket as a `ticket_assets` row: uploaded PDF / `.pkpass`, or an `external_url`,
  and/or a `qr_payload` string.
- Detail view renders a QR from `qr_payload` (or encodes `external_url`) and an "Open ticket" button.
- Honest constraint: the gate scans the **issuer's** barcode. The app surfaces the real pass; it does
  not generate a valid boarding barcode.

## 12. Nomenclature

- **Task ID**: `TRIP-<EPIC>-<n>`
- **Epics**: `SU` setup · `DS` design/UI shell · `DM` data · `RT` router · `QY` query · `TB` agenda/table ·
  `MP` map · `DT` detail · `AUTH` auth · `BUD` budget · `MED` media/photos · `TKT` tickets · `BE` backend · `UI` polish
- **Commits**: plain `git commit` on `main`. No feature branches (solo learning repo).
- **Query-key factory** (single source for keys):
  - `['trip', tripId]`, `['items', tripId]`, `['item', itemId]`
  - `['geocode', address]`, `['pois', lat, lng, category]`, `['weather', lat, lng, date]`, `['wiki', title]`
  - `['expenses', tripId]`, `['fx', base, date]`
- **Entities (TS types)**: `Trip`, `Item`, `ItemType`, `Expense`, `Category`, `Photo`, `TicketAsset`, `GeoPoint`, `Enrichment`
- **Routes**: `/login` · `/` · `/trip/$tripId` · `/item/$itemId` · `/trip/$tripId/budget`
  search params: `?view=day|week|all&day=YYYY-MM-DD`

## 13. Task list

Tag `[ ]` marks the TanStack concept a task teaches.

### Phase A — frontend, mock/local data

**P0 · Setup (`SU`)**
- TRIP-SU-1 — Vite + React + TS init; push to `main`
- TRIP-SU-2 — install TanStack router / query / table, leaflet
- TRIP-SU-3 — Tailwind install + config (design tokens from §6)
- TRIP-SU-4 — wire QueryClientProvider + RouterProvider + both Devtools `[Query + Router foundation]`

**P1 · Design / UI shell (`DS`)** — mock data, lock the look (HTML already approved as reference)
- TRIP-DS-1 — Tailwind tokens: colors, type scale, per-type accents
- TRIP-DS-2 — component shells: Card, CardGrid, Agenda, DayTabs, DetailLayout, MapPanel, BudgetTable, ExpenseModal, LoginForm
- TRIP-DS-3 — landing states: loading / loaded / empty
- TRIP-DS-4 — 5 card type variants + hover + cost line
- TRIP-DS-5 — agenda day/week/all + day tabs + empty day
- TRIP-DS-6 — detail states: loading / loaded / error / partial
- TRIP-DS-7 — budget: tiles + category bars + ledger table + expense modal (bottom-sheet mobile / dialog desktop)
- TRIP-DS-8 — login + denied + 404

**P2 · Data (`DM`)**
- TRIP-DM-1 — TS types per §12
- TRIP-DM-2 — author `seed.json` from real Paris/NY bookings (provided as PDFs/email)
- TRIP-DM-3 — data-access layer (seed now → swap to GraphQL in Phase B)

**P3 · Router (`RT`)**
- TRIP-RT-1 — file-based routes per §12 `[routes + params]`
- TRIP-RT-2 — item detail via route param + loader `[loaders]`
- TRIP-RT-3 — agenda view + day in search params `[search-params-as-state]`
- TRIP-RT-4 — prefetch enrichment on card hover `[prefetch]`
- TRIP-RT-5 — pending + error route components `[pending/error]`

**P4 · Query / enrichment (`QY`)** — the meat
- TRIP-QY-1 — query-key factory `[keys]`
- TRIP-QY-2 — geocode address → coords `[basics]`
- TRIP-QY-3 — POIs near coords, `enabled` after geocode resolves `[dependent queries]`
- TRIP-QY-4 — parallel weather + wiki + POIs via `useQueries` `[parallel]`
- TRIP-QY-5 — `staleTime`/`gcTime` tuning (enrichment is near-static) `[cache control]`
- TRIP-QY-6 — persist cache to localStorage `[persistence]`

**P5 · Budget + Table (`BUD`/`TB`)**
- TRIP-TB-1 — ledger sort by date/amount `[sorting]`
- TRIP-TB-2 — group rows by day `[grouping]`
- TRIP-TB-3 — category filter via search param `[filtering + Router link]`
- TRIP-TB-4 — totals/aggregation row `[aggregation]`
- TRIP-BUD-1 — planned vs actual tiles + category bars
- TRIP-BUD-2 — FX query: native → USD, cached daily `[Query]`
- TRIP-BUD-3 — add-expense mutation: optimistic insert, rollback on error, invalidate `[mutations / optimistic]`
- TRIP-BUD-4 — currency dropdown + snapshot fields wired into the mutation

**P6 · Map + Detail (`MP`/`DT`/`TKT`)**
- TRIP-MP-1 — Leaflet base + item markers
- TRIP-MP-2 — hotel detail: pin + nearby POIs (from QY-3)
- TRIP-MP-3 — flight/train: two markers + connecting line
- TRIP-DT-1 — per-type detail layouts
- TRIP-TKT-1 — ticket block: QR render from payload + "Open ticket" (PDF/link)

### Phase B — backend

**P7 · Supabase (`BE`)**
- TRIP-BE-1 — schema migration per §7 (tables, FKs, enums)
- TRIP-BE-2 — RLS policies, default-deny, owner = `auth.uid()` `[OPSEC]`
- TRIP-BE-3 — `allowed_emails` table + sign-in allowlist check
- TRIP-BE-4 — Storage bucket + upload policy (photos/receipts/tickets)
- TRIP-BE-5 — keep-warm cron/uptime ping

**P8 · Auth (`AUTH`)**
- TRIP-AUTH-1 — Supabase Auth: Google OAuth + email/password
- TRIP-AUTH-2 — login screen wired; no signup; denied state for non-allowlisted
- TRIP-AUTH-3 — route guards (redirect unauthed → `/login`)

**P9 · GraphQL swap (`BE`/`QY`)**
- TRIP-BE-6 — graphql-request client; queries/mutations against pg_graphql
- TRIP-QY-7 — replace seed data-access with GraphQL queries (keep Query as cache) `[Query + GraphQL]`
- TRIP-MED-1 — photo upload → Storage + `photos` row; resize/compress on upload
- TRIP-MED-2 — receipt attach in expense modal

**P10 · Polish + Deploy (`UI`)**
- TRIP-UI-1 — empty/loading/error states from query status `[status]`
- TRIP-UI-2 — deploy to Vercel; env vars (anon key only)

### Later (not scheduled)
- TanStack **Form** for add-item/expense (validation/field state) — optional parallel learning
- TanStack **Virtual** if any list grows large

## 14. Conventions

- Branch: `main` only, plain commits.
- Language: TypeScript.
- Data layer is swappable: Phase A reads seed/local; Phase B reads GraphQL. Keep the boundary clean so
  the swap is isolated (one module).
- Secrets: only the Supabase anon key in the client, and only with RLS enforced. `service_role` never ships.
- **`seed.json` mirrors the table shapes 1:1** so the Phase B GraphQL swap is implementation-only — no data reshape.
- Photos compressed on upload to respect the free storage tier.

---

## 15. Project setup / kickoff

- Repo: `https://github.com/carlostbanks/tanstack.git`
- Local: `~/Desktop/Projects/tanstack`

### One-time scaffold
```bash
cd ~/Desktop/Projects
npm create vite@latest tanstack -- --template react-ts
cd tanstack
npm install
# drop the planning/ folder (SPEC.md + wayfare-design-preview.html) at the repo root
```

### Dependencies
```bash
# TanStack
npm install @tanstack/react-router @tanstack/react-query @tanstack/react-table
npm install -D @tanstack/router-plugin @tanstack/react-query-devtools @tanstack/router-devtools
# Map
npm install leaflet react-leaflet
npm install -D @types/leaflet
# Styling (Tailwind v4)
npm install -D tailwindcss @tailwindcss/vite
# Phase B (later): npm install @supabase/supabase-js graphql graphql-request
```
> Investigator: confirm exact current TanStack package/plugin names + versions at install time — these APIs evolve. The Tailwind v4 flow below is current as of this writing.

### Tailwind v4 wiring (CSS-first — no `tailwind.config.js`, no postcss/autoprefixer)
`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// also register the TanStack Router plugin here
export default defineConfig({ plugins: [react(), tailwindcss()] })
```
`src/index.css` — replace all contents:
```css
@import "tailwindcss";

@theme {
  --font-display: "Fraunces", serif;
  --font-sans: "Hanken Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-paper: #FBF6EC;
  --color-paper2: #F3EADB;
  --color-ink: #1F1B16;
  --color-ink2: #6B6258;
  --color-line: #E2D5C0;
  --color-terra: #C2562F;
  --color-terradeep: #9C3F1E;
  --color-flight: #2D6E8E;
  --color-train: #3F7A5A;
  --color-hotel: #B07A1E;
  --color-activity: #7A4FA3;
  --color-food: #B23A48;
}
```
This makes `bg-paper`, `text-ink`, `bg-flight`, `font-display`, etc. resolve exactly as in the HTML preview (which used the v3-style CDN config — same tokens, translated to v4 `@theme`). Custom shadows/grain/map-mock CSS from the preview go in plain CSS below the `@import`.

Fonts — add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Suggested `src/` structure
```
src/
  main.tsx
  index.css
  routes/                     # file-based routes (TanStack Router)
    __root.tsx
    index.tsx                 # landing
    login.tsx
    trip.$tripId.tsx
    trip.$tripId.budget.tsx
    item.$itemId.tsx
  components/                 # Card, CardGrid, Agenda, DayTabs, DetailLayout, MapPanel,
                              # BudgetTable, ExpenseModal, LoginForm
  lib/
    queryKeys.ts              # key factory (§12)
    data/                     # data-access boundary: seed impl now → GraphQL impl Phase B
    api/                      # enrichment fetchers: geocode, pois, weather, wiki, fx
  types/                      # Trip, Item, Expense, ... (§12)
  data/seed.json              # bookings; mirrors table shapes 1:1
```

### Connect + first push
```bash
git init
git add .
git commit -m "chore: scaffold + planning docs"
git branch -M main
git remote add origin https://github.com/carlostbanks/tanstack.git
git push -u origin main
```

### Build order
SU-1→4 (scaffold, deps, Tailwind, providers + devtools) → DS (UI shell, ported from the HTML) → DM (types + seed) → RT (routes) → QY (enrichment, the meat) → BUD/TB (budget + modal optimistic mutation) → MP/DT/TKT (map + shared detail) → Phase B (BE/AUTH/GraphQL/MED) → deploy.
