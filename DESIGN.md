# MiCasa — Design Guidelines

## Design Philosophy
Mobile-first. Warm but no-nonsense. Every screen should feel immediately understandable — no onboarding needed. Think of a well-run restaurant: calm, efficient, hospitable.

## Color Palette
- **Primary**: Deep terracotta / burnt sienna — `#C1440E` — evokes warmth, restaurants, energy
- **Primary dark**: `#8F2E06` — for pressed states, headers
- **Accent**: Warm amber — `#F5A623` — CTAs, highlights, badges
- **Background**: Off-white / cream — `#FAF7F2` — easy on the eyes in bright kitchens
- **Surface**: White `#FFFFFF` with subtle warm shadow
- **Text primary**: Dark charcoal — `#1A1A1A`
- **Text secondary**: Warm grey — `#6B6560`
- **Success**: Muted green — `#4CAF7D`
- **Warning**: Amber — `#F5A623`
- **Danger**: `#E53935`
- **Border**: `#E8E2DA`

## Typography
- **Font family**: Inter (system fallback: SF Pro, Roboto)
- **Heading 1**: 24px, 700 weight
- **Heading 2**: 20px, 600 weight
- **Heading 3**: 16px, 600 weight
- **Body**: 15px, 400 weight, 1.5 line-height
- **Small / Label**: 13px, 500 weight
- **Micro**: 11px, 400 weight (timestamps, meta)

## Elevation & Surfaces
- Cards: `box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)`
- Floating elements (modals, sheets): `box-shadow: 0 8px 32px rgba(0,0,0,0.14)`
- Bottom navigation: `box-shadow: 0 -1px 0 #E8E2DA`

## Component Style
- **Border radius**: 12px for cards, 8px for inputs/buttons, 24px for pill badges
- **Buttons**: Full-width on mobile for primary actions; height 48px; rounded 8px
- **Inputs**: 48px height, 12px padding, warm border `#E8E2DA`
- **Bottom navigation**: 5 tabs max, icon + label, active state in primary terracotta
- **Shift cards**: Colour-coded by role (e.g. chef = deep blue, waiter = green, bar = amber)
- **Avatars**: Circular, 36px default, initials fallback in terracotta

## Layout
- Max content width: 430px (mobile shell), centered on desktop
- Safe area insets respected (iOS notch / Android nav bar)
- Consistent 16px horizontal padding
- Section spacing: 24px between major blocks

## Motion
- Page transitions: 200ms ease-out slide
- Button press: 100ms scale(0.97)
- Sheet / modal entry: 300ms ease-out slide-up

## Anti-references
- No dark mode (not needed for restaurant floor use)
- No overly playful illustrations — keep it grounded
- No dense data tables — always prefer cards and lists
- No blue-toned SaaS aesthetic — this is warm hospitality, not enterprise software
