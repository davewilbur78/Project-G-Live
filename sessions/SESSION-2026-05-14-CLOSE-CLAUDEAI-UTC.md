--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-14 UTC
Captured by: Claude (claude.ai)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
Opened with user concern about an unclosed session and general unease about repo state.
Triaged all four May 14 snapshots, identified the actual sequence of events, and found
three concrete issues: AGENT.md had a stale "NOT YET WRITTEN" entry for migration 020,
the scaffold commit (ed2402e) was stranded on a worktree branch and had never been merged
to main, and the dead icebreaker route was still present. Claude Code executed the cleanup
pass, caught the scaffold gap before deletion, cherry-picked ed2402e, resolved the SQL
conflict, and deleted the route cleanly. A `git add -A` incident was caught immediately
and rolled back. All debt items closed. AGENT.md updated to v2.12.3.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-14 UTC
All work committed. Repo clean at 4f96cc2 (AGENT.md v2.12.3).

Key commits this session:
  6d45b00 -- AGENT.md v2.12.2: fix stale migration 020 entry
  681fad8 -- cherry-pick ed2402e (scaffold route + page.tsx cleanup) onto main
  4f2f3ea -- delete dead icebreaker route + add .claude/ to .gitignore
  5d1c423 -- rollback of bad git add -A (unstaged .claude/worktrees/ etc.)
  4f96cc2 -- AGENT.md v2.12.3: cleanup pass closed, all debt items recorded

No wip/ branch work. Nothing outstanding.

DECISIONS MADE THIS SESSION
2026-05-14 UTC -- Posture declared BUILD (rectify + build).
2026-05-14 UTC -- Triaged all May 14 sessions before touching any code. Found three
  concrete issues rather than one unclosed session.
2026-05-14 UTC -- AGENT.md contradiction (020 "NOT YET WRITTEN") fixed in v2.12.2.
2026-05-14 UTC -- Scaffold commit cherry-picked to main before icebreaker deletion;
  deleting without this would have silently broken Panel 2 on all person pages.
2026-05-14 UTC -- SQL conflict in 020 resolved: HEAD structure kept, ed2402e's
  IF NOT EXISTS guard and corrected 4-state constraint incorporated.
2026-05-14 UTC -- `git add -A` banned from both Coding Standards and Local Environment
  Rules after incident on this session. Always use specific paths.
2026-05-14 UTC -- .claude/ added to .gitignore.

OPEN THREADS -- TIMESTAMP: 2026-05-14 UTC
- FTM Bridge Phase 3 UI (/ftm-import page): next build item, ready to start.
- Full synchronized tree import: ready when .ftm file is provided.
- Vercel deployment: not started.
- Voice profile discussion: required before Module 9.
- Migration 019 (person_external_ids): deferred until synchronized tree.

PARTIALLY BUILT WORK
None. All work committed.

DO NOT DO THIS
- Do not use `git add -A`. Ever. Use specific paths only.
- Do not assume scaffold route exists without checking -- it was stranded on a
  worktree branch for an entire session before this one caught it.
- Do not delete any route that is still the only wired AI call on a page without
  first confirming its replacement is live on main.
- Do not skip the git pull at the start of a Claude Code session. Every incident
  in the past two days traces back to building on a stale base.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-14 UTC
Build FTM Bridge Phase 3 UI: /ftm-import page.
Design: trigger import, last run timestamp + record counts, diff view.
claude.ai writes it; Claude Code smoke tests it.
--- END SNAPSHOT ---
