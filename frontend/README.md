# Clynic 2.0 — Web App

A production-quality frontend for the **Clynic 2.0** multi-tenant hospital platform,
supporting both human and veterinary care.

Built with Vite + React 18 + TypeScript, React Router v6, TanStack Query v5,
Tailwind CSS v3, Axios, and react-hot-toast.

## Prerequisites

- Node.js 18+ (developed on Node 26 / npm 11)
- A running Clynic API gateway (defaults to `http://localhost:4004`)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure the API gateway URL
cp .env.example .env
#   edit .env if your gateway is not on http://localhost:4004

# 3. Start the dev server (http://localhost:5173)
npm run dev
```

### Other scripts

```bash
npm run build     # type-check + production build into dist/
npm run preview   # preview the production build
npm run lint      # type-check only (tsc --noEmit)
```

## Environment variables

| Variable            | Default                 | Description                                  |
| ------------------- | ----------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:4004` | Base URL of the API gateway (all requests).  |

No secrets are committed. `.env` is git-ignored; only `.env.example` is tracked.

## How auth works

- Register onboards a brand-new organization and its first `TENANT_ADMIN`.
- Login requires **email**, **password**, and the organization **slug**.
- Tokens (`accessToken` / `refreshToken`) are stored in `localStorage` and the
  current user lives in an `AuthContext`.
- The Axios instance attaches `Authorization: Bearer <accessToken>` to every
  request. On a `401`, it performs a single `POST /auth/refresh`; if that fails,
  the session is cleared and the user is redirected to `/login`.
- The gateway derives the tenant from the JWT, so no tenant header is sent on
  normal calls.

## Role-aware navigation

| Role                                    | Access                                                   |
| --------------------------------------- | -------------------------------------------------------- |
| `TENANT_ADMIN`                          | Everything, including **Organization**                   |
| `DOCTOR` / `NURSE` / `RECEPTIONIST`     | Dashboard, Patients, Appointments, Profile               |
| `PATIENT`                               | Simplified Dashboard, their Appointments, Profile        |

## Project structure

```
src/
  api/          Typed Axios client + per-domain modules & React Query hooks
  components/   ui/ primitives, layout/ shell, shared widgets
  context/      AuthContext (session + roles)
  lib/          utils & error helpers
  pages/        Login, Register, Dashboard, Patients, Appointments, Organization, Profile
  config.ts     Env-driven runtime config
  types.ts      Shared API model types
```

Endpoints that are not yet implemented on the backend degrade gracefully with
empty states and error toasts rather than crashing.
