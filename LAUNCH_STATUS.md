# Elite Tours - Launch Status

_Last updated: 2026-07-21_

## What works right now (verified end-to-end)

The frontend (this folder) and the backend (`~/Desktop/Elite_Backend/Elite_backend`)
are fully integrated and tested locally:

| Flow | Status |
|---|---|
| Sign up → auto-login → dashboard | ✅ Tested in browser |
| Log in / log out (with server-side token blacklist) | ✅ Tested in browser |
| Browse live experiences (from PostgreSQL, with category/location filters) | ✅ Tested in browser |
| Book an experience (real price calculation, group-size limits) | ✅ Tested in browser |
| Dashboard shows real bookings and stats | ✅ Tested in browser |
| Contact form → API → email (logged when SendGrid not configured) | ✅ Tested in browser |
| Guide application (resume/video upload, tied to user account) | ✅ Wired to API |
| Full-package services (airport pickup, destination trips, security, car hire) | ✅ Tested in browser |
| Online service booking with contact capture → staff portal | ✅ Tested in browser |
| Staff portal (`staff.html`, admin login) with lead status tracking + bookings | ✅ Tested in browser |
| Backend test suite | ✅ 29/29 passing (`npm test`) |

## Running locally

```bash
# 1. PostgreSQL 16 (Homebrew) must be running:
LC_ALL=en_US.UTF-8 pg_ctl -D /opt/homebrew/var/postgresql@16 start

# 2. Backend API on :5001
cd ~/Desktop/Elite_Backend/Elite_backend
npm run dev

# 3. Frontend on :8000
cd ~/Desktop/Elite
node tools/serve.js 8000
```

Or via Claude Code: both servers are configured in `.claude/launch.json`.

**Test accounts** (password `Password123!`):
- Tourist: `tourist@example.com`
- Guide: `james.mwangi@example.com` (also `amina.hassan@` / `daniel.kipchoge@example.com`)
- Admin: `admin@elitetours.co.ke` / `Admin123!ChangeMe` — **change before launch**

## What was fixed during this pass

- Seed script rewritten (was using field names/enums that don't exist in the schema).
- `bookingController` rewritten — queried nonexistent columns (`userId`, `date`,
  `numberOfPeople`) and would have crashed on every request.
- Field mismatches fixed in payment/email/search services (`totalAmount`→`totalPrice`,
  `profilePicture`→`avatar`, etc.).
- Registration/login now enforce validation (invalid emails and short passwords were
  being accepted); self-registration as ADMIN blocked.
- Email verification dead-end fixed: verification emails are actually sent when
  SendGrid is configured; `AUTO_VERIFY_EMAIL=true` for local development.
- Logout fixed (was verifying access tokens with the wrong secret) and the token
  blacklist is now actually checked by the auth middleware.
- Redis and S3 made optional in development (in-memory stub / local disk uploads),
  so the server runs without cloud credentials.
- CORS was sending an invalid combined header; Helmet was blocking cross-origin
  responses. Both fixed.
- Frontend fully wired to the API via `js/api.js` (it previously simulated
  everything with `setTimeout`).

## Before you launch (required)

1. **Secrets**: copy `.env.example` → `.env` on the server; generate fresh JWT
   secrets; set `NODE_ENV=production`, `AUTO_VERIFY_EMAIL=false`.
2. **Email**: create a SendGrid account, set `SENDGRID_API_KEY`, verify your
   sender domain.
3. **Database**: managed PostgreSQL (Neon, Supabase, RDS, DigitalOcean).
   Run `npx prisma migrate deploy` then `npm run prisma:seed`.
4. **Redis**: managed Redis (Upstash, Redis Cloud) with `REDIS_ENABLED=true`.
5. **File storage**: create an S3 bucket + IAM user; set the `AWS_*` variables.
6. **Payments**: registered business required —
   M-Pesa (Safaricom Daraja production app), Stripe, and/or PayPal.
   The service code exists but each needs live credentials and a webhook URL.
   Until then, bookings are created as `PENDING` without collecting payment.
7. **Hosting**: backend on Railway/Render/Fly.io/VPS (Dockerfile included);
   frontend on Netlify/Vercel or the same VPS behind nginx (`nginx.conf` included).
   Point `CORS_ORIGIN` and `FRONTEND_URL` at the real domain, HTTPS only.
8. **Change the seeded admin password** and remove sample guides/experiences,
   or replace them with your real launch inventory.
9. Replace placeholder contact details (`+254 724 023 338`, WhatsApp link,
   `GA_MEASUREMENT_ID`) across the HTML pages — see `QUICK_START.md`.

## Staff portal

Staff log in at `/staff.html` with an ADMIN account (seeded: `admin@elitetours.co.ke`).
They see every service request (airport transfer, destination trip, consultation,
security, car hire) plus contact-form messages, with the customer's name, email,
phone, preferred date and details — and can set status (New → In progress → Closed)
and keep staff notes. Recent experience bookings with tourist contacts appear below.
Create more staff accounts by setting `userType='ADMIN'` on a user (via Prisma Studio:
`npm run prisma:studio`).

## Scenery images

The hero and card backgrounds are hand-built vector scenes
(`images/scene-*.svg` — Mara sunset, Amboseli/Kilimanjaro, Diani beach, dawn balloon
safari). To upgrade to photorealistic AI images, see `images/AI_IMAGE_PROMPTS.md` —
ready-made prompts and swap instructions (Claude can do it automatically once a
`GEMINI_API_KEY` is available).

## Nice-to-have next

- Payment checkout UI (M-Pesa STK push status polling, Stripe Elements).
- Email verification + password-reset pages (`verify-email.html`, `reset-password.html`).
- Guide dashboard (manage experiences, confirm bookings) — the API endpoints exist.
- Reviews UI after completed bookings — the API endpoints exist.
- Real photos to replace the SVG placeholders.
- The missing marketing pages linked in the nav/footer (about, events, destinations, blog…).
