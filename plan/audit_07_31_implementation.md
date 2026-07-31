# Dugout Production Audit — Implementation Plan
**Date:** 2026-07-31  
**Source:** tasks/audit_07_31.md  
**Score before:** 58/100

---

## P0 — Release Blockers

### P0-1: Payment status mutation — no confirmation
- **File:** `dugout/src/features/payments/components/PaymentsPage.tsx`
- **Fix:** Added `pendingChange` state; row click now sets pending state; `ConfirmDialog` handles confirm/cancel
- **Status:** [x] DONE

### P0-2: Unbounded text breaks page layout
- **File:** `dugout/src/features/payments/components/PaymentsPage.tsx`
- **Fix:** Added `overflow-x-hidden` to outer container; added `truncate` to batch description `<p>`
- **Status:** [x] DONE

### P0-3: Input length validation
- **Note:** `CreatePaymentSheet.tsx` already had `maxLength={100}`; `CreateEventSheet.tsx` already had `maxLength={100}`. No changes needed.
- **Status:** [x] DONE (already in place)

---

## P1 — Functional Bugs

### P1-1: Settings Team Name — no inline validation error
- **File:** `dugout/src/features/teams/components/TeamSettingsPage.tsx`
- **Fix:** Removed `!name.trim()` from submit button `disabled` — validation now triggers on click
- **Status:** [x] DONE

### P1-2: Profile save — missing success toasts
- **File:** `dugout/src/routes/profile.tsx`
- **Fix:** Added `toast.success()` for both display name and password saves; removed stale inline status state
- **Status:** [x] DONE

### P1-3: Add Supply Item — silent validation failure
- **File:** `dugout/src/features/schedule/components/SupplySignupSection.tsx`
- **Fix:** Added `labelError` state with `FormError` display; submit button no longer disabled on empty
- **Status:** [x] DONE

### P1-4: Currency — missing thousand separators
- **Files:** `PaymentCard.tsx`, `PaymentsPage.tsx`
- **Fix:** Replaced `formatCents` with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`
- **Status:** [x] DONE

### P1-5: Duplicate "+" button on Payments
- **File:** `dugout/src/features/payments/components/PaymentsPage.tsx`
- **Fix:** Removed `action` prop from `PageHeader`; FAB is the only create trigger
- **Status:** [x] DONE

### P1-6: Event "Ends" before "Starts" — no guard
- **File:** `dugout/src/features/schedule/components/CreateEventSheet.tsx`
- **Fix:** Added `endsAt` to `CreateEventErrors`; `validate()` checks `endsAt < startsAt`; `FormError` displayed
- **Status:** [x] DONE

---

## P2 — Accessibility & UX Polish

### P2-1: Escape-to-close modals
- **Files:** `CreateEventSheet.tsx`, `CreatePaymentSheet.tsx`, `ConfirmDialog.tsx`
- **Fix:** Added `useEffect` Escape key listener to all three components
- **Status:** [x] DONE

### P2-2: Skip-to-content non-functional
- **Note:** `PageShell.tsx` already has `id="main-content"` on the `<main>` element. Already correct.
- **Status:** [x] DONE (already in place)

### P2-3: Interactive divs lack focus rings
- **Note:** Payment member rows were already `<button>` elements, not `<div>`s. Pre-existing.
- **Status:** [x] N/A

### P2-4: Dynamic placeholder for New Event title
- **File:** `dugout/src/features/schedule/components/CreateEventSheet.tsx`
- **Fix:** Placeholder now maps event type → contextual text
- **Status:** [x] DONE

### P2-5: Sport field → constrained select
- **Files:** `TeamSettingsPage.tsx`, `CreateTeamForm.tsx`
- **Fix:** Replaced freeform text inputs with native `<select>` dropdowns (7 sport options)
- **Status:** [x] DONE

### P2-6: Confirm Password placeholder
- **File:** `dugout/src/routes/profile.tsx`
- **Fix:** Changed `"••••••••"` to `"Confirm new password"`
- **Status:** [x] DONE

---

## Manual / Ops Tasks (not code)
- [ ] Purge test/injection-payload payment records from the database (`'; DROP TABLE payments; --`, `<script>alert("XSS")</script>`, "Playwright Test Payment", etc.)
- [ ] Fix bad seed data causing anomalous "Ends" date on the "vs. Thunder Hawks" event
