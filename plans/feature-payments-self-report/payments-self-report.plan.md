# Plan: Payments Self-Report Flow

**Branch**: feature/payments-self-report
**Date**: 2026-07-31

## Objective

Allow players to self-report payment by selecting a method (Venmo, Cash, Zelle), which sets status to `pending_confirmation`. Coaches can then verify or decline, completing the loop without needing to manually track verbal confirmations.

## Acceptance Criteria

1. Players see "I paid" button on pending/overdue cards (not "Mark as Paid")
2. Tapping "I paid" reveals Venmo, Cash, Zelle method selector
3. Selecting a method sets status to `pending_confirmation` and stores method in `notes`
4. `pending_confirmation` card shows "Awaiting confirmation" badge (amber), no action buttons
5. Coach summary strip shows "X Needs Verification" count in amber when > 0
6. Coach member rows for `pending_confirmation` show method label and Verify/Decline buttons
7. Verify sets status to `paid`; Decline sets status back to `pending`
8. `pending_confirmation` is excluded from the coach click-to-cycle behavior

## Technical Approach

### Database (2 migrations)
- Migration A: `ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'pending_confirmation'`
- Migration B: `ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes text`
- Apply via `npx supabase db push` from `dugout/`
- Regenerate types: `npx supabase gen types typescript --linked > src/types/database.ts`

### Types (`src/features/payments/types/index.ts`)
- `Payment` type is `Omit<Tables<"payments">, "stripe_session_id">` — after type regen, `notes` and the new enum value are automatically included
- No manual type changes needed beyond verifying the regenerated types

### Service Layer (`src/features/payments/services/payments.ts`)
- `getMyPayments` and `getTeamPayments`: derive `overdue` display status in-memory (status === 'pending' AND due_date < today)
- `updatePaymentStatus`: add optional `notes?: string` parameter, include in update payload when provided
- New `verifyPayment(id)`: sets status to 'paid', clears notes
- New `declinePayment(id)`: sets status back to 'pending', clears notes

### Hooks (`src/features/payments/hooks/usePayments.ts`)
- `useVerifyPayment(teamId)`: calls `verifyPayment()`
- `useDeclinePayment(teamId)`: calls `declinePayment()`
- `useSelfReportPayment(teamId)`: calls `updatePaymentStatus()` with `pending_confirmation` + notes

### Components
- `PaymentStatusBadge.tsx`: add `pending_confirmation` case (amber, "Pending Confirmation" label)
- `PaymentCard.tsx`: replace `canMarkPaid`/direct-pay button with "I paid" → method selector → `useSelfReportPayment`; show amber "Awaiting confirmation" when `pending_confirmation`
- `PaymentsPage.tsx`:
  - `PlayerPaymentsView`: remove `canMarkPaid` prop
  - `CoachPaymentsView`: add pending_confirmation count to summary strip; add Verify/Decline buttons on pending_confirmation rows; exclude from STATUS_CYCLE

## Implementation Steps

1. Backend Engineer: write migrations, push to DB, regenerate types, update service + hooks
2. Frontend Developer (parallel): update components using plan above
3. Run build + lint + typecheck
4. Playwright verification
5. Security Auditor + Refactor Agent review (parallel)
6. Commit, push, open PR

## Key Decisions

- **Overdue is derived client-side only**: DB stores `pending`; display layer applies overdue logic. Avoids needing a cron job or DB trigger.
- **`notes` stores the payment method**: Simple string field, no separate enum needed.
- **`pending_confirmation` excluded from STATUS_CYCLE**: Coaches cannot accidentally cycle through it; only explicit Verify/Decline actions apply.

## Risks

- `ALTER TYPE ... ADD VALUE` requires Postgres 9.1+ (Supabase satisfies this) and cannot be run inside a transaction — the migration must not be wrapped in `BEGIN/COMMIT`.
- Type regeneration must happen before Frontend Developer works on components, or they work against stale types.
