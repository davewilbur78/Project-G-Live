--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-14 UTC
Captured by: Claude Code (claude-sonnet-4-6)
Posture at capture: BUILD (cleanup pass)
Trigger: session close

WHAT THIS SESSION WAS DOING
Cleanup pass with three declared tasks: (1) git pull and confirm latest commit,
(2) delete dead icebreaker route, (3) smoke test person detail page. Task 2 was
blocked by a previously undetected gap: the scaffold route was never merged into main.
Full smoke test completed and findings documented below.

TASK 1 -- COMPLETE
git pull executed from /Users/dave/Project-G-Live.
Branch: main. Latest commit confirmed: 6d45b00 (docs: fix AGENT.md stale migration
020 entry, bump to v2.12.2). Fast-forward merge. No conflicts.

TASK 2 -- BLOCKED (do not delete icebreaker route yet)
The dead icebreaker route (src/app/api/persons/[id]/icebreaker/route.ts) cannot be
deleted until the scaffold route is on main.

Root cause: commit ed2402e ("feat: research notes scaffold + markdown preview + status
cleanup") is stranded on worktree branch claude/affectionate-mahavira-e858dd. It was
referenced in CHANGELOG and AGENT.md as if live, but was never merged into main.

What ed2402e contains that main is missing:
  - src/app/api/persons/[id]/scaffold/route.ts (combined icebreaker+scaffold route,
    returns { icebreaker, scaffold } in one AI call)
  - Updated page.tsx:
      * has_conflicts removed from STATUS_CONFIG and STATUS_ORDER (4 states not 5)
      * /api/persons/[id]/scaffold called instead of /icebreaker
      * Markdown preview toggle added to Research Notes panel
      * First-open choice UI (Start blank / Start with AI scaffold)
      * Corrected column names throughout (birth_date not birth_date_display)

Current state on main:
  - page.tsx still calls /api/persons/[id]/icebreaker
  - icebreaker route uses stale column names (birth_date_display, death_date_display,
    event_types.name) that no longer exist in the schema
  - has_conflicts still present in the status dropdown (5 states shown, 4 stored)
  - No scaffold route, no preview toggle, no first-open choice UI

Fix required before Task 2 can proceed:
  Cherry-pick ed2402e onto main, OR rebuild the three changes directly on main:
    1. Create src/app/api/persons/[id]/scaffold/route.ts (combined AI call)
    2. Update page.tsx (remove has_conflicts, call scaffold, add preview toggle,
       add first-open choice UI, fix column names)
    3. THEN delete src/app/api/persons/[id]/icebreaker/route.ts
  Recommended: cherry-pick ed2402e -- it is a clean, self-contained commit.
  Verify no conflicts with dc3efa6 (column name fixes already on main).

TASK 3 -- SMOKE TEST RESULTS
Dev server started clean. tsc --noEmit: CLEAN (no type errors). No compilation errors.

Route availability:
  GET /persons              200  -- list page exists (src/app/persons/page.tsx)
  GET /persons/[id]         200  -- detail page compiles and renders
  GET /persons/new          200  -- create page exists

API results on Chetney C Clark (id: 2e6ecad3-f954-4991-a478-4b283d304340):
  GET /api/persons/[id]            200 PASS
    - name: Chetney C Clark
    - birth_date: 12 Sep 1926 / death_date: 13 May 2001
    - research_status: not_started
    - timeline: 25 events
    - sources: 19
    - family: 2 parents, 7 spouses, 0 children
    - todos: 0, addresses: 0

  GET /api/persons/[id]/icebreaker  404 BROKEN
    Response: {"error": "Person not found"}
    Cause: route selects birth_date_display, death_date_display, event_types.name --
    columns that were renamed. Supabase errors silently; data is null; route returns 404.
    Impact: Panel 2 (AI Icebreaker) shows nothing on every person detail page.

  GET /api/persons/[id]/research-notes  200 PASS
    Returns: {"person_id": "...", "content": ""} -- correct, no notes written yet.

Panel-by-panel status on main (inferred from API results + code inspection):
  Panel 1 - Header Anchor:        RENDERS (person data loads correctly)
  Panel 2 - AI Icebreaker:        BROKEN (icebreaker API returns 404)
  Panel 3 - Research Notes:       PARTIALLY WORKS (textarea renders; scaffold/preview
                                  toggle missing; has_conflicts in dropdown is wrong)
  Panel 4 - Timeline:             RENDERS (25 events for Chetney)
  Panel 5 - Map:                  UNKNOWN (addresses: 0 for test person; no geocoded data)
  Panel 6 - Family Connections:   RENDERS (2 parents, 7 spouses)
  Panel 7 - Sources:              RENDERS (19 sources)
  Panel 8 - Open To-Dos:         RENDERS (0 todos)
  Panel 9 - FAN Club:             UNKNOWN (no associations data tested)

/persons list page: 200 -- exists. Not tested for content or links to /persons/[id].

STATE AT CAPTURE
git repo: CLEAN. main is at 6d45b00. No uncommitted changes.
Dev server: STOPPED.
Task 2: BLOCKED pending ed2402e cherry-pick or rebuild.
Task 3: COMPLETE -- findings documented above.

DECISIONS MADE THIS SESSION
2026-05-14 UTC -- Do not delete icebreaker route until scaffold route exists on main.
  Icebreaker route is broken but it is the only AI call wired to the page.
  Deleting it without scaffold in place would make Panel 2 a hard error instead of
  a soft failure.

2026-05-14 UTC -- ed2402e must come to main before the cleanup commit can close.
  Recommended approach: cherry-pick ed2402e, verify no conflicts with dc3efa6,
  then delete icebreaker, then commit everything as one clean sequence.

OPEN THREADS -- TIMESTAMP: 2026-05-14 UTC
- BLOCKER: ed2402e not on main. Cherry-pick or rebuild required. See Task 2 above.
- Panel 2 (icebreaker) broken on all persons due to stale column names.
- has_conflicts in status dropdown (5 states shown; schema enforces 4).
- Scaffold route, preview toggle, first-open choice UI: all missing from main.
- /persons list page: exists but not smoke tested for content or navigation.
- Voice profile conversation: required before Module 9 begins. Not yet had.
- AGENT.md size and OS/app split: in Known Technical Debt, not yet actioned.
- Full synchronized tree import: ready to run when .ftm file is provided.
- Vercel deployment: not started.

PARTIALLY BUILT WORK
None stranded in this session. All findings are documentation only. No code was written
or deleted this session. Task 2 was not executed.

DO NOT DO THIS
- Do not delete the icebreaker route without the scaffold route on main.
- Do not assume commits referenced in CHANGELOG or AGENT.md are on main.
  ed2402e was documented as live but was on a worktree branch. Always verify with
  git log --oneline --all -- <file> before assuming a feature is deployed.
- Do not assume has_conflicts is gone from the UI. It is still in the status dropdown.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-14 UTC
Cherry-pick ed2402e onto main. Verify it applies cleanly over dc3efa6. Resolve any
conflicts (dc3efa6 fixed column names; ed2402e also touches page.tsx). Once scaffold
route is on main, delete icebreaker route and commit. Then re-run smoke test.
Session posture: BUILD.
--- END SNAPSHOT ---
