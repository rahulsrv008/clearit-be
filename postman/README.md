# ClearIt API — Postman & Swagger

## Swagger UI

With the API running (`npm run start:dev`):

| URL | What |
|-----|------|
| http://localhost:3000/api | Swagger UI |
| http://localhost:3000/docs | Same UI (alias) |
| http://localhost:3000/api-json | OpenAPI JSON |

1. Open Swagger → **Authorize**
2. Paste a Bearer token from admin login / customer|agent verify-otp
3. Try endpoints from the tagged groups (`customer`, `agent`, `admin`)

## Postman

Collection file:

`postman/ClearIt-API.postman_collection.json`

### Import

Postman → **Import** → select that file.

Collection variables include `baseUrl` (`http://localhost:3000`), plus `adminAccessToken` / `customerAccessToken` / `agentAccessToken`.

### Suggested flow

1. **03 · Admin Web → Admin Web login** — test script stores `adminAccessToken`
2. Call any admin route (Authorization header is pre-filled)
3. **Customer**: send-otp → verify-otp (with `OTP_DEMO_MODE=true`, OTP is in API logs)
4. **Agent**: same OTP flow

### Regenerate after API changes

```bash
# API must be running
npm run postman:generate
```
