# CleanIt API (`clearit-be`)

NestJS backend for CleanIt — same layout style as `f2o-cops-disruption-portal-be-module` (Mars):

- `src/apis/*` feature modules
- `src/db/entities` TypeORM entities
- `src/config` TypeORM + Swagger
- `src/logger` Winston daily rotate logs
- `.env` keys (you fill values)

Aligned to **CleanIt architecture / STG roadmap**: Auth OTP, Users, Addresses, Bookings state machine, Razorpay payments, GPS tracking, `/health`.

PostgreSQL schema is the full 32-table design (customers, agents, services, bookings, payments, earnings, coupons, support, etc.). Run `sql/001_full_schema.sql` in pgAdmin on the `clearit` database. Keep `DB_SYNC=false`.


## Quick start

```bash
cd /Users/rahulsrivastav/Desktop/clearIt/clearit-be
cp .env.example .env   # if needed
# fill DB_* , JWT_SECRET, and vendor keys in .env
npm install
npm run start:dev
```

- API: `http://localhost:3000` (or `PORT` from `.env`)
- Swagger UI: `http://localhost:3000/api` (also `/docs`)
- OpenAPI JSON: `http://localhost:3000/api-json`
- Health: `http://localhost:3000/api/v1/health`
- Postman: import `postman/ClearIt-API.postman_collection.json` (regenerate with `npm run postman:generate`)

## `.env` keys you must fill

| Key | Purpose |
|-----|---------|
| `PORT` | API port (default 3000) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | Postgres |
| `DB_SCHEMA` | `public` (default Postgres schema) |
| `DB_SSL` | `true`/`false` |
| `DB_SYNC` | keep `false` (use SQL / migrations for schema) |
| `JWT_SECRET` | session signing |
| `ALLOWED_ORIGINS` | CORS (comma-separated) |
| `SMS_*` / `OTP_*` | OTP sandbox (`OTP_DEMO_MODE=true` accepts demo OTP) |
| `RAZORPAY_*` | test keys for STG |
| `MAPS_API_KEY` / `FCM_*` | maps + push (later weeks) |

## Booking flow (shared record)

`finding → paid → accepted → arriving → ongoing → completed` (+ `cancelled` before start)

## Main routes

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | STG checklist |
| POST | `/auth/request-otp` | SMS / demo OTP |
| POST | `/auth/verify-otp` | JWT |
| GET/PATCH | `/users/me` | profile |
| CRUD | `/addresses` | customer addresses |
| POST/GET | `/bookings` | create + list |
| PATCH | `/bookings/:id/accept\|arriving\|start\|complete\|cancel\|rate` | state machine |
| POST | `/payments/create-order/:bookingId` | Razorpay stub/order |
| POST | `/payments/confirm/:bookingId` | mark paid (STG helper) |
| POST | `/payments/webhook` | Razorpay webhook |
| POST | `/tracking/ping` | agent GPS |
| GET | `/tracking/latest/:bookingId` | customer map |

## Notes

- Schema SQL: `sql/001_full_schema.sql` (32 tables). Existing STG APIs still work against the new tables.
- Keep `DB_SYNC=false` and create/update tables via that SQL in pgAdmin.
