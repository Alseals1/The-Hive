---
name: issue-driver
description: Execute a GitHub issue from planning through implementation, testing, and GitHub updates while minimizing token usage.
---

# GitHub Issue Driver

## Objective

Complete one GitHub issue from start to finish with minimal supervision while minimizing unnecessary token usage.

---

## Workflow

### 1. Find Work

- Read the GitHub Issues.
- Select the highest-priority open issue.
- Skip issues that are:
  - Blocked
  - Already completed
  - Missing sufficient requirements
  - Assigned to someone else (unless assigned to you)

If no issue qualifies, stop.

---

### 2. Understand

Read only the files needed to understand the issue.

Avoid reading unrelated directories.

Identify:

- root cause
- affected components
- dependencies
- risks
- required tests

---

### 3. Create a Plan

Produce a concise implementation plan including:

- Files to modify
- Expected changes
- Testing strategy
- Risks

Stop here.

Wait for user approval.

Do not write code until approved.

---

### 4. Execute

After approval:

- invoke `/goal`
- continue working toward the goal
- do not stop until:
  - implementation is complete
  - blocked
  - maximum iteration count reached

Avoid unrelated improvements.

---

### 5. Testing Loop

Run the smallest relevant test suite first.

If tests fail:

1. Analyze failure
2. Fix
3. Re-run affected tests

Repeat until:

- all tests pass

or

- 10 iterations reached

Only run the full suite when necessary.

---

### 6. Quality Checks

Before finishing:

- lint
- typecheck
- formatting
- affected tests
- browser tests (if Playwright applies)

Fix any failures before continuing.

---

### 7. Git Workflow

Checkout latest main.

Create a new branch:

feature/<issue-number>-<short-description>

Commit using a descriptive message.

Push branch to GitHub.

If repository uses Pull Requests:

- create PR

Otherwise:

- leave branch pushed.

---

### 8. Finish Issue

Only after:

- implementation complete
- quality checks pass
- tests pass
- branch pushed successfully

Then:

- comment with summary
- reference commit/PR
- close the GitHub issue

---

## Token Guardrails

Always:

- read only required files
- avoid repeated searches
- avoid rereading files already loaded
- avoid explaining obvious code
- avoid rewriting unchanged files
- batch edits whenever possible
- use targeted searches instead of project-wide scans
- stop after 10 failed fix/test iterations

---

## Definition of Done

The issue is complete only when:

✓ User approved the plan

✓ Goal completed

✓ Tests passing

✓ Lint passing

✓ Typecheck passing

✓ Playwright checks pass (when applicable)

✓ Branch pushed

✓ PR created (if applicable)

✓ GitHub issue updated

✓ Final summary provided
