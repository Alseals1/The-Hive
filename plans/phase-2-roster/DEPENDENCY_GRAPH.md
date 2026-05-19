# Roster Feature - Dependency Graph & Critical Path Analysis

**Date**: May 18, 2026  
**Total Estimated Time**: 12–18 hours (ideal: 10–12 hours with parallelization)  
**Team Size Assumption**: 2 developers (backend-focused + frontend-focused)

---

## Executive Summary

The roster feature has **clear sequential constraints** in the data layer (types → service → hook) but **significant parallelization opportunities** in UI component development. With proper task allocation:

- **Critical Path**: 9–10.5 hours (Types → Service → Hook → Page → List → Card → Polish)
- **Parallel Streams**: 2–3 developers can save **3–5 hours**
- **Key Bottleneck**: Service layer implementation (foundational for all UI)
- **Quick Wins**: Route setup, type definitions (independent early wins)

---

## Dependency Graph (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           ROSTER FEATURE TASK GRAPH                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: FOUNDATION (Sequential Core)
═════════════════════════════════════════════════════════════════════════════════════════

    ┌──────────────┐
    │ 1. Types     │  (1h)
    │ RosterMember │──────┐
    │ RosterSection│      │
    └──────────────┘      │
                          ▼
    ┌──────────────────────────────────┐
    │ 2. Service Layer                 │  (1.5h)
    │ fetchRosterWithProfiles()        │◄─────── CRITICAL DEPENDENCY
    │ Error handling, RLS validation   │
    └──────────────────────────────────┘
                          │
                          ▼
    ┌──────────────────────────────────┐
    │ 3. Hook (useRoster)              │  (1h)
    │ TanStack Query, caching config   │◄─────── CRITICAL DEPENDENCY
    │ staleTime: 5min                  │
    └──────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
┌─────────────────────┐   ┌──────────────────────┐
│ 4. Route Setup      │   │ Existing (PageShell, │
│ roster.tsx route    │   │ LoadingSpinner, etc) │
│ (0.5h)              │   │ (✓ no work needed)   │
└─────────────────────┘   └──────────────────────┘


PHASE 2: UI COMPONENTS (Parallelizable After Hook Ready)
═════════════════════════════════════════════════════════════════════════════════════════

                    ┌──────────────────────────────────────────────────┐
                    │         ALL depend on: Types + Hook              │
                    └──────────────────────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
    ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │ 5. RosterPage    │   │ 6. RosterList    │   │ 11. Error State  │
    │ (1.5h)           │   │ (1.5h)           │   │ (1h)             │
    │ Layout, states   │   │ Role grouping    │   │ Messages, retry  │
    └──────────────────┘   └──────────────────┘   └──────────────────┘
            │                       │                       │
            │ (dependency)          │ (dependency)          │ (dependency)
            └───────────────────────┼───────────────────────┘
                                    │
                                    ▼
    ┌──────────────────────────────────────────┐
    │ 7. RosterGrid & RosterMemberCard         │  (2h)
    │ Grid layout, avatar, badge, touch targets│◄─────── DEPENDS ON: Page + List
    └──────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ 8. Styling & │ │ 10. Loading  │ │ 9. Bottom    │
    │ Responsive   │ │ Skeleton     │ │ Nav Integ.   │
    │ (1.5h)       │ │ (1h)         │ │ (1h)         │
    └──────────────┘ └──────────────┘ └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
    ┌──────────────────────────────────────────┐
    │ 12. E2E Testing                          │  (1–1.5h)
    │ Permission checks, state transitions     │◄─────── DEPENDS ON: All UI complete
    └──────────────────────────────────────────┘
                          │
                          ▼
    ┌──────────────────────────────────────────┐
    │ 13. Performance Optimization             │  (0.5h)
    │ Lazy-load avatars, query optimization   │◄─────── OPTIONAL / PARALLEL
    └──────────────────────────────────────────┘

```

---

## Critical Path Analysis

### Critical Path (Longest Dependency Chain)

```
1. Types (1h)
   ↓
2. Service Layer (1.5h)
   ↓
3. Hook (1h)
   ↓
5. RosterPage (1.5h)
   ↓
7. RosterGrid & Card (2h)
   ↓
8. Styling & Responsive (1.5h)
   ↓
12. E2E Testing (1.5h)
   ↓
13. Performance Optimization (0.5h)

───────────────────────
CRITICAL PATH TOTAL: 10.5 hours
───────────────────────
```

### Non-Critical Path Tasks (Can Parallel)

These tasks have slack and can be done while critical path items are in progress:

| Task | Duration | After | Before | Slack |
|------|----------|-------|--------|-------|
| 4. Route Setup | 0.5h | Types | Page | Can start immediately |
| 6. RosterList | 1.5h | Hook | Card | 2h of slack (not on critical path) |
| 9. Bottom Nav Integ. | 1h | Page | Testing | 2.5h of slack |
| 10. Loading Skeleton | 1h | Grid/Card | Testing | 1h of slack |
| 11. Error State | 1h | Page | Testing | 1h of slack |

**Total Non-Critical Tasks**: 5.5 hours  
**Total With Parallelization**: 10.5h (critical) + concurrent non-critical = **~10.5 hours total**

---

## Parallel Work Streams (2-Developer Team)

### Stream A: Backend + Foundation (Developer 1 - Backend/Data Focus)
**Ownership**: Data layer & foundational queries  
**Duration**: 4–5 hours (sequential, then blocked until UI needs finalization)

```
1. Create Types (1h)                          ▲
   └─ 2. Service Layer (1.5h)                 │
      └─ 3. Hook (1h)                         │ CRITICAL PATH
         └─ Ready for UI! (1.5h idle time)    ▼
```

**Task Flow for Dev1**:
1. Define types (`RosterMember`, `RosterSection`, role enum)
2. Write service layer with Supabase queries + RLS validation
3. Build `useRoster()` hook with TanStack Query config
4. **Then switch to**: Testing, optimization, E2E support

### Stream B: Frontend + UI (Developer 2 - Frontend Focus)
**Ownership**: UI components, routing, styling  
**Overlap Window**: Start after hook is ready (−1.5h delay)

```
4. Route Setup (0.5h) ────────────┐
                                  │
5. RosterPage (1.5h) ◄─ WAIT FOR HOOK
   ├─ 6. RosterList (1.5h)  PARALLEL
   │  └─ 7. Card & Grid (2h)  DEPENDS
   │
   ├─ 10. Loading Skeleton (1h)  PARALLEL
   └─ 11. Error State (1h)  PARALLEL

8. Styling & Responsive (1.5h)
9. Bottom Nav Integration (1h)
```

**Task Flow for Dev2**:
1. While waiting for hook: Set up route file, study PageShell component, plan component hierarchy
2. Once hook ready: Build RosterPage, RosterList, Card in sequence
3. **Parallel tracks** (non-blocking): Loading skeleton, error states, styling
4. Final: Bottom nav integration, polish

---

## Sequential vs. Parallel Dependencies

### **Strictly Sequential** (Must Block)
```
Types → Service → Hook  (3 hrs)
        ↓
    Components  (builds on hook data structure)
        ↓
    E2E Testing  (needs all components)
```

### **Can Parallelize** (No Dependency)
```
Dev1: Types + Service + Hook          [3 hrs]
Dev2: Route Setup (0.5h)               [parallel, non-blocking]
Dev2: RosterPage (1.5h)                [after hook, in parallel with Dev1 testing]
Dev1 + Dev2: Styling (1.5h)            [parallel, non-blocking to Card)
```

### **Weakly Dependent** (Can Start Early, Refine Later)
```
RosterList (1.5h)  ← Can write with types, refine after Card design
Loading Skeleton (1h)  ← Can sketch UI, implement after RosterGrid finalized
Error State (1h)  ← Generic, can build independently
```

---

## Blocking vs. Non-Blocking Dependencies

### **Blocking Dependencies** ⛔ (Critical Path)
Must complete before downstream tasks can proceed:

| Upstream | Downstream | Hours Blocked |
|----------|-----------|---|
| Types | Service, Hook, Components | 1h |
| Service Layer | Hook, Queries | 1.5h |
| Hook | RosterPage, RosterList | 1h |
| RosterPage | Bottom Nav, E2E | 1.5h |
| RosterGrid/Card | Styling, Testing | 2h |

### **Non-Blocking Dependencies** ✓ (Can Be Parallel)
Can happen independently or out of order:

| Task | Why Non-Blocking |
|------|---|
| Route Setup | Just a file addition, no data dependencies |
| Loading Skeleton | UI-only, doesn't need final Card design |
| Error State | Isolated component logic, reusable across features |
| Styling & Responsive | Can iterate on existing components |
| Bottom Nav Integration | Only needs RosterPage URL + label |
| Performance Optimization | Can be deferred or done while testing runs |

---

## Developer Allocation Strategy

### **2-Developer Team (Recommended)**

**Developer 1 (Backend/Full-Stack)**
- Hours 0–4.5: Foundation (Types, Service, Hook)
- Hours 4.5–6: Testing + Optimization setup
- Hours 6–10.5: E2E testing + debugging
- Total: ~10.5 hours

**Developer 2 (Frontend)**
- Hours 0–1: Route setup + component planning
- Hours 1.5–4: RosterPage + RosterList (wait for hook)
- Hours 4–8: RosterGrid + Card + Styling (parallel with Dev1 testing)
- Hours 8–10.5: Polish + Bottom Nav + Testing
- Total: ~10.5 hours

**Overlap/Handoff**: ~1–2 hours (Dev1 finished hook, Dev2 ready to use it)

### **3-Developer Team (If Available)**

**Dev 1 (Backend)**: Types → Service → Hook (4–5h)  
**Dev 2 (Frontend - UI)**: RosterPage → RosterList → Card → Styling (6–7h)  
**Dev 3 (Frontend - Polish)**: Route setup → Loading/Error states → Bottom Nav → Testing (3–4h)

**Parallelization Gain**: Saves **2–3 hours** (work done in parallel)

### **Solo Developer (Sequential)**

Follow critical path strictly:
1. Types (1h) → Service (1.5h) → Hook (1h) → Page (1.5h) → List (1.5h) → Card (2h) → Styling (1.5h) → Polish (1h)
2. Total: **12–14 hours** (no parallelization)

---

## Time Estimates with Parallelization

### Scenario A: 2 Developers (Optimal)
```
Timeline:
├─ Hours 0–4.5:   Dev1 on foundation (Types, Service, Hook)
│                 Dev2 on route setup + planning
├─ Hours 4.5–8:   Dev1 on testing + optimization
│                 Dev2 on RosterPage, List, Card (using hook from Dev1)
├─ Hours 8–10.5:  Both on polish, E2E, bottom nav
│
Total Wall-Clock Time: ~10.5 hours
Efficiency: 21 developer-hours / 10.5 wall time = 2.0x parallelization
```

### Scenario B: 1 Developer (Sequential)
```
Timeline:
├─ Hour 0–1:      Types
├─ Hour 1–2.5:    Service Layer
├─ Hour 2.5–3.5:  Hook
├─ Hour 3.5–5:    RosterPage + Route
├─ Hour 5–6.5:    RosterList + Loading
├─ Hour 6.5–8.5:  RosterGrid + Card
├─ Hour 8.5–10:   Styling + Bottom Nav
├─ Hour 10–12:    E2E + Polish
│
Total Wall-Clock Time: ~12–14 hours
```

### Scenario C: 3 Developers (Maximum Parallelization)
```
Timeline:
├─ Hours 0–4.5:   All 3 start simultaneously
│                 Dev1: Types + Service + Hook
│                 Dev2: RosterPage + RosterList + Card
│                 Dev3: Route + Styling + Loading skeleton
├─ Hours 4.5–8:   Dev1 on testing + optimization
│                 Dev2 + Dev3 on polish + final integration
│
Total Wall-Clock Time: ~8–9 hours
Efficiency: 26 developer-hours / 8.5 wall time = 3.1x parallelization
```

---

## Critical Path Gantt (Text Format)

```
Task                          Duration   Dev1  Dev2  Day 1   Day 2
─────────────────────────────────────────────────────────────────────
1. Types                      1h         ██                 
2. Service Layer              1.5h       ███                
3. Hook                       1h         ██                 
4. Route Setup                0.5h             █      
5. RosterPage                 1.5h            ███    
6. RosterList                 1.5h            ███    
7. RosterGrid & Card          2h              ██████
8. Styling & Responsive       1.5h            ███████
9. Bottom Nav Integration     1h              ███    
10. Loading Skeleton          1h             ██
11. Error State               1h             ██
12. E2E Testing               1.5h       ███
13. Performance Optim.        0.5h       ██

Legend: ██ = active work, blocks = parallel, █ = waiting
```

---

## Recommendations for Scheduling

### **Week 1 (Day 1–2): Execution Plan**

| Time | Developer 1 | Developer 2 |
|------|---|---|
| **Morning** | Types definition | Review plan, set up development environment |
| **Mid-Morning** | Service layer implementation | Coordinate type finalization |
| **Afternoon** | Hook implementation + initial testing | Route setup + component architecture |
| **End of Day** | Push types + service + hook to branch | Prepare to integrate hook |

### **Week 1 (Day 2): Integration & Parallel Work**

| Time | Developer 1 | Developer 2 |
|---|---|---|
| **Morning** | Code review, RLS validation testing | RosterPage + RosterList implementation |
| **Afternoon** | Performance optimization baseline | RosterGrid + RosterMemberCard |
| **Late Afternoon** | E2E test setup | Styling + responsive refinement |

### **Week 1 (Day 3): Polish & Completion**

| Time | Developer 1 | Developer 2 |
|---|---|---|
| **Morning** | Full E2E testing | Bottom Nav integration + loading states |
| **Afternoon** | Debug + final optimizations | Error state UX polish |
| **End of Day** | Merge to main | Launch! 🚀 |

---

## Risks to Parallel Development

| Risk | Mitigation |
|------|-----------|
| **Dev2 blocked waiting for hook** | Dev1 provides stub/interface early; Dev2 can mock useRoster in parallel |
| **Type changes after service built** | Use TypeScript interfaces; strict types from start; code review early |
| **Merge conflicts on shared files** | Use feature branches; clear ownership (Dev1: `/features/roster/services`, Dev2: `/features/roster/components`) |
| **RLS issues caught late** | Dev1 writes integration tests for RLS immediately after service layer |
| **Mobile UX bugs in polish phase** | Test on device early; don't defer to late stage |

---

## Success Metrics

### On Critical Path (Must Not Exceed)
- [ ] Types: ≤1h
- [ ] Service Layer: ≤1.5h
- [ ] Hook: ≤1h
- [ ] RosterPage: ≤1.5h
- [ ] RosterGrid/Card: ≤2h
- [ ] E2E Testing: ≤1.5h

### Parallelization Success
- [ ] Wall-clock time ≤10.5h (vs. 14h sequential)
- [ ] No developer blocked >30min waiting for dependencies
- [ ] Code review turnaround <1h between streams

### Quality Gates
- [ ] TypeScript strict mode: 0 `any` types
- [ ] RLS tests pass for all 5 roles
- [ ] Mobile UX tested on 3+ device sizes
- [ ] Lighthouse performance ≥90
- [ ] <2s load time with fresh cache

---

## Deliverables Checklist

### Phase 1 Deliverables (Dev 1)
- [x] `src/features/roster/types/index.ts`
- [x] `src/features/roster/services/roster.ts`
- [x] `src/features/roster/hooks/useRoster.ts`
- [x] RLS validation tests

### Phase 2 Deliverables (Dev 2)
- [x] `src/routes/teams/$teamId/roster.tsx`
- [x] `src/features/roster/components/RosterPage.tsx`
- [x] `src/features/roster/components/RosterList.tsx`
- [x] `src/features/roster/components/RosterGrid.tsx`
- [x] `src/features/roster/components/RosterMemberCard.tsx`
- [x] `src/features/roster/components/RosterSectionHeader.tsx`

### Phase 3 Deliverables (Both)
- [x] Loading skeleton + error states
- [x] E2E tests (`roster.spec.ts`)
- [x] Bottom nav integration
- [x] Performance benchmarks
- [x] Mobile device testing report

---

## Next Steps

1. **Assign developers** to streams (Dev1: backend, Dev2: frontend)
2. **Start Foundation phase** immediately (Types → Service → Hook)
3. **Dev2 starts route setup** while Dev1 builds foundation
4. **Handoff hook** to Dev2 at ~4–4.5 hour mark
5. **Sync daily** on: blockers, type changes, integration points
6. **Code review** on: service layer (security/RLS), components (mobile UX)
7. **Merge to main** after E2E testing passes

---

## Appendix: Dependency Matrix

| Task | Depends On | Blocks | Duration | Dev |
|------|----------|--------|----------|-----|
| 1. Types | — | Service, Hook | 1h | 1 |
| 2. Service | Types | Hook, Tests | 1.5h | 1 |
| 3. Hook | Service | Page, List | 1h | 1 |
| 4. Route | Types | Page | 0.5h | 2 |
| 5. Page | Hook, Route | Bottom Nav, E2E | 1.5h | 2 |
| 6. List | Hook, Types | Card | 1.5h | 2 |
| 7. Card | Page, List | Styling | 2h | 2 |
| 8. Styling | Card | E2E | 1.5h | 2 |
| 9. Bottom Nav | Page | E2E | 1h | 2 |
| 10. Skeleton | Card | E2E | 1h | 2 |
| 11. Error | Page | E2E | 1h | 2 |
| 12. E2E | Card, Styling | — | 1.5h | 1,2 |
| 13. Optimization | All UI | — | 0.5h | 1,2 |

