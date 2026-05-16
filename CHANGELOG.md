# Changelog

## v2.13.1 -- 2026-05-15 UTC

### Session-start alignment
- AGENT.md lines 14-16 updated: two-step /sessions/ navigation now instructs Claude.ai
  to read SESSIONS-INDEX.md first, extract the filename from the first field of the first
  entry (most-recent-first), then read that snapshot file in full. Fallback to directory
  scan if index is missing or filename does not resolve.
- AGENT.md session close protocol step 5 updated: now specifies filename as first field
  in SESSIONS-INDEX entry format.
- AGENT.md SESSIONS-INDEX format definition updated: FILENAME | TIMESTAMP | Posture | AI | summary.
- SESSIONS-INDEX.md migrated: filename prepended to all 45 existing entries.
- Stub file SESSION-2026-05-14-CCREVIEW-UTC.md created on main. Preserves index reference
  for Claude Code FTM UI review session whose snapshot was committed only to the stale
  worktree branch (claude/suspicious-elion-5e5663). Content captured in FTMUI snapshot.
- Known Technical Debt updated: stub file creation noted.

### One manual step remaining
User must paste new init prompt text into Claude.ai project settings.
Text is in session SESSION-2026-05-15-2240-UTC.md and the session conversation.

---

## v2.13.0 -- 2026-05-14 UTC

### FTM Bridge Phase 3 UI -- COMPLETE
- Built `/ftm-import` page (Module 17 Phase 3). All three phases of Module 17 now complete.
- New: `src/lib/ftm-import.ts` -- shared lock/log constants + isImportRunning() with 15-min stale-lock auto-clear.
- New: `src/app/api/ftm-import/route.ts` -- GET stats (persons/sources/families/events/sourced/last-imported/running) + POST trigger (spawns import script as detached child process, fire-and-forget).
- New: `src/app/api/ftm-import/status/route.ts` -- GET log content + running flag for client polling.
- New: `src/app/ftm-import/page.tsx` -- 5 stat tiles, file path input pre-filled, Run Import button, live log with auto-scroll, amber pulse while running, stats auto-refresh 800ms after exit.
- Bug fix (a4b1fca): removed `if (!cancelled)` guard from post-import fetchStats() timeout. Effect cleanup was setting cancelled=true before the 800ms timeout fired, silently blocking every stats refresh after import. Caught independently by both claude.ai and Claude Code in parallel review.
- Dashboard updated: Module 17 FTM Bridge added as COMPLETE, href /ftm-import. Dashboard now shows 13 of 17 complete.
- tsc clean. Smoke test PASSED by Claude Code: 4/4 routes, zero console errors.

### Protocol locked in
- Full tree import (synchronized .ftm file): Claude Code handles execution. Opus model. Brief in claude.ai first. Documented in AGENT.md Static Rules.

---

## v2.12.3 -- 2026-05-14 UTC

Cleanup pass: scaffold commit cherry-picked to main, dead icebreaker route deleted,
git add -A incident rolled back, .claude/ added to .gitignore, AGENT.md updated.

---

## v2.12.0 -- 2026-05-13 UTC

Research Notes panel (person detail page): migration 020 live, scaffold route, preview toggle.

---

## v2.11.0 -- 2026-05-14 UTC

Person detail page: 9 panels complete. Migration 020 (person_research_notes) live.

---

## v2.9.1 -- 2026-05-13 UTC

Module 16 bug fix: persons join used wrong column names. List page silently showing empty. Fixed in 5 files.

---

## v2.8.6 -- 2026-05-13 UTC

Modules 12 (Correspondence Log), 14 (DNA Evidence Tracker), 13 (File Naming System)
complete and smoke tested. FTM Bridge Phase 1 + Phase 2 complete.

---

## v2.8.0 -- 2026-05-11 UTC

callWithEngine() complete. 15 prompt engines live. Module 16 (Research Investigation) built. Steve Little upstream sync added.

---

## Earlier versions

See /sessions/ archive for full history.
