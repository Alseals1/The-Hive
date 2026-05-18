# Component Inventory — Dugout

Catalog of all UI components in the application.

---

## UI Primitives (shadcn/ui — do not modify)

Installed from shadcn/ui. Source in `src/components/ui/`.

| Component | Status          | Notes                 |
| --------- | --------------- | --------------------- |
| Button    | pending install | Core CTA              |
| Input     | pending install | Form fields           |
| Label     | pending install | Form labels           |
| Card      | pending install | Content containers    |
| Badge     | pending install | Role/status tags      |
| Avatar    | pending install | User photos           |
| Dialog    | pending install | Modals                |
| Sheet     | pending install | Mobile bottom drawers |
| Select    | pending install | Dropdowns             |
| Textarea  | pending install | Multi-line input      |
| Toast     | pending install | Notifications         |
| Skeleton  | pending install | Loading placeholders  |
| Tabs      | pending install | Tab navigation        |
| Separator | pending install | Dividers              |

---

## Shared Components

Reusable app-level components in `src/components/shared/`.

| Component      | Status  | Props                             | Notes                |
| -------------- | ------- | --------------------------------- | -------------------- |
| PageShell      | pending | `children`, `title?`              | Root layout wrapper  |
| BottomNav      | pending | —                                 | Mobile navigation    |
| LoadingSpinner | pending | `size?`                           | Generic loader       |
| ErrorMessage   | pending | `message`, `onRetry?`             | Error display        |
| EmptyState     | pending | `title`, `description`, `action?` | Empty list states    |
| UserAvatar     | pending | `userId`, `size?`                 | Shows profile avatar |

---

## Feature Components

### Auth

| Component  | Status  | Notes                         |
| ---------- | ------- | ----------------------------- |
| LoginForm  | pending | Email + password sign in      |
| SignupForm | pending | Email + password registration |

### Teams

| Component      | Status  | Notes                         |
| -------------- | ------- | ----------------------------- |
| TeamCard       | pending | Team summary card             |
| TeamCreateForm | pending | Create new team               |
| MemberList     | pending | Team roster list              |
| MemberRow      | pending | Single member with role badge |
| InviteLinkCard | pending | Shows/copies invite link      |
| RoleBadge      | pending | Colored badge for team role   |

### Schedule

| Component       | Status  | Notes                        |
| --------------- | ------- | ---------------------------- |
| EventList       | pending | Scrollable event list        |
| EventCard       | pending | Single event summary         |
| EventDetail     | pending | Full event view              |
| EventCreateForm | pending | Create/edit event            |
| EventTypeBadge  | pending | Game / Practice / Tournament |

### Attendance

| Component         | Status  | Notes                    |
| ----------------- | ------- | ------------------------ |
| RSVPButtons       | pending | Yes / No / Maybe buttons |
| AttendanceSummary | pending | Count of yes/no/maybe    |
| AttendanceList    | pending | Who RSVPed what          |

### Announcements

| Component              | Status  | Notes                        |
| ---------------------- | ------- | ---------------------------- |
| AnnouncementFeed       | pending | Scrollable announcement list |
| AnnouncementCard       | pending | Single announcement          |
| AnnouncementCreateForm | pending | Create announcement          |

### Walk-up Songs

| Component       | Status  | Notes                   |
| --------------- | ------- | ----------------------- |
| WalkupSongCard  | pending | Player's song display   |
| WalkupSongForm  | pending | Set/edit your song      |
| RosterWithSongs | pending | Roster with songs shown |

### Payments

| Component          | Status  | Notes                         |
| ------------------ | ------- | ----------------------------- |
| PaymentList        | pending | All payment requests          |
| PaymentCard        | pending | Single payment with status    |
| PaymentCreateForm  | pending | Admin creates payment request |
| PaymentStatusBadge | pending | Pending / Paid / Overdue      |

---

## Status Legend

- `pending` — not yet created
- `in-progress` — being built
- `complete` — built and working
- `needs-review` — built but not reviewed
