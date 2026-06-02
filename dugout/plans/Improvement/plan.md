The Hive — Full Fix Plan & Task List
Issues are grouped into logical development workstreams so a developer can tackle them feature-area by feature-area rather than jumping around. Each phase is ordered by impact and risk.

Phase 1 — Critical UX Blockers
These must ship before any public or beta release. They represent broken core interactions.

🔴 PHASE 1A — Form Validation
Every form in the app silently fails on invalid input. This needs a single shared validation solution applied consistently.
Plan:

Install react-hook-form + zod (or use the existing form state with manual validation) to manage form state and validation
Build a reusable <FormError> component that renders a red error message below any field
Apply validation to every form in the app

🔴 PHASE 1B — Delete Confirmations
All destructive delete actions happen immediately with zero friction.
Plan:

Build a single reusable <ConfirmDialog> modal component ("Are you sure?")
Wrap every Delete action across the app in this dialog

Phase 2 — High Priority Fixes
Broken UX, accessibility failures, and missing feedback.

🟠 PHASE 2A — Toast / Feedback System
No consistent success/failure feedback after any async action.
Plan:

Integrate a lightweight toast library (e.g., sonner or react-hot-toast)
Trigger toasts on: RSVP save, event create/edit/delete, announcement create/edit/delete, settings save, itinerary create/delete, supply claim/remove, member add

🟠 PHASE 2B — ARIA & Keyboard Accessibility
Several WCAG 2.1 violations present.
Plan:

Add aria-pressed to RSVP buttons
Add aria-label with counts to reaction buttons
Add aria-required to all required form inputs
Associate all form labels properly via <label htmlFor> or aria-labelledby
Add skip-to-content link
Audit and fix visible focus rings

🟠 PHASE 2C — Page Titles & Favicon
App ships with Vite boilerplate title and icon.
Plan:

Update index.html with the app name and a real favicon
Install react-helmet-async for dynamic per-route page titles

Phase 3 — Medium Priority Fixes
Polish, branding, and functional gaps.

🟡 PHASE 3A — 404 Page
Currently renders unstyled "Not Found" plain text.
Plan:

Create a styled NotFound page component matching app design
Add friendly message + "Go to My Teams" CTA button

🟡 PHASE 3B — Color Contrast
Inactive RSVP buttons and secondary labels fail WCAG AA contrast.
Plan:

Audit all grey-on-dark text combinations with WebAIM Contrast Checker
Increase text lightness for inactive button states, section headers, secondary labels

🟡 PHASE 3C — Payments Page Admin Controls
The page only shows an empty state with no admin ability to create payment records.
Plan:

Add an "Add Payment Request" button and form for Admin users
Show payment items with member, amount, due date, paid status

🟡 PHASE 3D — Sport Field in Team Creation
Sport is absent from the Create Team form but required in Settings.
Plan:

Add Sport text input (or dropdown) to the Create Team form
Pass the value to the team creation API call

🟡 PHASE 3E — Team Name Truncation
Team names truncate with ellipsis on the My Teams list at small viewports.
Plan:

Allow team name to wrap to two lines in the team card
Remove text-overflow: ellipsis / whitespace: nowrap constraints on the team card title

🟡 PHASE 3F — Event Date Missing Year
Event dates display "Wed, May 20 · 2:29 PM" without year.
Plan:

Update all date formatting utilities to always include the year
Apply to event cards, itinerary items, and supplies drawer headers

🟡 PHASE 3G — Invalid Team ID Redirect Feedback
Silent redirect when accessing an invalid/expired team link.
Plan:

Detect 404/empty data response from team loader
Show a toast or redirect to a "Team not found" intermediate screen before pushing to /teams

Phase 4 — Low Priority / Polish
Quality of life improvements and edge case coverage.

🟢 PHASE 4A — Duplicate Empty State CTAs in Itinerary
Both "+ ADD FIRST ITEM" and "+ ADD TO ITINERARY" appear simultaneously in empty state.
Plan:

Show only one CTA in the empty state
The persistent bottom button should only appear once at least one item exists

🟢 PHASE 4B — Input Character Limits
No maxlength on any text inputs.
Plan:

Define and apply maxlength values based on database column constraints
Add character counters on longer fields (Notes, Message body in announcements)

🟢 PHASE 4C — Itinerary Date Validation Against Event
Itinerary items can be set to dates completely unrelated to their parent event.
Plan:

Pre-populate itinerary item start/end with the parent event's start time as default
Add validation warning (not hard block) if time is outside the event's window

🟢 PHASE 4D — Meta Description Tag
No <meta name="description"> in index.html.
Plan:

Add a static meta description to index.html

🟢 PHASE 4E — Reaction Button Descriptive Labels
Reaction buttons read as emoji strings to screen readers with no context.
Plan:

Add dynamic aria-label to each reaction button: "React with thumbs up — 2 reactions" / "Remove thumbs up reaction"

🟢 PHASE 4F — Performance: Reduce Redundant Auth Calls
Multiple /auth/v1/user requests fire on every interaction.
Plan:

Cache the Supabase auth session in React context or Zustand store
Avoid re-fetching auth on every component mount

🟢 PHASE 4G — RSVP Success Feedback
No feedback after selecting Going / Maybe / Can't Go.
(Covered by Phase 2A toast system — listed here as a specific wire-up task)

🟢 PHASE 4H — Supplies "Remove" Should Be Admin-Only or Gated
Any user can remove any supply item (even one they didn't add).
Plan:

Restrict "Remove item" (trash icon) to admin users only, OR require the item's claimer to unclaim before removal
