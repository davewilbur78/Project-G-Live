--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-12 (dinner session) UTC
Captured by: Claude (claude-sonnet-4-6)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
Built Module 12 (Correspondence Log) from scratch while user was at dinner.
MCP connector went down twice during the session (Docker restarts). Code was
staged locally and pushed once the connector recovered after a Claude Desktop restart.
SQL migration run in Supabase via Claude in Chrome using Monaco setValue() + Run button.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-12 (dinner session) UTC
All committed to main. Migration 017 live in Supabase.
Module 16 smoke test confirmed passed (user confirmed before dinner).
Dev server status unknown -- git pull required before next session.

DECISIONS MADE THIS SESSION
Module 12 selected as build target: largely standalone, prerequisites met (Citation Builder
complete), clean scope with no discussion required.
Two-batch GitHub push strategy used to avoid MCP timeout on large payloads.
Monaco setValue() + find(Run button) + ref click used for SQL execution (established pattern).

OPEN THREADS -- TIMESTAMP: 2026-05-12 (dinner session) UTC
1. Module 12 smoke test: git pull, dev server restart, open localhost:3000/correspondence,
   create one entry, verify list and detail pages load.
2. Voice profile discussion: required before Module 9 (Research Report Writer) begins.
3. Platform name: pending.
4. Next module to build: Module 11 (Family Group Sheet Builder), Module 14 (DNA Evidence
   Tracker), Module 13 (File Naming System), Module 8 (FAN Club Mapper), or Module 9
   with voice profile discussion first.
5. All prior open threads from SESSION-2026-05-12-0110-UTC carry forward:
   investigation types in src/types/index.ts, gps_stage_reached constraint.

PARTIALLY BUILT WORK
None. All work committed.

DO NOT DO THIS
- Do not push all 6 module files in a single github:push_files call -- it times out.
  Push in 2 batches: (SQL + API routes), then (pages).
- Do not treat MCP timeout on push as a connector failure if reads are working.
  The payload size is the issue, not the connection.
- Do not use the Greene/Greenspun line as test data.
- Do not start a new dev server without checking lsof -iTCP:3000 first.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-12 (dinner session) UTC
git pull locally, restart dev server clean (check for stale cache),
open localhost:3000/correspondence, smoke test Module 12.
--- END SNAPSHOT ---
