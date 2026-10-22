# SIRKULA — Rescue Food. Rethink Waste.

A full-stack food redistribution platform that connects **sellers** (bakery, grocery,
restaurant, pantry) with **receivers** (households, community groups, food banks) so that
safe surplus food is redistributed before it becomes waste.

> **Demo data notice** — every account, listing, reservation and impact figure that ships
> with this repository is clearly labelled sample data. The waste-avoided metric is a
> **unit-based estimate**, not a measured weight, and the recommendation engine uses a
> transparent **rule-based score**, not AI/ML.

---

## Table of contents

1. [Feature overview](#feature-overview)
2. [Tech stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Setup (step by step)](#setup-step-by-step)
5. [Environment variables](#environment-variables)
6. [Database & migrations](#database--migrations)
7. [Seeding & demo credentials](#seeding--demo-credentials)
8. [Running the application](#running-the-application)
9. [API reference](#api-reference)
10. [Architecture](#architecture)
11. [Security](#security)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## Feature overview

| Area | What it does |
| --- | --- |
| **Auth** | Email/password registration and login, session cookies, role-based access (SELLER / RECEIVER / ADMIN), account suspension enforcement |
| **Listings** | Sellers create, edit, archive and delete surplus-food listings with photo upload, category, condition, quantity, unit, price and pickup window |
| **Marketplace** | Public search with text query, category, status and sort filters, pagination, and optional distance sorting (haversine) |
| **Reservations** | Receivers request a quantity; sellers approve/reject. Approval takes a row lock and atomically decrements `availableQuantity` |
| **Inventory** | Total quantity vs. available quantity. Approving a reservation consumes stock; editing the total keeps the two consistent |
| **Notifications** | In-app notifications for request, approval, rejection, cancellation and completion. Read/unread tracking plus "mark all read" |
| **Matching** | Deterministic, explainable scoring of available listings (category, distance, quantity fit, deadline urgency, availability) with a plain-language reason per item |
| **Reports & moderation** | Users report listings; admins review, moderate listings and suspend/reactivate accounts, with an audit log |
| **Impact** | Platform-wide metrics aggregated from the database, explicitly flagged as estimates |
| **Security** | Helmet headers, restricted CORS, double-submit CSRF, bcrypt password hashing, server-side role checks, upload validation by magic bytes |

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js >= 20 |
| Framework | Express 5 |
| Database | PostgreSQL 14+ (developed against 18) |
| ORM | Prisma 6 |
| Auth | `express-session` + `connect-pg-simple` (sessions stored in PostgreSQL) |
| Validation | `express-validator` 7 |
| Security | `helmet`, `cors`, `cookie-parser`, double-submit CSRF, `bcryptjs` |
| Frontend | Vanilla HTML/CSS/JS (no build step), inline SVG icon set |
| Tests | `node --test` (built-in runner) |

---

## Prerequisites

- **Node.js 20 or newer** — check with `node -v`
- **PostgreSQL 14 or newer** — check with `psql --version`
- **npm 10 or newer**

> On Windows, the official PostgreSQL installer is the simplest option. If you use a
> zip/binary distribution, it must contain `bin/initdb.exe`, `bin/postgres.exe` and the
> `share/` folder (containing `postgres.bki`) — `initdb` will fail without them.

---

## Setup (step by step)

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
copy .env.example .env        # Windows
cp .env.example .env          # macOS / Linux
# then edit .env (see "Environment variables" below)

# 3. Create the database
createdb -U postgres sirkula
# or, with psql:
psql -U postgres -c "CREATE DATABASE sirkula;"

# 4. Create the schema and generate the client
npx prisma generate
npx prisma migrate dev --name init

# 5. Load the demo data
npm run prisma:seed

# 6. Start the server
npm start
```

Open **http://localhost:5000**.

### One-command setup

```bash
npm run setup   # generate + migrate deploy + seed
```

---


## Environment variables

All configuration lives in `.env` (see `.env.example` for the full template).

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `development` \| `production` \| `test`. In production the error handler hides stack traces. |
| `PORT` | no | `5000` | HTTP port for the app. |
| `APP_URL` | no | `http://localhost:5000` | Public base URL of the application. |
| `SESSION_SECRET` | **yes in production** | dev fallback | Secret used to sign the session cookie. Use at least 64 random characters. |
| `SESSION_COOKIE_NAME` | no | `sirkula_session` | Name of the session cookie. |
| `SESSION_COOKIE_SECURE` | no | `false` | Set to `true` when serving over HTTPS. |
| `SESSION_COOKIE_SAMESITE` | no | `Lax` | `Lax` \| `Strict` \| `None`. |
| `SESSION_COOKIE_MAX_AGE` | no | `86400000` | Session lifetime in milliseconds (24 h). |
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/sirkula?schema=public`. |
| `BCRYPT_SALT_ROUNDS` | no | `12` | Password hashing cost. |
| `CSRF_COOKIE_NAME` | no | `sirkula_csrf_token` | Reserved for the CSRF cookie name. The runtime double-submit cookie is `XSRF_TOKEN`. |
| `MAX_FILE_SIZE` | no | `5242880` | Maximum upload size in bytes (5 MB). |
| `UPLOAD_DIR` | no | `public/uploads` | Directory where uploaded images are stored. |
| `CORS_ORIGINS` | no | `http://localhost:5000` | Comma-separated list of allowed origins. |

### Generating a session secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database & migrations

The schema lives in [`prisma/schema.prisma`](prisma/schema.prisma) and is managed with Prisma.

### Models

| Model | Purpose |
| --- | --- |
| `User` | Account with `role` (SELLER/RECEIVER/ADMIN) and `status` (ACTIVE/SUSPENDED). |
| `FoodListing` | A surplus-food offer. `quantity` is the total, `availableQuantity` is what is still unclaimed. |
| `Reservation` | A receiver's request for a quantity, with a status machine (PENDING → APPROVED/REJECTED/CANCELLED → COMPLETED). |
| `Notification` | In-app message, optionally linked to a listing and/or reservation. |
| `Report` | A user report against a listing, with a moderation status. |
| `DistributionRecord` | Records a completed handover and the quantity distributed. |
| `AuditLog` | Administrative actions (e.g. suspensions) for traceability. |

### Common commands

```bash
npx prisma generate                # regenerate the client after schema edits
npx prisma migrate dev --name init # create + apply a new migration (dev)
npx prisma migrate deploy          # apply existing migrations (prod/CI)
npx prisma migrate status          # show applied/pending migrations
npx prisma studio                  # browse the data in a GUI
npm run prisma:seed                # (re)load the demo dataset
```

> The seed script **clears** the core tables before inserting, so it is safe to re-run
> but will wipe any data you created yourself.

### How inventory stays consistent

* `quantity` — total amount the seller originally listed.
* `availableQuantity` — how much is still claimable.

When a seller **approves** a reservation, the app takes a row lock on the listing
(`SELECT ... FOR UPDATE`), re-reads the current availability, and decrements
`availableQuantity` inside the same transaction as the status change. If there is not
enough stock the approval is rejected with `INSUFFICIENT_INVENTORY` and nothing is
written. When a seller **edits the total quantity**, the difference is applied to
`availableQuantity` so the two never drift apart.

---

## Seeding & demo credentials

```bash
npm run prisma:seed
```

Password for **every** demo account: `Password123!`

| Role | Email | Notes |
| --- | --- | --- |
| Admin | `admin@sirkula.demo` | Full access to moderation, users and audit log. |
| Seller | `seller.bakery@sirkula.demo` | Bakery surplus. |
| Seller | `seller.grocery@sirkula.demo` | Grocery / produce surplus. |
| Seller | `seller.restaurant@sirkula.demo` | Prepared meals. |
| Receiver | `receiver.andi@sirkula.demo` | Household receiver. |
| Receiver | `receiver.siti@sirkula.demo` | Community-group receiver. |
| Seller (suspended) | `seller.suspended@sirkula.demo` | Demonstrates the suspension flow. |

The seed also creates 6 listings (including one deliberately expired and one that must
not be reserved), 5 reservations across different statuses, sample notifications, a

## Running the application

```bash
npm start        # or: npm run dev
```

The server listens on `http://localhost:5000` (override with `PORT`).

| URL | What it is |
| --- | --- |
| `/` | Landing page |
| `/login.html`, `/register.html` | Authentication |
| `/dashboard.html` | Role-aware dashboard |
| `/marketplace.html` | Search and browse surplus food |
| `/listing-detail.html?id=...` | Listing detail + reservation form |
| `/create-listing.html` | Seller: create a listing (with photo upload) |
| `/seller-inventory.html` | Seller: manage own listings |
| `/reservations.html` | Seller/receiver: reservation management |
| `/notifications.html` | Notification centre |
| `/profile.html` | Profile and password |
| `/admin.html` | Admin: users, listings, reports, audit log |
| `/impact.html` | Impact dashboard with charts |
| `/api/v1/health` | Health check (includes a database round-trip) |

### Health check

```bash
curl http://localhost:5000/api/v1/health
# {"success":true,"status":"ok","db":"connected"}
```

Returns HTTP 503 with `"db":"disconnected"` if the database is unreachable.

---

## API reference

Base URL: `http://localhost:5000/api/v1`

Responses follow a consistent envelope:

```jsonc
// success
{ "success": true, "message": "...", "data": { ... } }

// failure
{ "success": false, "error": "Human readable message", "code": "MACHINE_CODE" }
```

### Auth — `/auth`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | public | Creates a SELLER or RECEIVER account. |
| `POST` | `/auth/login` | public | Starts a session. |
| `POST` | `/auth/logout` | user | Destroys the session. |
| `GET` | `/auth/me` | user | Returns the current user. |

### Users — `/users`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/users/me` | user | Own profile. |
| `PATCH` | `/users/me` | user | Update name / phone / address. |
| `PATCH` | `/users/change-password` | user | Requires the current password. |

### Listings — `/listings`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/listings` | SELLER | The seller's own listings (paginated). |
| `GET` | `/listings/:id` | public | Single listing. |
| `POST` | `/listings` | SELLER | Create (JSON or `multipart/form-data` with an `image` field). |
| `PATCH` | `/listings/:id` | SELLER | Update own listing. |
| `DELETE` | `/listings/:id` | SELLER | Delete own listing (blocked while reservations are active). |
| `POST` | `/listings/:id/archive` | SELLER | Set status to `UNAVAILABLE`. |

### Marketplace — `/marketplace`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/marketplace` | public | Search/filter/sort/paginate. |
| `GET` | `/marketplace/categories` | public | Distinct available categories. |

Query parameters: `q`, `category`, `location`, `status`, `sort` (`newest`/`nearest`/`deadline`),
`page`, `limit` (max 100), `lat`, `lng`.

### Reservations — `/reservations`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/reservations` | user | Role-scoped: sellers see requests on their listings, receivers see their own requests. |
| `POST` | `/reservations` | RECEIVER | Request a quantity. |
| `PATCH` | `/reservations/:id` | SELLER | Approve or reject (approval consumes stock). |
| `DELETE` | `/reservations/:id` | RECEIVER | Cancel a pending request. |
| `POST` | `/reservations/:id/complete` | SELLER | Mark the pickup as completed (writes a `DistributionRecord`). |

### Notifications — `/notifications`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/notifications` | user | Own notifications (paginated, `unreadOnly` supported). |
| `PATCH` | `/notifications/:id/read` | user | Mark one as read. |
| `PATCH` | `/notifications/read-all` | user | Mark all as read. |

### Matching, impact, reports, admin

## Architecture

```
sirkula/
├── prisma/
│   ├── schema.prisma         # Prisma schema (7 models, 4 enums)
│   ├── seed.js               # Idempotent demo-data seed
│   └── migrations/           # Generated SQL migrations
├── src/
│   ├── server.js             # Entry point: starts the HTTP listener
│   ├── app.js                # Express app: middleware order + route mounting
│   ├── lib/prisma.js         # Prisma client singleton (hot-reload safe)
│   ├── middleware/
│   │   ├── auth.js           # requireAuth / requireRole / optionalAuth
│   │   ├── csrf.js           # double-submit CSRF
│   │   ├── upload.js         # dependency-free multipart parser + validation
│   │   └── errorHandler.js   # ApiError, asyncHandler, JSON error envelope
│   ├── validators/           # express-validator rule sets
│   ├── controllers/          # request handling per domain
│   ├── routes/               # Express routers mounted under /api/v1
│   └── services/             # shared business logic (notifications)
├── public/                   # static frontend (no build step)
│   ├── *.html                # pages
│   ├── css/                  # stylesheets
│   ├── js/                   # page scripts, API client, icon set
│   └── uploads/              # user-uploaded images (git-ignored)
├── tests/
│   ├── e2e.test.js           # end-to-end API tests
│   └── fixtures/             # binary fixtures for the upload test
├── .env.example
└── package.json
```

### Request pipeline

```
request
  → helmet (security headers)
  → cors (restricted origins)
  → express.json / express.urlencoded
  → static assets
  → express-session (PostgreSQL session store)
  → cookie-parser
  → csrfProtection        (issues / validates the XSRF_TOKEN cookie)
  → route
      → requireAuth / requireRole
      → validators (express-validator)
      → controller (asyncHandler)
      → Prisma
  → notFound  →  errorHandler
```

### Frontend notes

The pages are plain static HTML with vanilla JavaScript — there is no bundler and no
build step. `public/js/icons.js` ships a self-contained inline SVG set and hydrates the
`${icon('name')}` / `${initials('Name')}` placeholders that appear in the static HTML at
runtime, so the markup stays readable in source form.

`public/js/api.js` is a thin fetch wrapper that attaches the CSRF header, unwraps the
`{ success, data }` envelope and redirects to the login page on a 401.

---

## Security

| Concern | Mitigation |

## Testing

The suite is a black-box end-to-end test that runs against a **live server** and a
**seeded database**.

```bash
# terminal 1
npm start

# terminal 2
npm test
```

Expected output:

```
tests 23
pass  23
fail  0
```

### What it covers

* Health check and database connectivity
* Unauthenticated access rejection (`401`)
* Session bootstrap and `GET /auth/me`
* Marketplace listing, pagination metadata and query validation
* Role enforcement (a receiver cannot create a listing; a non-admin cannot reach `/admin`)
* Full reservation lifecycle: reserve → duplicate guard → approve → inventory decrement → notification → complete → cancel
* Inventory guard (cannot reserve more than is available)
* Notification read / read-all routing
* Seller inventory scoping
* Impact metrics and the "estimated" flag
* Recommendation endpoint
* Reporting + admin moderation, user listing and audit log
* Suspended-account login rejection
* Invalid login, unknown-route 404, registration validation
* CSRF enforcement on state-changing requests
* Image upload (stored under a randomised name, served over HTTP) and rejection of non-image uploads

The tests clean up the records they create, so they can be re-run without reseeding.

> `tests/fixtures/pixel.png` is a 1×1 PNG. Regenerate it with `npm run test:fixtures`.

---

## Troubleshooting

**`Error: P1001 Can't reach database server`**
The database is not running or `DATABASE_URL` is wrong. Check `pg_isready` and that the
host, port, user, password and database name all match.

**`the URL must start with the protocol postgresql://`**
`DATABASE_URL` is missing the protocol or is quoted incorrectly in `.env`.

**`error: Schema validation - (validate wasm)`**
The Prisma schema is out of sync. Run `npx prisma generate` and
`npx prisma migrate dev --name <change>`.

**`Error: P3014 / migration failed`**
A previous migration was interrupted. Reset the local database and re-apply:
`npx prisma migrate reset`.

**Port 5000 already in use**
Change `PORT` in `.env`, e.g. `PORT=5050`.

**Upload fails with "content does not match an allowed image type"**
The file's real content type does not match its extension. Re-export the image as a
genuine JPEG/PNG/WebP/GIF.

**`relation "listing" is missing an opposite relation field`**
After changing a relation in `schema.prisma`, add the matching back-reference field on
the other model and re-run `npx prisma migrate dev`.

**PostgreSQL will not start on Windows (`could not reserve shared memory region` / `0xC0000142`)**
Set `huge_pages = off` in `postgresql.conf` and restart the service.

---

## License

ISC

| --- | --- |
| Password storage | bcrypt with a configurable cost (default 12 rounds). |
| Session hijacking | `httpOnly` session cookie, `sameSite=Lax`, `secure` in production, `trust proxy` aware. |
| CSRF | Double-submit cookie: the `XSRF_TOKEN` cookie must be echoed in the `X-XSRF-TOKEN` header on every POST/PUT/PATCH/DELETE. |
| XSS | Helmet headers; the frontend escapes user-supplied text before injecting it into the DOM. |
| SQL injection | Prisma parameterises all queries; the one raw query is a parameterised `FOR UPDATE` lock. |
| Broken access control | Role and ownership checks are enforced **server-side** in middleware and controllers, not only in the UI. |
| Malicious uploads | Extension allow-list, magic-byte content check, size limit, randomised filenames, no original names on disk. |
| Information disclosure | Production error responses never include stack traces; Prisma error codes are mapped to friendly messages. |
| Clickjacking / sniffing | `helmet` sets `X-Frame-Options`, `X-Content-Type-Options` and related headers. |

---


| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/matching/recommendations` | user | Deterministic, explainable scoring. |
| `GET` | `/impact/stats` | user | Aggregated platform metrics (flagged as estimates). |
| `POST` | `/reports` | user | Report a listing. |
| `GET` | `/reports/mine` | user | Own reports. |
| `GET` | `/admin/stats` | ADMIN | Dashboard counters. |
| `GET` | `/admin/users` | ADMIN | List users. |
| `PATCH` | `/admin/users/:id/status` | ADMIN | Suspend / reactivate an account. |
| `GET` | `/admin/listings` | ADMIN | All listings for moderation. |
| `PATCH` | `/admin/listings/:id/moderate` | ADMIN | Change a listing's status. |
| `GET` | `/admin/reports` | ADMIN | List reports. |
| `PATCH` | `/admin/reports/:id` | ADMIN | Update a report's status. |
| `GET` | `/admin/audit-logs` | ADMIN | Audit trail. |

### Common error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `AUTH_REQUIRED` | 401 | No session. |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password. |
| `ACCOUNT_SUSPENDED` | 403 | The account is suspended. |
| `FORBIDDEN` | 403 | Role or ownership check failed. |
| `NOT_FOUND` | 404 | Resource does not exist. |
| `VALIDATION_ERROR` | 400 | Input validation failed. |
| `CSRF_MISMATCH` | 403 | Missing or mismatched CSRF token. |
| `DUPLICATE_RESERVATION` | 409 | The receiver already has an active request for this listing. |
| `INSUFFICIENT_INVENTORY` | 400 | Not enough stock left. |
| `NOT_AVAILABLE` | 400 | The listing is no longer available. |
| `OWN_LISTING` | 400 | A seller cannot reserve their own listing. |
| `ACTIVE_RESERVATIONS` | 400 | Cannot delete a listing with active reservations. |
| `UPLOAD_ERROR` | 400 | The uploaded file was rejected. |

---

pending report and an audit-log entry.

> All seeded records are sample data for demonstration only.

---
#   S I R K U L A  
 