# Code walkthrough (interview notes)

Frontend for **Sitter\*** — a pet-sitting marketplace. Next.js 16 App Router, React 19, Tailwind. JavaScript only (`jsconfig.json`); there is no `tsconfig` and no `.ts` / `.tsx` source.

Talks to `NEXT_PUBLIC_API_URL` with `Authorization: Bearer <JWT>`. JWT lives in `src/lib/auth.js` (`pet-sitter-token` / `pet-sitter-user`). Axios pages also use `src/utils/jwtInterceptor.js`.

---

## Folder structure

```
src/
  app/                 App Router pages (URL = folder)
    (landingpage)/     Public home
    login/             /login → /login/owner; /login/admin
    register/          Owner or sitter signup
    auth/callback/     Google/Facebook return
    find-sitter/       Search + /find-sitter/[id]
    owner/             Profile, pets, booking wizard, history
    sitter/            Profile, booking list, calendar, payout
    messages/          Shared inbox (owner + sitter)
    admin/             Owners, sitters, reports
  components/          UI: chat/, booking/, admin/, Map.js, Navbar.js, …
  lib/                 API, auth, booking math, Stripe, Supabase OAuth, chat/notification hooks
  utils/               jwtInterceptor, date formatters, validators
```

`src/lib/api.js` is the `fetch` client. Some sitter/admin pages call axios instead (same JWT via the interceptor).

---

## Login

1. **Email** — `/login/owner` renders `LoginForm` (`src/components/LoginForm.js`).
   - `login()` in `src/lib/api.js` → `POST /api/auth/login`.
   - `saveAuth({ token, user }, persist)` in `src/lib/auth.js` (Remember me → `localStorage`, else `sessionStorage`).
   - Redirect: `user.isSitter` → `/sitter/profile`, else `/`.
2. **Admin** — `/login/admin` (`src/app/login/admin/page.js`) uses the same `login()`, then `isAdminUser()`. Non-admins are rejected. Lands on `/admin/pet-sitter`.
3. **Google / Facebook** — `SocialAuthButtons` → `signInWithOAuthProvider()` in `src/lib/supabase.js` (Supabase Auth only; **not** chat).
   - Return URL `/auth/callback` → `AuthCallbackClient`.
   - `GET /api/auth/me` with the Supabase access token.
   - 200 → `saveAuth` and enter the app; 404 → `/complete-profile`.
4. **JWT on later requests** — `apiFetch` and `jwtInterceptor` attach Bearer. Expired `exp` is dropped in `getToken()`. 401 + `"unauthorized"` / `"Unauthorized"` clears storage.

---

## Booking (owner)

1. `/find-sitter/[id]` → `PetSitterDetail`. “Book now” opens `BookingDateTimeModal` (availability from `getSitterAvailability`).
2. Valid query → `/owner/booking` (`parseBookingParams` in `src/lib/booking.js`) → `BookingFlow`.
3. `BookingFlow` loads `getSitter`, `getMyPets`, `getProfile`, and availability. Three steps:
   - `YourPetStep` — pets this sitter accepts
   - `InformationStep` — guest profile + optional message
   - `PaymentStep` — UI `"card"` vs `"cash"` (API gets `"stripe"` or `"cash"`)
4. Confirm → `createBooking()` → `POST /api/bookings`.
   - Cash → `ThankYouView`.
   - Card → `StripePaymentModal` with `clientSecret` (see Payment).
5. History: `/owner/bookings`. “Send Message” → `createConversation(sitterId)` → `/messages?id=`.

**Sitter side:** `/sitter/booking-list` (`BookingListPage`) → `GET /api/sitters/bookings`. Detail page PATCHes `/api/sitters/bookings/:id/status`:

`waiting_confirm` → `waiting_service` (or `cancelled`) → `in_service` → `success`.

Same detail page can `createConversation(ownerId)` and open chat. Calendar (`CalendarPage`) reuses `GET /api/sitters/bookings` as a week grid.

---

## Chat

Shared route `/messages` (owner and sitter). Not Socket.io, not WebSocket, not Supabase Realtime.

1. **Open a thread**
   - Navbar / sitter header → `/messages`
   - Or `createConversation(otherUserId)` from sitter booking detail, owner history, or `PetSitterDetail`
2. **Inbox** — `MessagesView` (`src/app/messages/page.js`)
   - `getConversations()` → `GET /api/conversations`
   - `?id=` → `getMessages(id)` + `markConversationRead(id)`
   - Send: optimistic bubble, then `sendMessage()` (`POST` FormData: `content` + optional `image`)
   - Photos go through `normalizeChatImage()` (HEIC → JPEG, max 2MB)
3. **Live updates** — `useChatRealtime({ enabled, onEvent })`
   - Primary: `GET /api/conversations/events` (SSE, Bearer token). Parses `data:` JSON frames.
   - Handshake `type: "connected"` is ignored.
   - `type: "message"` upserts the bubble / refreshes the list.
   - `type: "read"` is ignored in the inbox UI.
   - If SSE dies: emit `{ type: "refresh" }` every 3s so the page refetches.
4. **Unread badge** — `useUnreadChatCount` counts conversations with `unreadCount > 0`. Same SSE hook. Opening a thread fires `chat-unread-cleared` so the navbar drops immediately.

UI: `ConversationList` | `ChatThread` → `ChatBubble` + `ChatInput`.

---

## Notifications

**Not SSE.** `useNotifications` polls `GET /api/notifications` every **20 seconds**.

`NotificationBell` (Navbar: `enabled={isLoggedIn}`):

- Renders `item.title`, `item.body`, `item.href`, `item.createdAt`.
- Click → `PATCH /api/notifications/:id/read`, then `router.push(item.href)` if present.
- “Mark all” → `PATCH /api/notifications/read-all`.

This client does **not** list event types (no `booking_confirmed`, `new_message`, …). Those strings come from the backend as `title` / `body`.

---

## Map / nearby sitters

1. `/find-sitter` → `PetSitterList` → `getSitters()` (`GET /api/sitters?q&petTypes&rating&experience&page`).
2. List view paginates (5). Map view requests up to `MAP_LIMIT` (1000) and plots pins.
3. `Map` (`src/components/Map.js`) is **Leaflet** via `react-leaflet`, loaded with `dynamic(..., { ssr: false })`.
4. Coords: `getSitterCoords()` (`src/lib/sitterLocation.js`). Missing / `0,0` → Bangkok `[13.7563, 100.5018]`.
5. Clicking a pin selects that sitter (`SitterCardOverlay`). Detail page shows one pin the same way.
6. Address editing: `LocationPicker` geocodes with Nominatim and a draggable marker.

---

## Payment (Stripe)

1. Step 3 of `BookingFlow`: `PaymentStep` (card vs cash).
2. Confirm with card → `POST /api/bookings` `{ paymentMethod: "stripe" }` → `{ clientSecret, … }`.
3. `StripePaymentModal` wraps Stripe `Elements` + `PaymentElement`.
4. `stripe.confirmPayment({ redirect: "if_required" })`.
5. Owner success is `isStripePaymentAuthorized()` (`src/lib/stripePayment.js`): `requires_capture` (manual capture), `succeeded`, or `processing`.
6. Publishable key only: `getStripe()` in `src/lib/stripe.js`. Capture happens later on the server when the sitter confirms (`waiting_service`).

---

## Admin (short)

`AdminLayout` requires `isAdminUser()`. Sidebar: Pet Owner / Pet Sitter / Report.

| Page | Load | Write |
|------|------|--------|
| `/admin/pet-owner` | `getAdminOwners` | — |
| `/admin/pet-owner/[id]` | `getAdminOwner` | ban, suspend pet |
| `/admin/pet-sitter` | `GET /api/admin/sitters` | — |
| `/admin/pet-sitter/[id]` | `GET /api/admin/sitters/:id` | PATCH status (approve / reject) |
| `…/booking` | `GET …/sitters/:id/bookings` | — |
| `…/reviews` | `GET …/reviews` | PATCH approve, DELETE |
| `/admin/report` | `getReports` (filter in the browser) | — |
| `/admin/report/[id]` | `getReport` | PATCH status resolved / cancelled |

---

## How to talk about “your” pieces in an interview

Chat, navbar unread, and the notification bell are the messaging slice: REST for CRUD, **SSE** for new messages, **polling** if SSE drops, and a **20s poll** for the bell. Sitter booking list is a filtered table plus status PATCH. Admin is JWT-gated CRUD on owners, sitters, and reports. Shared flows (auth JWT, booking wizard, Leaflet map, Stripe Elements) sit under `src/lib` and `src/components/booking`.
