# Endpoint-to-page map

Status key: **V** documented in `Endpoints_Full.md` (primary source). **U** only in `v2-backend.md` / the Postman collection, not in `Endpoints_Full.md`, so unverified. **A** assumed path or shape (called out in the notes). No endpoint here has been called against the live server (see `TEST_RESULTS.md`).

All paths are relative to `VITE_API_URL`. Envelope: V1 routes return `{ success, ... }`; V2 routes return `{ data, error }`. The client unwraps both.

| Feature | Frontend page | Method | Path | Auth / role | Request | Response (used fields) | Status |
|---|---|---|---|---|---|---|---|
| Member register | `/register` | POST | `/api/auth/register` | none | name, email, password, phone? | `token`, `user` | V |
| Member login | `/login` | POST | `/api/auth/login` | none | email, password | `token`, `user` | V |
| Admin login | `/login` | POST | `/api/auth/admin/login` | none | email, password | `token`, `admin` | V |
| Provider login | `/login` | POST | `/api/auth/provider/login` | none | email, password | `data.token`, `data.mustChangePassword`, `data.user` | V |
| Staff login | `/login` | POST | `/api/auth/staff/login` | none | email, password | `data.token`, `data.mustChangePassword`, `data.user` | V |
| Restore session | app start | GET | `/api/auth/me` | any | none | `role`, `id` (+ profile for provider/staff) | V |
| Forced password change | `/change-password`, provider/staff Password | POST | `/api/auth/change-password` | provider, staff | currentPassword, newPassword | ok | V |
| Member profile | `/app/profile` | GET/PUT | `/api/users/me` | MEMBER | name?, phone?, photoUrl? | `user` | V |
| Member password | `/app/profile` | PUT | `/api/users/change-password` | MEMBER | currentPassword, newPassword | ok | V |
| Notification preferences | `/app/profile` | GET/PUT | `/api/users/preference` | MEMBER | bookingConfirm?, sessionReminders?, offersAndPromotions? | `preference` | V |
| Gym list | `/app/gyms` | GET | `/api/gyms` | any token | none | `gyms[]` | V |
| Gym search | `/app/gyms` | GET | `/api/gyms/search` | any token | `name?`, `location?` (one required) | `gyms[]` | V |
| Gym detail | `/app/gyms/:id`, admin gym discovery | GET | `/api/gyms/:id` | any token | none | `gymDetails` (incl. `adminId`) | V |
| Gym availability | booking step 1 | GET | `/api/gyms/:id/availability` | any token | `slot_start`, `slot_end` | `available {capacity, booked, available}` | V |
| Create / edit gym | `/admin/gyms` | POST / PUT | `/api/gyms`, `/api/gyms/:id` | GYM_ADMIN | name, address, latitude, longitude, openingTime, closingTime, capacity, photos?, amenities? | `gym` / `updatedGym` | V |
| Packages for a gym | gym detail, booking | GET | `/api/packages?gym_id=` | any token | none | `packages[]` | V |
| Admin package CRUD | `/admin/packages` | GET, POST, PATCH, DELETE | `/api/admin/gym-packages[/:id]` | GYM_ADMIN | name, type, price, durationDays, benefits?, maxVisits?, allowedDays, allowedPeriods, maxGroupSize (`gymId` on create only) | `{items,page,limit,total}` | V |
| Provider search | gym detail, booking | GET | `/api/providers/search` | MEMBER | `gymId?`, `type?`, name? | `providers[]` | V |
| Provider reviews | admin Reviews dialog, provider Reviews | GET | `/api/providers/:id/reviews` | any token | page, limit | `data.items[]` (`reviewerFirstName`) | V |
| Provider leaderboard | admin ranking, provider Reviews | GET | `/api/leaderboard/providers` | provider, admin | `gymId` (admin), `type`, page, limit | `data.items[]` | V |
| Admin providers | `/admin/providers` | GET, POST, PATCH | `/api/admin/providers[/:id]` | GYM_ADMIN | list: gymId, type, isActive, page, limit; create: gymId, type, email, name, ...; update: profile fields, isActive | `{items,...}`; create returns `temporaryPassword` | V |
| Reset provider password | `/admin/providers` | POST | `/api/admin/providers/:id/reset-password` | GYM_ADMIN | none | `temporaryPassword` | V |
| Admin staff | `/admin/staff` | GET, POST, PATCH | `/api/admin/staff[/:id]` | GYM_ADMIN | like providers, no type | `{items,...}` | V |
| Reset staff password | `/admin/staff` | POST | `/api/admin/staff/:id/reset-password` | GYM_ADMIN | none | `temporaryPassword` | V |
| Admin dashboard totals | `/admin` | GET | `/api/admin/dashboard` | GYM_ADMIN | none | `data {totalGyms,totalUsers,totalBookings,totalPayments}` | V |
| Admin members | `/admin/members` | GET, DELETE | `/api/admin/users[/:id]` | GYM_ADMIN | none | `users[]` | V |
| Admin profile | `/admin/profile` | GET | `/api/admin/profile` | GYM_ADMIN | none | `admin` | V |
| My bookings | `/app/bookings` | GET | `/api/bookings?status=` | MEMBER | none | `bookings[]` | V |
| Booking detail | `/app/bookings/:id` | GET | `/api/bookings/:id` | MEMBER | none | `booking` | V |
| Cancel booking (member) | booking detail | POST | `/api/bookings/:id/cancel` | MEMBER | none | ok | V |
| Add coaching session | booking detail | POST | `/api/bookings/:bookingId/sessions` | MEMBER | purchaseId, startsAt | `session` | V |
| Gym bookings | `/admin/bookings` | GET | `/api/bookings/gym/:gymId` | GYM_ADMIN | none | `bookings[]` | V |
| Booking stats | `/admin` | GET | `/api/bookings/stats` | GYM_ADMIN | none | `stats` | V |
| Confirm / check in / cancel (admin) | `/admin/bookings` | PUT | `/api/bookings/:id/confirm`, `/check-in`, `/cancel` | GYM_ADMIN | none | ok | V |
| Mark attended (streaks) | `/admin/bookings` | POST | `/api/v1/admin/bookings/:id/attend` | GYM_ADMIN | none | ok | U (falls back to V check-in on 404) |
| Checkout quote | booking step 4 | POST | `/api/checkout/quote` | MEMBER | gymId, `packageId`, bookingType, headcount, startsAt, durationMinutes, provider?, consultation? | `data {items,total}` | V |
| Checkout (create order) | booking step 4 | POST | `/api/checkout` | MEMBER | same as quote | `data {orderId, bookingId, requiresPayment, checkoutUrl:null}` | V |
| Start payment | booking step 4, booking detail | POST | `/api/payments/initialize` | MEMBER | `bookingId` | `checkoutUrl` | V |
| Verify payment | `/payment-success\|failed\|pending` | GET | `/api/payments/verify/:txRef` | MEMBER | none | `result {localStatus, bookingStatus, expired, needsManualRefund?}` | V |
| Order detail | not used in UI | GET | `/api/orders/:id` | MEMBER | none | `order` | V |
| Member / provider sessions | `/app/sessions`, provider Sessions | GET | `/api/sessions?status=` | MEMBER, provider | none | `sessions[]` | V |
| Review a session | `/app/sessions` | POST | `/api/sessions/:id/review` | MEMBER | rating, comment? | ok | V |
| Chatbot | `/app/assistant` | POST | `/api/chatbot/messages` | MEMBER | messages[], locale? | `reply` | V |
| Complete / cancel session | provider Sessions, member Sessions | POST | `/api/v1/sessions/:id/complete`, `/cancel` | provider / member | none | ok | U |
| Provider profile (members) | booking step 2 | GET | `/api/v1/providers/:id` | MEMBER | none | profile, `packages`, `availability` | U |
| Own profile | provider/nutrition Profile | GET/PUT | `/api/v1/me/provider` | provider | bio, specializations, experienceYears, certifications, photoUrl | profile | U |
| Availability | provider Availability | GET/PUT | `/api/v1/me/availability` | TRAINER, PHYSIO | `{ availability: [{dayOfWeek, period}] }` | list | U |
| Own packages | provider Packages | GET, POST | `/api/v1/me/packages` | TRAINER, PHYSIO | name, sessionCount, price, validityDays | list | U |
| Edit / remove own package | provider Packages | PUT, DELETE | `/api/v1/me/packages/:id` | TRAINER, PHYSIO | same | ok | A (verb and path inferred from "CRUD") |
| Consultation plan | nutrition Plan | GET/PUT | `/api/v1/me/consultation-plan` | NUTRITION_CONSULTANT | price, chatDurationDays | plan | U |
| Clients | provider / nutrition Clients | GET | `/api/v1/me/clients` | provider | none | list | U (field names guessed) |
| Earnings | provider / nutrition Earnings | GET | `/api/v1/me/earnings` | provider | none | balance + ledger | U (shape guessed) |
| Request payout / history | Earnings | POST / GET | `/api/v1/me/payouts` | provider | gymId, amount | list | U |
| Admin payouts | `/admin/payouts` | GET | `/api/v1/admin/payouts?status=` | GYM_ADMIN | none | list | U |
| Pay / reject payout | `/admin/payouts` | POST | `/api/v1/admin/payouts/:id/mark-paid`, `/reject` | GYM_ADMIN | method, reference / note | ok | U |
| Chat threads and messages | Messages (all roles) | GET, POST | `/api/v1/chats`, `/chats/:id/messages`, `/chats/:id/read` | member, provider | `{ body }`; `before`, `limit` | list | U (cursor semantics assumed) |
| My stats, badges | `/app`, `/app/progress` | GET | `/api/v1/me/stats`, `/api/v1/me/badges` | MEMBER, provider | none | counters / badges | U |
| Gym streak leaderboard | `/app/progress` | GET | `/api/v1/gyms/:id/leaderboard/streaks` | MEMBER | none | list; hidden on 404 | U |

## Where the sources conflict

| Topic | `Endpoints_Full.md` (used) | Postman / V2 spec |
|---|---|---|
| Checkout package key | `packageId` | `gymPackageId` |
| Gym search name key | `name` | `q` |
| Payment init key | `bookingId` | `orderId` |
| Create booking | `slotStart`, `slotEnd` | `date`, `startTime`, `duration` |
| ID type | integer | string (cuid) |

The first three are one-line switches in `src/config/apiShape.js`. The direct "create booking" endpoint is not used: the checkout flow creates the booking.
