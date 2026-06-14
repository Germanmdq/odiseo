# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev server (pnpm is managed via corepack)
/usr/local/lib/node_modules/corepack/shims/pnpm dev

# TypeScript check (no emit, no incremental cache)
./node_modules/.bin/tsc --noEmit --pretty false --incremental false

# Lint
/usr/local/lib/node_modules/corepack/shims/pnpm lint
```

There is no test suite. TypeScript is the main correctness check.

If the dev lock blocks startup:
```bash
rm -f .next/dev/lock && /usr/local/lib/node_modules/corepack/shims/pnpm dev
```

## Architecture

### Tech stack

Next.js 16 App Router · Turbopack · TypeScript · Tailwind v4 · next-intl · Supabase (auth + DB) · NVIDIA NIM (embeddings + chat) · shadcn/ui · TanStack Table · Zustand · Zod

### Supabase project

- Ref: `qitwckfwmgnmnmtjhfnf` (project "Anima" — shared with legacy `/Users/germangonzalez/anima`)
- **Do not create tables** without inspecting what already exists in Supabase and getting explicit OK.
- No Supabase CLI and no DATABASE_URL. Schema changes must be run manually in the Supabase SQL editor.

Three Supabase helpers in `src/lib/supabase/`:
- `client.ts` — browser client (`createBrowserClient`), anon key
- `server.ts` — server client with cookies (`createServerClient`), anon key
- `admin.ts` — service role client (`server-only`), bypasses RLS; use only in route handlers

### NVIDIA NIM

`src/lib/nvidia.ts` exports `embedQuery(text): Promise<number[]>` — generates 1024-dim embeddings with `nvidia/llama-nemotron-embed-1b-v2`. Chat streaming uses `meta/llama-3.3-70b-instruct` via `https://integrate.api.nvidia.com/v1/chat/completions` (OpenAI-compatible API). Both are server-only and require `NVIDIA_API_KEY`.

### RAG pattern

Used in Coach and Narrador:
1. `embedQuery(lastUserMessage)` → vector
2. `supabase.rpc("match_content_artifacts", { query_embedding, filter_subtype?, match_count })` → ranked rows
3. Build context string from title + body (truncated to ~400 chars) + sources
4. Inject context into system prompt
5. Stream response via NVIDIA NIM with `Transfer-Encoding: chunked`

### Routing

All user-facing pages live under `src/app/[locale]/`. Locales: `es` (default), `en` — prefix always present.

Route groups:
- `(auth)` — public pages (login, registro, recuperar, errors)
- `(dashboard)` — protected pages; middleware redirects unauthenticated users to `/${locale}/login`

Public segments are whitelisted in `src/middleware.ts` (`publicSegments` set). Any new public route must be added there.

### i18n

Translation keys live in `messages/es.json` and `messages/en.json`. Top-level namespaces: `common`, `dashboard`, `coach`, `narrador`, `fuentes`, `auth`, `settings`, `testimonios`, `biblia`, `preguntas`, `talleres`, `landing`.

Server components use `getTranslations({ locale, namespace })` from `next-intl/server`. Client components use `useTranslations(namespace)`.

Every new page needs its namespace added to both JSON files.

### Shared DataTable

`src/components/data-table/data-table.tsx` — reusable TanStack Table with:
- Optional tabs (`DataTableTab[]`) for client-side filtering
- Drawer on row click via `renderDrawer` render prop
- Column visibility menu
- Pagination

All study pages (Fuentes, Testimonios, Biblia, Preguntas) use this component. Pass translated labels as a `labels` prop from the Server Component page; keep the table itself a Client Component.

### Key Supabase tables

| Table | Purpose |
|---|---|
| `content_artifacts` | 6 922 rows — excerpts (testimonios, citas, explicaciones, respuesta_pregunta, biblia). Queried via `match_content_artifacts` RPC for RAG. |
| `study_materials` | 621 published lectures (`material_type = lecture`). Used by Fuentes. |
| `profiles` | One row per `auth.users.id`. Columns include `full_name`, `email`, `avatar_url`, `plan_tier`, `telegram_user_id`. |
| `notas` | User notes. RLS enabled (policy `notas_own_all` must exist). |
| `plan_solicitudes` | Plan requests from users (new model — form → email to Germán → response in Mensajes). |
| `daily_activity_events` | Activity log. `event_type` check constraint must include `note`. |

Legacy tables that exist but are not used in v2: `guided_plans`, `guided_plan_days`, `user_plan_enrollments`, `user_day_progress`, `journal_entries`, `diario`.

### Sidebar

`src/components/app-sidebar.tsx` — `data.navGroups` array drives the entire sidebar. Groups: `Principal`, `Apps`, `Estudio`. Add new pages here.

### Admin

Admin routes at `/admin/...` are identified by checking the authenticated user's email against the hardcoded admin email (`quotesneville@gmail.com`). No separate layout group exists yet.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY    # server-only, never expose to client
NVIDIA_API_KEY               # server-only
RESEND_API_KEY               # email sending (Resend), server-only
```

## Known issues

- Two preexisting TypeScript errors in template files that were never fixed:
  - `src/app/[locale]/(dashboard)/tasks/components/data-table-toolbar.tsx`
  - `src/components/ui/chart.tsx`
- Middleware uses the deprecated `middleware.ts` convention (should become `proxy.ts` per Next.js 16).
- A `package-lock.json` in the parent directory (`/Users/germangonzalez/`) causes a Next.js workspace root warning; it can be ignored.
