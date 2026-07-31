# Dugout — Production Readiness Audit

## Executive Summary

Dugout (team management app for youth/rec sports) has a clean, mobile-first UI with a simple 5-tab structure (Schedule, News, Roster, Payments, Settings) that a first-time user can generally navigate without instruction. Core flows — RSVP to events, post announcements, manage roster, create payments — work end-to-end, return clear success toasts, and use confirmation dialogs before destructive actions. However, testing surfaced one critical data-integrity bug (payment status can be silently changed by a single click, with no way back), one critical rendering bug (unbounded text breaks page layout and causes horizontal scroll on mobile), and clear evidence that unsanitized test/attack-payload data (SQL injection strings, XSS payloads, "Constraint Test," "Playwright Test Payment") is currently visible in what looks like a live team's payment ledger. There are also real accessibility gaps (no Escape-to-close, no visible keyboard focus on buttons, non-functional skip link) and inconsistent validation/feedback patterns between the Settings/Profile pages and the rest of the app. This is not yet safe to ship to real users, particularly to a non-technical or elderly audience managing real money.

## Critical Issues

**1. Payment status changes with a single accidental click, no confirmation, no way back to "Paid"**
Severity: Critical. On the Payments tab, the entire member row (not just the chevron) is a click target that cycles the payment status (Paid → Overdue → Waived → Overdue → Waived…). There is no confirmation dialog, and once moved off "Paid," the cycle never returns to "Paid" — the only remaining states are Overdue/Waived. Repro: Payments tab → click any member row under a payment (e.g., "Team Equipment Fund" → Alandis Seals · Paid). Status flips immediately and the "Total Paid" counter updates. This is real financial-record data with no undo, which is especially dangerous for elderly or unfamiliar users who could misclick while scrolling.

**2. Unbounded text breaks page layout / causes horizontal scroll (mobile and desktop)**
Severity: Critical. A payment titled with ~100 repeated "A" characters is not truncated or wrapped, forcing the entire page (including the header and bottom nav) into horizontal scroll on both desktop and a 390px mobile viewport. Repro: Payments tab → scroll to the "AAAAA…" entry → swipe/scroll right. Nav bar and headings shift off-screen. Any user-generated title without a length cap can reproduce this.

**3. Unsanitized test/attack payloads visible as live data**
Severity: Critical (data hygiene / trust). The Payments list contains entries titled `'; DROP TABLE payments; --`, `<script>alert("XSS")</script>` (appears twice), "Constraint Test," "Duplicate Test Payment," "Massive Amount Test," and "Playwright Test Payment," all rendered as real, visible payment records with real member names attached. Note: the XSS payload rendered as literal text rather than executing, and the SQL string was stored/displayed as plain text — both suggest the backend is not directly vulnerable (React escaping + parameterized queries appear to be working correctly). But the presence of this data in what an end user would perceive as their team's real ledger, with no apparent input-length or content validation preventing it, is a serious production-readiness and trust problem. It also indicates this "test" team account is shared/live with other automated testing running concurrently (data changed mid-session).

## Functional Bugs

- Settings → Team Name is a required field, but submitting the form empty shows no error message at all (button just sits in a disabled-looking state) — every other form in the app (Add Event, New Post, Add Supply, Sign Up, Login) shows a clear red inline error in this situation. Repro: Settings tab → clear Team Name → Save Changes.
- Settings "Save Changes" and Profile "Save Name" produce no success toast/confirmation, even though the save does succeed (verified via reload). Every other write action in the app (RSVP, add supply, create event, post announcement, roster changes) shows a green confirmation toast.
- Editing the "vs. Thunder Hawks" game shows an "Ends" field pre-filled to 11/17/2026 for an event that starts 8/5/2026 — a ~3.5 month event duration for a single game, indicating either bad seed data or a default-value bug in the edit form.
- Tournament itinerary ("Summer Slam Invitational") allows two itinerary items ("vs Eagle" and "vs Winner Game 2") at the identical 8:00 AM time slot with no conflict warning.
- Currency amounts are not formatted with thousand separators ($1000000.00, $9999999.99), hurting readability at a glance.

## UX Improvements

- The Payments row click target doubles as both "view/navigate" (chevron) and "cycle status" (whole row) with no visual distinction — this ambiguity is what causes the critical status-mutation bug above; a single row should not silently mutate financial state.
- Header "+" icon and floating "+" button on the Payments page open the exact identical "New Payment" modal — redundant controls competing for attention on one screen.
- "Add Supply Item" is the only "add" form in the app that gives no inline validation message on an empty required-field submit; it just does nothing visibly on click.
- "Sport" on Team Settings/Create Team is freeform text rather than a constrained choice, inviting inconsistent/typo'd values ("Softball" vs "softball" vs "Soft ball") across teams.
- "Add expected member" on Roster gives no success toast, unlike removing a member which does.

## UI Improvements

- Long unbounded strings (see Critical #2) need truncation/wrapping at the component level; this is a layout-integrity gap, not just a cosmetic one.
- "New Event" title field placeholder always reads "vs. Eagles" regardless of the selected Event Type (Practice/Tournament/Other), which reads oddly when Practice/Other is selected.
- Profile page "Confirm Password" field placeholder renders as masked dots instead of descriptive guidance text, inconsistent with "New Password" which has a helpful placeholder ("Minimum 8 characters").
- Team creation uses a full-page flow while nearly every other "add" action in the app (events, posts, supplies, payments, roster invites) uses a bottom-sheet modal — an inconsistent interaction pattern.

## Accessibility Findings

- Pressing Escape does not close any modal tested (confirmed on Add Event) — standard keyboard-dismissal behavior is missing app-wide.
- Buttons receive keyboard focus (confirmed via Tab order) but show no visible focus ring/outline, while text inputs do show a clear orange focus ring. Keyboard-only users cannot tell which button is focused before pressing Enter.
- A "Skip to content" link exists in the DOM but is not reachable by keyboard — the first Tab stop from page load lands directly on the "My Teams" link, meaning the skip-navigation feature is non-functional in practice.
- Status pills (Paid/Pending/Overdue/Waived/Verify) correctly pair color with text labels, which is good for colorblind users.
- Form field labels and required-field asterisks are present and consistently styled where validation works correctly (Login, Sign Up, Add Event, New Post).

## Performance Findings

- No console errors were observed across the full session (auth, schedule, news, roster, payments, settings).
- No noticeable input lag, flicker, or layout shift during normal navigation; modals and toasts animate smoothly.
- The horizontal-overflow bug (Critical #2) is a real, reproducible rendering/layout defect rather than a transient performance issue.

## Production Readiness Score: 58/100

Core flows function and the visual design is coherent, but a critical, confirmation-less financial data-mutation bug, a layout-breaking rendering bug, and visibly unsanitized test/attack data in the payments ledger are release blockers on their own, compounded by real (not cosmetic) keyboard-accessibility gaps.

## Top 10 Improvements Before Release

1. Fix the Payments row click behavior so viewing details and changing payment status are separate, explicit, confirmed actions.
2. Truncate/wrap all user-generated text fields (titles, notes) to prevent layout-breaking overflow.
3. Purge all test/injection-payload payment records from any account before real users see it; add server-side input length/content validation.
4. Add Escape-to-close and visible focus rings to all modals and interactive controls app-wide.
5. Make the skip-to-content link actually keyboard-reachable.
6. Add inline validation feedback to the Settings Team Name form and the Add Supply Item form.
7. Add success toasts to Settings "Save Changes" and Profile "Save Name."
8. Format currency values with thousand separators and sane input caps.
9. Remove the duplicate "add payment" entry point on the Payments page.
10. Investigate and fix the anomalous auto-filled "Ends" date on the Edit Event form.
