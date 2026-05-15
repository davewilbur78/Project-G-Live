--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-14 UTC
Captured by: Claude Code (claude-sonnet-4-6)
Posture at capture: BUILD (cleanup pass, continued from SESSION-2026-05-14-CLEANUP-UTC)
Trigger: session close

WHAT THIS SESSION WAS DOING
Continued cleanup pass. Cherry-picked stranded commit ed2402e (scaffold route + page.tsx
fixes) onto main, deleted dead icebreaker route, fixed an accidental git add -A that
staged embedded worktrees, ran full smoke test. All cleanup tasks complete.

TASK SEQUENCE AND RESULTS

1. Cherry-pick ed2402e onto main
   One conflict: sql/020-person-research-notes.sql only.
   Conflict was a structural difference (ed2402e placed ALTER TABLE before CREATE TABLE)
   plus the stale has_conflicts value in the CHECK constraint on HEAD.
   Resolution: kept HEAD structure (person_research_notes first, then research_status),
   incorporated ed2402e's IF NOT EXISTS guard and 4-state CHECK constraint,
   removed has_conflicts from the SQL file entirely.
   Cherry-pick completed: commit 681fad8.

2. Pre-deletion verification (all three passed)
   - scaffold/route.ts: EXISTS at src/app/api/persons/[id]/scaffold/route.ts ✓
   - has_conflicts: NOT FOUND in page.tsx ✓
   - icebreaker/route.ts: still present (deleted next step) ✓

3. Icebreaker deletion
   rm src/app/api/persons/[id]/icebreaker/route.ts
   git add -A (unintentional: also staged .claude/worktrees/* as embedded repos,
   plus package-lock.json, prototypes/dashboard-mockup-v1.html, scripts/import-gedcom.js)
   Committed as afa7d83, pushed.

4. Cleanup of accidental commit
   Problem: git add -A picked up .claude/worktrees/* (embedded git repos) and three
   previously-untracked files. All added to repo unintentionally.
   Fix: added .claude/ to .gitignore, then git rm --cached on all eight items.
   Committed as 5d1c423: "fix: remove accidentally committed untracked files + add
   .claude/ to .gitignore". Pushed.
   .gitignore now explicitly excludes .claude/. Future git add -A is safe.

   LESSON: Always use specific file paths (git add <file>) instead of git add -A
   when deleting a single file. The untracked file list was known; -A was wrong here.

5. Smoke test (clean server, .next cleared)
   tsc --noEmit: CLEAN. No type errors.
   Dev server: compiled without errors.

   Route results:
     GET /persons/[id]                      HTTP 200 ✓
     GET /api/persons/[id]/scaffold         HTTP 200 ✓
       Returns { icebreaker, scaffold } -- both fields present ✓
       Values empty: ANTHROPIC_API_KEY not in smoke test shell env (expected) ✓
       Route error handling: graceful -- returns 200 with nulls, no 500 ✓
     GET /api/persons/[id]/icebreaker       HTTP 404 ✓ (route deleted)
     Page calls /scaffold not /icebreaker:  CONFIRMED (grep: line 222 of page.tsx) ✓

   Status dropdown: exactly 4 states confirmed:
     ['not_started', 'in_progress', 'complete', 'needs_archive_visit'] ✓
     has_conflicts: GONE from STATUS_CONFIG and STATUS_ORDER ✓

   Icebreaker directory: empty after route.ts deletion, removed with rmdir.
   No orphaned files remain under src/app/api/persons/[id]/.

FINAL COMMIT SEQUENCE
  681fad8  feat: research notes scaffold + markdown preview + status cleanup (cherry-pick)
  afa7d83  cleanup: merge scaffold commit + delete dead icebreaker route
  5d1c423  fix: remove accidentally committed untracked files + add .claude/ to .gitignore
  [this session snapshot + SESSIONS-INDEX update]

STATE AT CAPTURE
git repo: CLEAN. main pushed. No uncommitted changes. No staged changes.
Dead icebreaker route: DELETED.
Scaffold route: LIVE at src/app/api/persons/[id]/scaffold/route.ts.
Status dropdown: 4 states only.
sql/020-person-research-notes.sql: corrected (IF NOT EXISTS, 4 states, no has_conflicts).
.gitignore: updated (.claude/ excluded).
Dev server: STOPPED.

Person detail page panels (current state on main):
  Panel 1 - Header Anchor:      WORKS ✓
  Panel 2 - AI Icebreaker:      WIRED to scaffold route ✓ (returns empty without API key)
  Panel 3 - Research Notes:     WORKS ✓ (preview toggle, scaffold on first open)
  Panel 4 - Timeline:           WORKS ✓
  Panel 5 - Map:                CONDITIONAL (renders when geocoded addresses exist)
  Panel 6 - Family Connections: WORKS ✓
  Panel 7 - Sources:            WORKS ✓
  Panel 8 - Open To-Dos:        WORKS ✓
  Panel 9 - FAN Club:           WORKS ✓ (no association data for test person)

KNOWN OPEN ITEMS (from prior sessions, unchanged)
- /persons list page: exists, not smoke tested for content or navigation links.
- Voice profile conversation: required before Module 9 begins. Not yet had.
- AGENT.md size and OS/app split: in Known Technical Debt, not yet actioned.
- Full synchronized tree import: ready to run when .ftm file is provided.
- Vercel deployment: not started.

PARTIALLY BUILT WORK
None. All work committed and pushed.

DO NOT DO THIS
- Do not use git add -A to delete a single file. Use git add <specific-path>.
- Do not assume all commits referenced in CHANGELOG/AGENT.md are on main.
  ed2402e was documented as live for multiple sessions but was on a worktree branch.
  Always verify with: git log --oneline --all -- <file>

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-14 UTC
Cleanup pass is COMPLETE. All tasks closed.
Next options (discuss with Dave):
  a) FTM Bridge Phase 3 UI (/ftm-import page)
  b) Vercel deployment
  c) /persons list page smoke test + navigation links audit
Session posture: DISCUSS before BUILD.
--- END SNAPSHOT ---
