--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-14 UTC
Captured by: Claude (claude.ai)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
Session opened against AGENT.md v2.11.0. Administrative and housekeeping work before
building the person detail page. Added Known Technical Debt section to AGENT.md.
Wrote and committed migration 020. Received briefing from Claude Code that the person
detail page was already built in a parallel session, and that a git divergence had
been fully resolved. Confirmed design alignment on has_conflicts (derived, not stored).
Flagged that the v2.11.2 mandatory re-read rule was lost in the merge. Claude Code
restored it and bumped to v2.12.1.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-14 UTC
All work committed. Repo is clean at v2.12.1.
Person detail page: COMPLETE and LIVE (9 panels, smoke tested).
Migration 020: LIVE in Supabase.
Mandatory re-read rule: restored to Claude in Chrome section by Claude Code.
Protocol drift debt note: restored to Known Technical Debt section by Claude Code.
No wip/ branch work outstanding.

DECISIONS MADE THIS SESSION
2026-05-14 UTC -- Added Known Technical Debt section to AGENT.md. Logged AGENT.md
  size and OS/app separation concern. Not actioned -- just recorded.
2026-05-14 UTC -- has_conflicts confirmed as derived only, never stored.
  4 research_status states: not_started / in_progress / complete / needs_archive_visit.
2026-05-14 UTC -- On GitHub API rewrite cost: acknowledged as a real operational
  issue tied directly to the known technical debt about AGENT.md size.
2026-05-14 UTC -- On protocol drift: both AI interfaces skipped re-reading the
  Claude in Chrome section before writing plans. Mandatory re-read rule added to
  AGENT.md as a direct response. Cannot rely on the user to always catch drift.
2026-05-14 UTC -- On AGENT.md split timing: defer to a quieter FIX session with
  Claude Code. Do not restructure mid-build.

OPEN THREADS -- TIMESTAMP: 2026-05-14 UTC
- Dead icebreaker route (src/app/api/persons/[id]/icebreaker/route.ts): flagged
  for cleanup, not yet deleted.
- Voice profile conversation: required before Module 9 begins. Not yet had.
- AGENT.md size and OS/app split: in Known Technical Debt, not yet actioned.
- Full synchronized tree import: ready to run when .ftm file is provided.
- Vercel deployment: not started.

PARTIALLY BUILT WORK
None. All work committed.

DO NOT DO THIS
- Do not assume AGENT.md edits survive a merge without verification. The v2.11.2
  mandatory re-read additions were lost in Claude Code's merge and had to be restored.
  After any multi-session merge, read AGENT.md fresh and verify critical sections.
- Do not skip the mandatory re-read of the Claude in Chrome SQL Editor Notes section
  before writing any plan involving the Monaco editor or Supabase.
- Do not split AGENT.md in a hurry or mid-session. Design it carefully first.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-14 UTC
Start fresh session. Read AGENT.md v2.12.1 fresh. Declare posture.
Options: cleanup pass (dead icebreaker route), FTM Bridge Phase 3 UI, or Vercel deployment.
--- END SNAPSHOT ---
