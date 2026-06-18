# Restaurant Management App

## Working Title
TBD — to be confirmed during onboarding

## What It Is
An all-in-one operations app for restaurants. Centralises reservations and walk-in management, staff scheduling and coordination, and inventory tracking into a single tool — replacing scattered group chats, paper logs, and disconnected apps.

## The Problem It Solves
Running a restaurant involves too many moving parts managed in too many places:
- **Walk-in and reservation chaos** — no single view of bookings, covers, and wait times
- **Staff coordination friction** — shift changes and coverage gaps handled over group chat
- **Inventory blind spots** — manual counts, surprise stock-outs, and avoidable waste

## Users
Primary users are **managers and floor staff** — the people who deal with scheduling day-to-day.

| Role | Day-to-day use |
|------|----------------|
| **Manager** (primary) | Builds rotas, assigns shifts, handles swap requests, pushes schedule updates to staff |
| **Floor Staff** (primary) | Views their schedule, confirms shifts, requests changes — without needing a group chat |
| **Owner** (oversight) | Full visibility across all operations; configures the app, sets policies, reviews reports |

## Positioning
A calm, operational command centre for independent restaurants and small chains that want to run tighter without adding administrative overhead. Not a startup toy — a working tool that earns its place alongside the POS.

## Tone & Brand
Practical, warm, reliable. Speaks in restaurant-operator language, not software-team language. Mobile-first; designed for high-turnover staff with minimal training required.

## App Name
**MiCasa** — warm, personal; evokes the restaurant as the owner's house

## MVP Focus (First Feature)
**Staff scheduling** — managers build rotas, assign shifts, and push instant updates to floor staff. Floor staff see their schedule and confirm shifts without a group chat.

## Strategic Principles
- All roles (owner, manager, staff) find their daily actions within one tap
- Real-time data shared across the full operation
- Mobile-first; low training overhead for high-turnover staff
- Replace friction points (group chats, paper logs, spreadsheets) with one source of truth

## As Built (Initial Generation)
**Design system**: Terracotta `#C1440E` primary · Amber `#F5A623` accent · Cream `#FAF7F2` background · Role-coded shift colours (chef = blue, waiter = green, bar = amber, host = purple, kitchen = teal)

**App routes**:
- `/` — Dashboard: today's shifts, upcoming shifts, quick stats
- `/schedule` — Weekly rota (horizontal scroll, day columns) + list view with shift confirm/decline
- `/team` — Manager-only: add team members, assign roles, view shift counts
- `/profile` — Edit display name/phone, shift history stats, sign out

**Auth**: JWT cookies · Role-based access: `admin` (manager) vs `authenticated` (floor staff) · Default manager login: `manager@micasa.app` / `MiCasa2026!`

**Seed data**: 5 sample staff (Sofia Reyes — Chef, Marco Diaz — Waiter, Lena Park — Bar, James Obi — Host, Ana Ferreira — Kitchen) · 9 demo shifts across the current week

**Data model**: `tbl_shifts` (staff ID, role, date, start/end time, status: pending/confirmed/declined) · `tbl_staff_profiles` · `tbl_users`
