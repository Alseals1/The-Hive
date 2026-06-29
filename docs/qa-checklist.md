# Dugout – Manual QA Checklist

Covers the join-code, role-invite, and member-roster flows.
Run this checklist on a real device (or Chrome DevTools mobile emulation at 390×844) before each release.

---

## 1. Join Flow (via join code)

### Happy path

- [ ] Open `/join/T253QL` in a fresh incognito tab
- [ ] Page shows the team name, sport, and season (not a blank screen or spinner that never resolves)
- [ ] "Create Account & Join" and "Sign In & Join" buttons are both visible and tappable
- [ ] Tap **Create Account & Join** → redirected to `/auth/signup`
- [ ] `join_code` is present in `sessionStorage` after redirect (check DevTools → Application → Session Storage)
- [ ] Complete signup → app auto-navigates to the team's schedule page (not `/teams`)
- [ ] `join_code` is cleared from `sessionStorage` after successful join
- [ ] Return to the same join link as a now-logged-in member → app shows a "you're already on this team" message (or redirects gracefully — **currently a known bug**)

### Error paths

- [ ] Open `/join/BADCODE` → page shows "Code Invalid" heading and "Go to Login" button
- [ ] Tap "Go to Login" → navigates to `/auth/login`
- [ ] Open `/join/BADCODE` while already logged in → same "Code Invalid" state, not a crash

---

## 2. Invite Flow (via role-specific invite link)

### Happy path

- [ ] As a coach/admin, open the Roster page for a team you manage
- [ ] Tap the **Invite** (or **+**) button → bottom sheet opens titled "Invite to Team"
- [ ] Switch to the **Role Invite** tab
- [ ] Select a role (e.g., Player) and tap **Generate Invite Link**
- [ ] A unique URL of the form `/invite/<uuid>` appears along with an expiry time
- [ ] Tap **Copy Link** → link is copied to clipboard (toast or visual feedback appears)
- [ ] Open the copied link in a fresh incognito tab
- [ ] Page shows "You're Invited", team name, assigned role, and season
- [ ] If invite expires in < 24 hours, an amber warning banner is shown
- [ ] Tap **Create Account & Join** → redirected to `/auth/signup`
- [ ] `invite_token` and `invite_role` are stored in `sessionStorage`
- [ ] Complete signup → auto-navigated to the team's schedule page
- [ ] Check Roster page → new user appears with the correct role
- [ ] Open the same invite link again → "Invite Invalid" state (link already used)

### Error paths

- [ ] Open `/invite/00000000-0000-0000-0000-000000000000` (non-existent token) → "Invite Invalid" heading and "Go to Login" button visible
- [ ] Open an expired invite link → "Invite Invalid" state (verify expiry is enforced **server-side**, not just in JS)
- [ ] Tap "Go to Login" on an invalid invite → navigates to `/auth/login`

---

## 3. Expected-Member Flow (roster management)

### Happy path

- [ ] Open Roster page as a coach/admin
- [ ] Scroll to the "Expected Members" section (or find the "Add Expected Member" button)
- [ ] Tap **Add Expected Member**
- [ ] Fill in **Full Name** (required) and an optional note (e.g., "Jersey #7")
- [ ] Tap **Add Member** → entry appears in the list with "PENDING" badge
- [ ] Toast or confirmation message appears briefly
- [ ] Reload the page → entry persists
- [ ] Tap the **×** (delete) button next to the entry → entry removed after confirmation
- [ ] Reload the page → entry is gone

### Error paths

- [ ] Submit the "Add Expected Member" form with an empty name → inline validation error "Full name is required" appears; form is not submitted
- [ ] Submit with whitespace-only name (e.g., `   `) → same validation error
- [ ] Attempt to edit an existing expected member → **currently not supported** (known gap; only delete is available)

### Expected-member → real-member matching

> **Known gap**: There is currently no mechanism to link a PENDING expected member to a newly joined real member. The steps below describe the *intended* future behavior for post-MVP verification.

- [ ] A new user joins via the join code whose name matches a PENDING entry
- [ ] App prompts: "Are you or your child one of these expected members?" with a list
- [ ] User selects the matching entry → PENDING entry is removed and replaced by the real member record

---

## General Cross-Flow Checks

- [ ] All three flows work correctly on a 390×844 viewport (iPhone 14 Pro emulation)
- [ ] Back-navigation from invite/join pages does not crash the app
- [ ] Refreshing any page mid-flow does not lose the user's place or cause a blank screen
- [ ] Network requests are visible in DevTools Network tab and return 2xx or expected 4xx (no unhandled 5xx errors appear in the console)
- [ ] No JavaScript errors appear in the browser console during any flow
