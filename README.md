# Wayfare

Private travel companion for logging trips — bookings, budget, and photos — across **Paris** and **New York**. Master-detail UI: a landing page of everything booked; click any item to go one level deeper into details with map enrichment.

> **This is primarily a learning project for [TanStack](https://tanstack.com).** The goal is hands-on TanStack Router, Query, and Table in a real app — not a toy.

## TanStack focus

- **Router** — typed routes, route params, loaders, search-params-as-state, prefetch
- **Query** — caching, dependent + parallel queries, optimistic mutations, cache persistence
- **Table** — sorting, filtering, grouping, aggregation (the budget ledger)

In Phase B, GraphQL is the transport while TanStack Query stays the cache layer.

## Stack

- Vite + React + TypeScript
- TanStack Router / Query / Table
- Tailwind CSS v4 (CSS-first `@theme`)
- Leaflet + OpenStreetMap (maps)
- Supabase — Postgres + Auth + Storage + GraphQL (Phase B)

## Features

- Trips containing items: flight / train / hotel / activity / restaurant
- Master-detail with map, nearby POIs, weather, and destination blurbs (free keyless APIs)
- Budget: planned vs actual spend, multi-currency with a USD snapshot, on-the-go expense logging
- Ticket / QR display and per-item photos
- Private by design: auth + email allowlist + row-level security (Phase B)

## Build phases

- **Phase A** — frontend on mock/local data (where TanStack is learned)
- **Phase B** — Supabase backend, GraphQL swap, auth, photo upload, deploy

## Project docs

- `planning/SPEC.md` — source of truth (data model, task list, conventions)
- `planning/wayfare-design-preview.html` — design guidance (look + states), not implementation

## Development

```
npm install
npm run dev
```

## Conventions

- Standalone personal project — work on `main`, plain commits.
- TypeScript throughout.
