# App Directory Rules

## Purpose

This directory contains the local WorkTrack prototype app for classroom demonstration and early prototype testing.

The app is not a production system. It is a research artifact used to test whether E-9 foreign workers can understand and complete a low-risk evidence-building workflow.

## Product Scope

Prioritize:
- Low-friction work time logging
- Daily evidence notes
- Key document storage checklist
- Report readiness feedback
- Clear next-step guidance

Do not prioritize yet:
- Real account authentication
- KLES system integration
- Legal claims submission
- Employer verification
- AI chatbot behavior
- Any backend or cloud storage

## Data Rule

All user-entered data stays in the browser through `localStorage`.

Do not add network calls, analytics, trackers, or external storage unless the project rules are updated first.

## UX Rule

The target user may face language pressure, fear of retaliation, and low trust in formal systems. Interface copy should be direct, calm, and action-oriented.

Avoid legal certainty language. Use "prepare", "record", "check", and "bring to相談/support" rather than implying that the app can guarantee a report result.

## File Structure

- `index.html`: app shell and screens
- `styles.css`: visual system and responsive layout
- `main.js`: state, navigation, local persistence, and interactions

Keep this directory dependency-free unless a real need appears.
