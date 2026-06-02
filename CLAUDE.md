# CLAUDE.md

This file provides instructions and persistent context for Claude Code agents working in this repository.

---

# Project Overview

Dugout is a mobile-first youth sports coordination platform focused initially on baseball teams.

The product solves operational chaos for:

- baseball moms
- coaches
- team managers
- parents

Current youth sports coordination is fragmented across:

- TeamSnap
- Venmo
- GameChanger
- GroupMe
- Facebook Groups
- spreadsheets
- text messages

Dugout centralizes:

- team communication
- scheduling
- attendance
- walk-up songs list
- payments
- announcements

The product should feel:

- simple
- fun
- fast
- emotionally warm
- community-driven

This is NOT enterprise software.

Primary focus:

> Build the simplest and most delightful team coordination experience possible.

---

# MVP Scope

ONLY build these features:

1. Authentication
2. Team creation & invites
3. Scheduling
4. Attendance RSVPs
5. Announcements
6. Walk-up songs
7. Team payments

DO NOT BUILD:

- live streaming
- league analytics
- tournament brackets
- AI recaps
- recruiting
- public social feeds
- advanced stats
- marketplaces
- chat systems

Stay focused on MVP validation.

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui

## Backend

- Supabase
  - PostgreSQL
  - Auth
  - Storage
  - Realtime

## UX Rules

The app must:

- feel extremely easy to use
- require minimal onboarding
- prioritize mobile interactions
- work well outdoors
- support distracted users
- use large touch targets
- reduce cognitive load

Avoid:

- clutter
- dense dashboards
- enterprise UI
- excessive configuration
- complex onboarding

---

# Architecture

## Frontend Structure

src/
├── app/
├── routes/
├── components/
│ ├── ui/
│ └── shared/
├── features/
│ ├── auth/
│ ├── teams/
│ ├── schedule/
│ ├── attendance/
│ ├── announcements/
│ ├── walkup-songs/
│ └── payments/
├── hooks/
├── services/
├── lib/
├── types/
└── styles/

---

# Feature Architecture Rules

Each feature should contain:

- components/
- hooks/
- services/
- types/
- utils/

Example:

features/
└── schedule/
├── components/
├── hooks/
├── services/
├── types/
└── utils/

Avoid global feature coupling.

---

# Database Architecture

## Tables

### profiles

User profile information.

### teams

Team metadata.

### team_members

User-to-team relationships and roles.

### events

Practices, games, tournaments.

### attendance

RSVP statuses.

### announcements

Team communication posts.

### payments

Team dues and fundraiser tracking.

---

# Supabase Rules

Always:

- use Row Level Security
- use typed queries
- create migrations
- centralize database access logic
- validate inputs
- use optimistic UI carefully

Never:

- bypass RLS
- expose service role keys
- duplicate query logic
- place Supabase calls directly inside UI components

---

# TypeScript Rules

- Use strict typing
- Avoid `any`
- Prefer type inference when readable
- Create shared types when reused
- Prefer discriminated unions for UI state
- Keep types close to features when possible

---

# React Rules

Prefer:

- composition
- small focused components
- feature isolation
- custom hooks for business logic

Avoid:

- massive components
- deeply nested prop chains
- premature abstractions
- unnecessary global state

---

# UI Rules

Use:

- shadcn/ui primitives
- Tailwind utility classes
- consistent spacing
- clear hierarchy
- loading states
- empty states
- optimistic interactions carefully

The design should feel:

- sporty
- modern
- energetic
- warm
- playful

NOT:

- corporate
- overly minimal
- data-heavy
- admin-dashboard-like

# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## TESTING

- Use any testing tools, libraries available to the project for testing your changes
- Never assume your changes simply work, always test!
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.
