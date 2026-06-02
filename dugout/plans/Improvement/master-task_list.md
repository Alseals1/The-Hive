✅ MASTER TASK LIST
Copy this into Linear, Jira, Notion, or GitHub Issues. Each task has a checkbox, priority label, and acceptance criteria.

🔴 P0 — Critical (Ship-Blockers)
FORM VALIDATION

FV-01 Install react-hook-form + zod (or equivalent validation library)

Acceptance: Package is installed, a schemas/ folder is created with zod schemas for each form

FV-02 Create reusable <FieldError message /> component

Acceptance: Renders red error text below a field; accessible via aria-describedby on the input; disappears when field becomes valid

FV-03 Apply validation to "Add Event" form (Title required, Starts required)

Acceptance: Submitting with empty Title shows "Title is required"; empty Starts shows "Start date is required"; form does not submit until valid

FV-04 Apply validation to "Edit Event" form (Title required, Starts required)

Acceptance: Same as FV-03

FV-05 Apply validation to "New Post" (announcement) form (Title required, Message required)

Acceptance: Each required field shows its own inline error on submission attempt

FV-06 Apply validation to "Edit Post" form (Title required, Message required)

Acceptance: Same as FV-05

FV-07 Apply validation to "Add to Itinerary" form (Title required, Start required)

Acceptance: Inline error shown for each empty required field; form does not submit

FV-08 Apply validation to "Add Expected Member" form (Full Name required)

Acceptance: "Full name is required" error shown when submitting empty; form does not submit

FV-09 Apply validation to "Create Team" form (Team Name required)

Acceptance: "Team name is required" error shown on submit attempt; Cancel still works

FV-10 Apply validation to "Settings" form (Team Name required)

Acceptance: "Team name is required" error shown; save not triggered until valid

FV-11 Ensure focus moves to the first invalid field on failed submission

Acceptance: After a failed submit, the browser focus moves to the first field with an error

DELETE CONFIRMATIONS

DC-01 Create reusable <ConfirmDialog> component

Acceptance: Modal with title, message, "Cancel" (ghost) and "Delete" (destructive/red) buttons; closes on Cancel; calls onConfirm callback on Delete; traps focus inside modal; dismissable via Escape key

DC-02 Wrap "Delete Event" button with ConfirmDialog

Acceptance: Clicking Delete on an event shows dialog "Delete this event? This cannot be undone."; only deletes after user clicks Confirm

DC-03 Wrap "Delete Announcement" button with ConfirmDialog

Acceptance: Same pattern for news posts

DC-04 Wrap "Remove itinerary item" (trash icon) with ConfirmDialog

Acceptance: Clicking trash on itinerary item shows confirmation; only removes after confirm

DC-05 Wrap "Remove supply item" (trash icon) with ConfirmDialog

Acceptance: Clicking trash on supply item shows confirmation; only removes after confirm

🟠 P1 — High Priority
TOAST / FEEDBACK SYSTEM

TF-01 Install and configure a toast library (e.g., sonner or react-hot-toast)

Acceptance: <Toaster /> component mounted at app root; helper functions toast.success(), toast.error() available globally

TF-02 Show success/error toast after RSVP selection (Going / Maybe / Can't Go)

Acceptance: "RSVP saved" success toast on network success; "Failed to save RSVP, please try again" error toast on network failure

TF-03 Show toast after creating an event

Acceptance: "Event created" on success; "Failed to create event" on error

TF-04 Show toast after editing an event

Acceptance: "Event updated" on success; error toast on failure

TF-05 Show toast after deleting an event

Acceptance: "Event deleted" on success after confirm; error toast on failure

TF-06 Show toast after creating an announcement

Acceptance: "Post published" on success

TF-07 Show toast after editing an announcement

Acceptance: "Post updated" on success

TF-08 Show toast after deleting an announcement

Acceptance: "Post deleted" on success after confirm

TF-09 Show toast after adding itinerary item

Acceptance: "Itinerary item added" on success

TF-10 Show toast after removing itinerary item

Acceptance: "Item removed" on success after confirm

TF-11 Show toast after claiming/unclaiming a supply item

Acceptance: "Claimed!" / "Unclaimed" on success

TF-12 Show toast after removing a supply item

Acceptance: "Item removed" on success after confirm

TF-13 Show toast after adding expected roster member

Acceptance: "Member added" on success

TF-14 Replace inline "SAVED" text in Settings with a toast

Acceptance: "Settings saved" toast appears; inline "SAVED" text is removed

ARIA & KEYBOARD ACCESSIBILITY

A11Y-01 Add aria-pressed to RSVP buttons (Going, Maybe, Can't Go)

Acceptance: Selected button has aria-pressed="true", others have aria-pressed="false"; updates dynamically on selection

A11Y-02 Add aria-label with count and action context to reaction buttons

Acceptance: e.g., aria-label="React with thumbs up — 2 reactions" when not reacted; aria-label="Remove thumbs up reaction — 2 reactions" when reacted; updates dynamically

A11Y-03 Add aria-required="true" to all required form inputs

Acceptance: All inputs with required also have aria-required="true"

A11Y-04 Associate all form field labels using <label htmlFor> (not placeholder-only)

Acceptance: Every input/textarea has a visible or visually-hidden <label> element associated via htmlFor; placeholder text may remain as supplemental hint

A11Y-05 Add "Skip to main content" link as the first focusable element

Acceptance: Visually hidden by default; becomes visible on keyboard focus; href="#main-content"; <main id="main-content"> exists; pressing Enter/Space navigates focus to <main>

A11Y-06 Audit and fix focus ring visibility on all interactive elements

Acceptance: Every focusable element (buttons, links, inputs, tabs, drawers) shows a visible focus outline when focused via keyboard; outline must meet 3:1 contrast with adjacent color

A11Y-07 Ensure modal/drawer focus trap is active

Acceptance: When a drawer or modal is open, Tab cycles only through focusable elements inside it; focus does not escape to background page; Escape key closes the modal/drawer

A11Y-08 Add aria-describedby linking form inputs to their error messages

Acceptance: When a field has an error, aria-describedby on the input points to the error element's id; screen readers announce the error when the field is focused

PAGE TITLES & FAVICON

PT-01 Replace Vite default favicon with a custom app favicon

Acceptance: A new favicon.ico and/or favicon.svg is placed in /public; index.html references the new icon; browser tab shows the new icon

PT-02 Install react-helmet-async and wrap app root with <HelmetProvider>

Acceptance: Package installed; <HelmetProvider> wraps the router in main.tsx or App.tsx

PT-03 Set dynamic page title on the My Teams page

Acceptance: Browser tab shows "My Teams | The Hive"

PT-04 Set dynamic page title on the Schedule page

Acceptance: Browser tab shows "Schedule — [Team Name] | The Hive"

PT-05 Set dynamic page title on the News page

Acceptance: Browser tab shows "News — [Team Name] | The Hive"

PT-06 Set dynamic page title on the Roster page

Acceptance: Browser tab shows "Roster — [Team Name] | The Hive"

PT-07 Set dynamic page title on the Payments page

Acceptance: Browser tab shows "Payments — [Team Name] | The Hive"

PT-08 Set dynamic page title on the Settings page

Acceptance: Browser tab shows "Settings — [Team Name] | The Hive"

🟡 P2 — Medium Priority
404 PAGE

404-01 Create a styled <NotFoundPage> component matching app theme

Acceptance: Uses the same dark theme, typography, and color scheme as the rest of the app; shows app header/logo; displays a friendly "Page not found" heading; includes a CTA button "Go to My Teams" that navigates to /teams

404-02 Register <NotFoundPage> as the catch-all route in the router

Acceptance: Any route not matched by the router renders <NotFoundPage> instead of plain "Not Found" text; page title shows "Not Found | The Hive"

COLOR CONTRAST

CC-01 Fix contrast on inactive RSVP buttons ("Going", "Can't Go" when not selected)

Acceptance: Button label text meets minimum 4.5:1 contrast ratio against button background; verified with WebAIM Contrast Checker

CC-02 Fix contrast on "PAST · 1" / "UPCOMING · 1" section header labels

Acceptance: Section headers meet 4.5:1 contrast against page background

CC-03 Fix contrast on "VIEW ITINERARY" and "SUPPLIES" row labels

Acceptance: These labels meet 4.5:1 contrast ratio

CC-04 Fix contrast on "EDIT" button text on event cards

Acceptance: "EDIT" label meets contrast requirements; must remain visually less prominent than "DELETE" but still pass WCAG AA

PAYMENTS PAGE ADMIN CONTROLS

PAY-01 Design and implement an "Add Payment Request" form for Admin users

Acceptance: Admin users see an "+ Add Payment" button; form includes: Member (dropdown from roster), Description, Amount (currency), Due Date, optional notes; submits to Supabase

PAY-02 Display payment items in a list with member name, amount, due date, and paid/unpaid status

Acceptance: Each payment row shows the relevant details; Admin can mark payments as paid

PAY-03 Non-admin users see only their own payment requests and their status

Acceptance: Parents/players see only payments assigned to them; they cannot see other members' payment details

SPORT FIELD IN TEAM CREATION

SPORT-01 Add "Sport" field to the "Create A Team" form

Acceptance: Sport text input appears between Team Name and Season; value is passed to the API on creation; if left blank, defaults to empty string (same as current Settings behavior)

TEAM NAME TRUNCATION

TRUNC-01 Fix team name truncation on the My Teams list

Acceptance: Team card title wraps to a maximum of two lines rather than truncating with ellipsis; tested at 320px, 375px, and 390px viewport widths

EVENT DATE MISSING YEAR

DATE-01 Update all date formatting utilities to always include the year

Acceptance: All event dates display as "Wed, May 20, 2026 · 2:29 PM"; applies to event cards, itinerary drawer headers, supplies drawer headers

INVALID TEAM ID REDIRECT FEEDBACK

REDIRECT-01 Show a toast when redirecting away from an invalid team ID

Acceptance: When the team loader receives a null/404 response, a toast fires "Team not found" before or during redirect to /teams

🟢 P3 — Low Priority / Polish
DUPLICATE ITINERARY EMPTY STATE CTAs

ITIN-01 Remove the persistent "+ ADD TO ITINERARY" bottom button from the empty state

Acceptance: When the itinerary list is empty, only "+ ADD FIRST ITEM" is shown in the center of the drawer; the dashed-border bottom button is hidden until at least one item exists

INPUT CHARACTER LIMITS

CHAR-01 Add maxlength to the Event Title input (suggest 100 chars)
CHAR-02 Add maxlength to the Announcement Title input (suggest 100 chars)
CHAR-03 Add maxlength to the Announcement Message textarea (suggest 5000 chars) with a live character counter
CHAR-04 Add maxlength to the Itinerary item title input (suggest 100 chars)
CHAR-05 Add maxlength to the Team Name input (suggest 80 chars)
CHAR-06 Add maxlength to the Event Notes / Location fields (suggest 500 chars)

All CHAR tasks acceptance: Input rejects characters beyond the limit; character counter appears for fields > 200 chars, turning red when within 20 chars of limit

ITINERARY DATE VALIDATION

ITIN-02 Pre-populate itinerary item Start with the parent event's start datetime as default

Acceptance: When the "Add to Itinerary" form opens, the Start field is pre-filled with the event's start time

ITIN-03 Show a soft warning when itinerary item time falls outside the event's window

Acceptance: If user changes time to be outside the event start/end range, a yellow warning message appears ("This time is outside the event window") but does not block submission

META DESCRIPTION

META-01 Add <meta name="description"> to index.html

Acceptance: <meta name="description" content="The Hive — Team management for coaches, parents, and players."> exists in document head

REACTION BUTTON LABELS

REACT-01 Add dynamic aria-label to all 5 reaction buttons on each announcement

Acceptance: Labels follow the pattern "React with [emoji name] — [N] reactions" / "Remove [emoji name] reaction — [N] reactions"; updates when counts change

SUPPLIES REMOVE GATE

SUPPLY-01 Restrict supply item "Remove" (trash) to Admin users only

Acceptance: Non-admin users do not see the trash icon on supply items; only admin users can permanently remove supply items from the list

RSVP SUCCESS FEEDBACK
(Covered by TF-02 in the Toast system — ensure wire-up is complete)

RSVP-01 Confirm RSVP toast is wired and tested

Acceptance: Selecting Going / Maybe / Can't Go shows a brief success toast; network error shows error toast

⚙️ PERFORMANCE

PERF-01 Cache Supabase auth session in React context / global store

Acceptance: The /auth/v1/user endpoint is called at most once per session (on app load); subsequent page navigations within the app do not trigger new auth fetch calls

PERF-02 Lazy-load the Itinerary and Supplies drawer content

Acceptance: The data for itinerary items and supply items is only fetched when the user opens the respective drawer, not on schedule page load

🎨 NICE-TO-HAVE / FUTURE ENHANCEMENTS

NTH-01 Add an "Undo" option to delete actions (5-second dismissable toast with "Undo" button) as an alternative to or in addition to confirmation dialogs
NTH-02 Add a Sport dropdown/autocomplete with common sports rather than free-text
NTH-03 Add pull-to-refresh on mobile for schedule, news, and roster pages
NTH-04 Add empty state illustration/icon to the Payments "No payments due." page
NTH-05 Add loading skeleton screens instead of spinner for schedule and news pages
NTH-06 Add a "Copy to Clipboard" fallback message/toast when the "Copy Link" button is clicked in the invite modal
NTH-07 Add pagination or infinite scroll to the News page if announcement count grows large
NTH-08 Allow users to view who reacted to each announcement (reaction tooltip or modal on click)
NTH-09 Add a "Reset to Going" option if a user has RSVPed and wants to clear their selection
NTH-10 Make the Roster list members clickable to view a profile card with their role and player info
