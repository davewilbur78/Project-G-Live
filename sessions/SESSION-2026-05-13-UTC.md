--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-13 UTC (opened); 2026-05-13 UTC (closed)
Captured by: Claude Code (claude-sonnet-4-6)
Posture at capture: BUILD (AGENT.md maintenance + session snapshot)
Trigger: continuation from prior context-limit session; finishing AGENT.md v2.8.6 updates

WHAT THIS SESSION WAS DOING

This session was a continuation of a longer session that hit context limits. The prior
session (summarized) had:
- Run git pull + reconciled diverged branches (rebase, 3 conflict rounds)
- Confirmed sql/018 already live in Supabase (API returning 200 with test data)
- Smoke-tested Module 12 (Correspondence Log): all pages 200, API confirmed live
- Smoke-tested Module 14 (DNA Evidence Tracker): all pages 200, API confirmed live
- Smoke-tested Module 13 (File Naming System): page 200, confirmed live
- Partially updated AGENT.md to v2.8.6 (version header + Module 12 smoke test done)
- MCP migrated from Docker to NPX (earlier in the longer session arc)
- Dashboard mockup created (prototypes/dashboard-mockup-v1.html)

This continuation session's job: finish the remaining AGENT.md v2.8.6 edits, commit,
and write this snapshot.

WHAT HAPPENED -- TIMELINE

1. Resumed from summary. Read AGENT.md at lines 490-530, 830-940, 220-240 to locate
   remaining edit targets.

2. Applied six remaining edits to AGENT.md:
   a. Module 14 (line 500): NOT STARTED → COMPLETE with full details
      (sql/018, 2 API routes, 3 pages, GPS note, endogamy context, smoke test passed)
   b. Module 13 (line 502): NOT STARTED → COMPLETE with full details
      (stateless generator, 1 page, smoke test passed)
   c. Repository structure (line 840): added 018-dna-tracker.sql entry
   d. Project State section: 
      - Timestamp updated to 2026-05-13 UTC
      - Build count: 10 → 12 of 16
      - Migrations: 001-017 → 001-018
   e. "What still needs to happen": removed Module 12 smoke test item,
      changed 6 → 4 modules remaining (9, 1, 11, 8)
   f. Next immediate action: updated to Module 16 functional smoke test
   g. Current version line (line 232): 2.8.5 → 2.8.6

3. Verified all edits via grep (confirmed: v2.8.6 in 2 places, 12 of 16, 001-018,
   018-dna-tracker.sql, Modules 14+13 COMPLETE, 4 modules remaining).

4. Committed: cf0ffaf "AGENT.md v2.8.6 -- Modules 12+14+13 smoke tests PASSED, 12/16"

STATE AT CAPTURE -- TIMESTAMP: 2026-05-13 UTC

App: healthy. Dev server running (no changes to code this session).
AGENT.md: v2.8.6 committed and current.
Git: clean (this snapshot + SESSIONS-INDEX update pending as next commit).

12 of 16 modules COMPLETE:
  Citation Builder (4), Case Study Builder (10), Document Analysis (5),
  Research Log (3), To-Do Tracker (15), Research Plan Builder (2),
  Source Conflict Resolver (6), Timeline Builder (7), Research Investigation (16),
  Correspondence Log (12), DNA Evidence Tracker (14), File Naming System (13)

4 modules remaining: 9 (Report Writer), 1 (GEDCOM), 11 (Family Group Sheet), 8 (FAN Club)

DECISIONS MADE THIS SESSION

No new decisions. All edits were execution of pre-decided content from prior session.

REJECTED OPTIONS / DO NOT REOPEN

Inherited from prior sessions.

OPEN THREADS -- TIMESTAMP: 2026-05-13 UTC

1. Module 16 functional smoke test: STILL PENDING -- requires human in browser.
   Steps: localhost:3000/investigation → "Open Investigation" → send message →
   confirm AI responds with investigation context loaded.
   App is in a state where this can be attempted now.

2. Voice profile discussion: PENDING -- required before Module 9 (Research Report
   Writer) can begin. User provides corpus of writing; Linguistic Profiler v3
   generates profile; stored as app-level setting.

3. Supabase seed data: 17 Singer/Springer sources from prototype -- can be done
   anytime now (smoke tests all passed).

4. Platform name decision: ongoing.

5. MCP connector (NPX mode): stable. Manager script at ~/.claude/mcp-manager.py.
   Switch commands: python3 ~/.claude/mcp-manager.py use npx|docker|http|status

6. Module 16 design: assertions table integration not yet built. Module 16 is
   functional but does not yet write to the assertions table. Logged in backlog.

7. Module 9 (Research Report Writer): blocked on voice profile discussion.
   After that: Modules 1, 11, 8 are unblocked.

PARTIALLY BUILT WORK

None.

DO NOT DO THIS

- Inherits all entries from prior sessions.
- Do not re-run sql/018 in Supabase -- it is already live (confirmed via API 200).
- Do not re-run sql/017 in Supabase -- it is already live.
- Do not start a new dev server without checking lsof -iTCP:3000 first.
- After sessions that add routes/CSS/prompts, restart dev server before browser smoke test.
- Do not rebase with --no-edit (not a valid flag for git rebase).

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-13 UTC

1. Human in browser: Module 16 functional smoke test
   - Open http://localhost:3000/investigation
   - Click "Open Investigation" (or equivalent) to create a new investigation
   - Send one message
   - Confirm AI responds with the investigation context loaded
   - If green: open thread #1 closes

2. After that: voice profile discussion (to unblock Module 9) OR pick from
   Modules 1 (GEDCOM Bridge), 11 (Family Group Sheet), 8 (FAN Club Mapper)
--- END SNAPSHOT ---
