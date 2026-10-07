# Roster — EMS Frontend

The web frontend for the **Employee Management System** (`../ems-backend`). It's a multi-tenant workspace: each organization signs up, manages its employees and departments, invites members with roles, and only ever sees its own data.

> "Roster" is the working product name used in the UI. Change it in `src/components/layout/Logo.tsx` and `index.html`.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Roles and permissions](#roles-and-permissions)
- [Design system](#design-system)
- [Backend notes and limitations](#backend-notes-and-limitations)
- [Troubleshooting](#troubleshooting)

---

## Features

| Area | What you can do |
|---|---|
| **Auth** | Sign in with email and password. Create a workspace in two steps (organization, then owner account), after which you're signed in automatically. Accept an invitation through a link. |
| **Overview** | Headline numbers (headcount, active share, departments, members), hires per month for the last 12 months, salary bands and recent hires. Every chart has a **Table** view. |
| **Employees** | Sortable, searchable and paginated table with status filters. Create and edit in a side panel. Each employee has a detail page. Deletes ask for confirmation. Below tablet width the table becomes a card list. |
| **Departments** | Card grid with create, rename (names are unique per organization) and delete. |
| **Members** | Users in the workspace, with an inline role change. Invites produce a copyable link that expires after 24h. |
| **Settings** | Edit the organization's name and email. Delete the workspace (owner only; you type the name to confirm). Profile, light/dark theme and session info. |
| **Everywhere** | ⌘K / Ctrl+K command palette (navigate, quick actions, find people), dark mode, loading skeletons, empty and error states, toasts, responsive layout, keyboard and screen-reader friendly components. |

---

## Tech stack

| Concern | Library | Version |
|---|---|---|
| Build tool / dev server | [Vite](https://vite.dev) | 8.3 |
| UI library | [React](https://react.dev) | 19.3 |
| Language | TypeScript (strict mode) | 6.0 |
| Styling | [Tailwind CSS](https://tailwindcss.com) with CSS-variable design tokens | 4.3 |
| Accessible primitives | [Radix UI](https://www.radix-ui.com) (`radix-ui`) for dialogs, menus, selects and tooltips | 1.7 |
| Animation | [framer-motion](https://motion.dev) | 14.0 |
| Routing | [React Router](https://reactrouter.com), data router with lazy routes | 8.4 |
| Server state / caching | [TanStack Query](https://tanstack.com/query) | 5.104 |
| Data tables | [TanStack Table](https://tanstack.com/table) | 9.2 |
| Forms | [react-hook-form](https://react-hook-form.com) + [zod](https://zod.dev) | 7.89 / 4.6 |
| HTTP | [axios](https://axios-http.com) | 1.20 |
| Charts | [Recharts](https://recharts.org) | 3.10 |
| Command palette | [cmdk](https://cmdk.paco.me) | 1.1 |
| Toasts | [sonner](https://sonner.emilkowal.ski) | 2.0 |
| Icons | [lucide-react](https://lucide.dev) | 1.52 |
| Dates | [date-fns](https://date-fns.org) | 4.4 |
| JWT decoding | jwt-decode | 4.0 |
| Fonts | Geist Sans and Geist Mono (self-hosted via Fontsource) | 5.3 |
| Linting | ESLint 10 + typescript-eslint + react-hooks rules | — |

---

## Getting started

### Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| Node.js | 20.19+ or 22.12+ (developed on 24) | the frontend |
| npm | 10+ | the frontend |
| Java | 21+ | the backend |
| MySQL | 8.x, running on `localhost:3306` | the backend |

### 1. Start the backend

The frontend talks to the Spring Boot API in `../ems-backend`, which needs a MySQL database and a JWT signing key.

```bash
# MySQL: create the database (the backend logs in as root/root, see application.properties)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ems_db;"

# JWT_SECRET must be a Base64-encoded key of at least 256 bits
export JWT_SECRET=$(openssl rand -base64 32)        # PowerShell: $env:JWT_SECRET = "<base64 key>"

cd ../ems-backend
./mvnw spring-boot:run                              # Windows: mvnw.cmd spring-boot:run
```

The API comes up on **http://localhost:8080**. Hibernate creates the tables on first start (`ddl-auto=update`).

### 2. Start the frontend

```bash
cd ems-frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

### 3. First run

1. Go to **Create a workspace** and register your organization and owner account. You land on the Overview.
2. Add departments and employees.
3. Under **Members → Invite**, create an invite link and open it in a private window to join as another role.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server on `:5173` with hot reload and the `/api` proxy |
| `npm run build` | Type-checks (`tsc -b`) and builds a production bundle into `dist/` |
| `npm run preview` | Serves the built `dist/` locally to check the production build |
| `npm run lint` | Runs ESLint over the project |

---

## Configuration

### API location

In development every request goes to the relative path `/api`, and Vite **proxies** it to the backend (see `vite.config.ts`):

```ts
server: { proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } }
```

Because of the proxy the browser sees a single origin, so the backend needs no CORS setup during development.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | Base URL for API calls. Set it when the frontend and backend are deployed on different origins, e.g. `https://api.example.com/api` |

Put overrides in `.env.local` (git-ignored):

```bash
VITE_API_URL=https://api.example.com/api
```

> If the frontend is served from a different origin than the API, **CORS must be enabled on the backend**. It currently has no CORS config.

### Deploying the build

`npm run build` outputs a static site in `dist/`. Any static host works (Nginx, Netlify, Vercel, S3 + CloudFront). The app uses client-side routing, so configure the host to **serve `index.html` for unknown paths**. Otherwise refreshing `/employees/12` returns a 404.

---

## Project structure

Code is organized **by feature**. Shared building blocks live outside `features/`.

```
ems-frontend/
├─ index.html                 # sets the theme class before React loads (no flash)
├─ vite.config.ts             # @ alias, Tailwind plugin, /api proxy
├─ eslint.config.js
├─ public/                    # favicon
└─ src/
   ├─ main.tsx                # entry: Providers + RouterProvider
   ├─ index.css               # design tokens (light/dark), fonts, base styles
   │
   ├─ app/
   │  ├─ providers.tsx        # QueryClient, MotionConfig, Tooltip provider, Toaster
   │  ├─ router.tsx           # route tree, guards, lazy-loaded pages
   │  └─ theme.ts             # light/dark store (persisted to localStorage)
   │
   ├─ auth/
   │  ├─ auth-store.ts        # JWT session store, auto sign-out on expiry, cross-tab sync
   │  ├─ use-auth.ts          # useSession(), useCan(action)
   │  ├─ guards.tsx           # RequireAuth, RedirectIfAuthed, RequirePermission
   │  └─ permissions.ts       # role → action matrix (mirrors backend @PreAuthorize)
   │
   ├─ lib/
   │  ├─ api-client.ts        # axios instance + auth header + 401 handling
   │  ├─ errors.ts            # ApiError: normalizes both backend error shapes
   │  ├─ forms.ts             # maps server validation errors onto form fields
   │  ├─ format.ts            # currency (INR), dates, role/status labels
   │  ├─ jwt.ts               # decode token → Session
   │  └─ utils.ts             # cn(), initials()
   │
   ├─ types/api.ts            # TypeScript types matching the backend DTOs 1:1
   │
   ├─ components/
   │  ├─ ui/                  # Button, Input, Field, Badge, Dialog/Sheet, Menu/Select, Avatar, Skeleton…
   │  ├─ layout/              # AppShell, Sidebar, CommandMenu (⌘K), PageHeader, Logo, nav config
   │  ├─ data-table/          # generic DataTable (sort/search/paginate, mobile cards), TableSkeleton
   │  └─ feedback/            # EmptyState, ErrorState, ConfirmDialog, motion presets
   │
   ├─ features/
   │  ├─ auth/                # Login, Register (2-step), AcceptInvite, schemas, api hooks
   │  ├─ dashboard/           # Overview page + metric calculations
   │  ├─ employees/           # list, detail, create/edit sheet, delete dialog, schemas, api hooks
   │  ├─ departments/         # card grid + create/rename/delete
   │  ├─ team/                # members table, role change, invite dialog
   │  └─ settings/            # organization settings, profile, settings layout
   │
   └─ routes/                 # NotFoundPage (404), ForbiddenPage (403)
```

**Conventions**

- Each feature has an `api.ts` with its TanStack Query hooks (`useEmployees`, `useSaveEmployee`, …) and query keys. Pages never call axios directly.
- Each feature's zod schemas (`schemas.ts`) use the **same limits as the backend's bean-validation annotations**, so most errors are caught before a request is sent.
- Imports use the `@/` alias for `src/`.
- Colors always come from tokens (`bg-surface`, `text-muted`, `border-border`, …), never hard-coded values.

---

## How it works

### Routing

| Path | Page | Access |
|---|---|---|
| `/login`, `/register` | Auth pages | Signed-out users only (signed-in users are redirected) |
| `/accept-invite?token=…` | Accept invitation | Public |
| `/` | Overview | Any signed-in user |
| `/employees`, `/employees/:id` | Employees | Any signed-in user |
| `/departments` | Departments | Any signed-in user |
| `/team` | Members | OWNER, ADMIN, HR |
| `/settings/organization`, `/settings/profile` | Settings | Any signed-in user (editing is role-gated) |

App pages are **lazy-loaded**, so each one is its own JS chunk. Visiting a protected page while signed out redirects to `/login?next=<page>`, and after login you return to that page.

### Authentication and session

1. `POST /api/auth/login` returns `{ accessToken }` (a JWT valid for 24h).
2. The token is stored in `localStorage` and decoded into a **session**: `email`, `userId`, `organizationId`, `role` and `expiresAt`.
3. axios adds `Authorization: Bearer <token>` to every request.
4. The session ends:
   - when the token expires (a timer signs you out and shows a toast);
   - on any 401 response;
   - when you sign out in another tab (tabs stay in sync);
   - when you sign out manually.
5. On sign-in or sign-out the query cache is **cleared**, so one organization's data can never show up in another session.

The backend has no `/me` endpoint and no refresh token, so the decoded JWT *is* the session. Registering doesn't return a token, so the app logs in right after registration with the same credentials.

### Data fetching

- TanStack Query caches every list. Data is treated as fresh for 30s, and failed requests are retried twice except for 4xx errors.
- Mutations either update the cache directly (delete removes the row immediately) or invalidate it.
- Role changes are **optimistic**: the UI updates at once and rolls back if the server rejects the change.
- The backend returns plain arrays with no pagination, so **sorting, search and pagination happen on the client** through TanStack Table.

### Error handling

The backend returns errors in two shapes:

```jsonc
{ "status": 409, "message": "Employee email already exists", "timestamp": "…" } // app exceptions
{ "status": 403, "error": "Forbidden", "path": "/api/…", "timestamp": "…" }       // Spring defaults
```

`lib/errors.ts` turns both into a single `ApiError { status, message, fieldErrors }`:

- Validation messages such as `"email: Invalid email format, salary: Salary cannot be negative"` are parsed into per-field errors and shown under the matching inputs.
- Known conflicts (409s such as a duplicate email or department name) attach to the relevant field.
- Everything else becomes a toast with a readable message. Raw 5xx text is never shown.

---

## Roles and permissions

The UI **hides** controls a role can't use, rather than just disabling them. `src/auth/permissions.ts` mirrors the backend rules:

| Action | OWNER | ADMIN | HR | MANAGER | EMPLOYEE |
|---|:-:|:-:|:-:|:-:|:-:|
| View employees and departments | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create or edit employees and departments | ✓ | ✓ | ✓ | | |
| Delete employees and departments | ✓ | ✓ | | | |
| View members | ✓ | ✓ | ✓ | | |
| Invite members and change roles | ✓ | ✓ | | | |
| Edit organization | ✓ | ✓ | | | |
| Delete organization | ✓ | | | | |

Further rules:
- Nobody can grant OWNER.
- An ADMIN can't grant ADMIN.
- You can't change your own role.
- The owner's role is fixed.

> These checks only improve the UX. **The backend is the real security boundary** and enforces all of them.

---

## Design system

- **Palette:** warm neutral greys with a single ink-green accent. All colors are CSS variables in `src/index.css`, defined once for light mode and once for dark mode (`.dark` on `<html>`).
- **Type:** Geist Sans for UI text and Geist Mono for IDs and codes. Money uses tabular figures so columns line up.
- **Shape:** 1px hairline borders, 6–8px radii, and a dense 48px table row.
- **Motion** (framer-motion), short and functional at 150–250ms:
  - page fade-ins;
  - spring-driven side sheets;
  - dialogs that scale in;
  - rows and cards that animate in and out;
  - a sliding active-nav indicator.

  Motion is turned off when the OS has "reduce motion" enabled.
- **Charts:** a single series color, checked for contrast and colorblind safety against both light and dark backgrounds. Every chart has a table alternative.

---

## Backend notes and limitations

Things in the current backend API that shape the UI:

- **No CORS config.** This is fine in development thanks to the proxy, but it's required if the frontend and API are deployed on different origins.
- **`GET /api/organizations` returns every organization**, not just your own. The frontend only uses `/api/organizations/me`, but the endpoint should be fixed on the backend.
- **Invitations:**
  - No email is sent, so the link is shown once in the UI and you share it yourself.
  - There are no endpoints to list, resend or revoke invitations.
- **No endpoint sets an employee's department or status.** Status is always `ACTIVE` on create, and the employee DTOs don't expose a department.
- **Deleting a department that's still referenced** may fail with a 500 from a database constraint. The UI shows a friendly message.
- **Usernames and user emails are unique across all organizations**, not per organization.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "Can't reach the server" toast | The backend isn't running on `:8080`. Start it, or point the proxy or `VITE_API_URL` elsewhere. |
| Backend fails at startup with a JWT/key error | `JWT_SECRET` is missing or isn't a Base64 key of ≥256 bits. |
| Backend fails at startup with a connection error | MySQL isn't running, or the `ems_db` database or the root/root credentials don't match `application.properties`. |
| Signed out unexpectedly | The token expired after 24h, or the backend restarted with a different `JWT_SECRET`. |
| 404 when refreshing a page in production | The host isn't falling back to `index.html` for client-side routes. |
| CORS errors in production | Enable CORS on the backend for your frontend's origin. |
