# Missing endpoints and unsupported features

Items the backend team needs to provide or confirm. Nothing here is faked in the UI: each one shows an explicit message or is omitted.

## Blocks a requested feature

1. **Public gym discovery.** Every `/api/gyms*` and `/api/packages` route requires a bearer token. The landing page and `/gyms` cannot show listings to visitors; `/gyms` explains this and asks for sign-in. Needed: public read-only `GET /api/gyms`, `/api/gyms/:id`, `/api/packages`.
2. **Gym staff dashboard.** The documented staff surface is login, `/auth/me` and change-password only. Check-in and bookings-by-gym are admin-only. Needed: a staff-readable bookings list and an attendance action scoped to the staff member's gym.
3. **Admin "my gyms".** `GET /api/gyms` returns every gym and omits `adminId`. The web app fetches each gym's detail to find the admin's own, which is N+1 requests. Needed: `GET /api/admin/gyms` (or `?mine=true`).
4. **Admin profile edit and password change.** No endpoint for either. The admin profile page is read-only.
5. **Notifications centre.** No endpoint. The member dashboard derives a simple activity list from bookings and sessions; there is no push or notification inbox.

## Unverified until the live server confirms (`/api/v1/...`)

All provider self-service, payout, chat, badge and attendance routes in `ENDPOINT_MAP.md` marked **U**. If the server returns 404, the page shows "Not available on this server yet". The member checkout also depends on `GET /api/v1/providers/:id` for provider packages and availability; without it, members can still book without a coach.

## Contract gaps to settle

- Response shapes for clients, earnings, payouts, chats, stats, badges and the streak leaderboard are not specified; the code reads several plausible field names defensively.
- `PUT/DELETE /api/v1/me/packages/:id` are assumed.
- Chat `before` cursor is assumed to be the oldest loaded message id.
- Session cancel by providers: the web spec asks for a "reason", but the contract has no field for it, so none is sent.
- `senderId` in chat messages may collide across member/provider tables; the UI prefers `isMine` or `senderRole` when present.
- Trainer and physiotherapist behave identically in the API docs, so they share pages under separate URL prefixes and role guards.
- Which attendance endpoint is canonical (`PUT /api/bookings/:id/check-in` vs `POST /api/v1/admin/bookings/:id/attend`).

## Not built, by decision

- **Socket.io live chat.** The spec asks for it, but the server URL/handshake is undocumented and it would add a dependency. Chat polls every 10 seconds, which the spec lists as the fallback.
- **Admin-per-gym member list.** `/api/admin/users` lists every member on the platform.
- **Image upload.** No upload endpoint; photos are pasted links.
- **Direct "create booking" endpoint** (`POST /api/bookings`): the checkout flow replaces it.

## Backend configuration the frontend needs

- CORS must allow the deployed web origin and `http://localhost:5173`, with the `Authorization` header.
- `FRONTEND_URL` must be the deployed web origin so Chapa redirects to `/payment-success`, `/payment-failed`, `/payment-pending`.
