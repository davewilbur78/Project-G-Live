--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-12 14:30 UTC
Captured by: Claude Code (claude-opus-4-7)
Posture at capture: BUILD (smoke tests + AGENT.md fix)
Trigger: session close / handoff to claude.ai

WHAT THIS SESSION WAS DOING
Executed the smoke test + AGENT.md fix handed off by Claude.ai via Dave.
Inherited from SESSION-2026-05-12-1415-UTC: Modules 13 and 14 built and committed,
but AGENT.md stuck at v2.8.4 (MCP too-large-file timeout). Claude Code's job:
git pull, cold-restart dev server, smoke test three routes, update AGENT.md to
v2.8.5, write snapshot, commit.

WHAT HAPPENED -- TIMELINE

1. git pull: diverged branches. Local had 1 ahead (our merge-fix snapshot from
   earlier this session). Remote had 15 ahead (Modules 12, 13, 14 + MCP migration
   + Dual-AI workflow + AGENT.md v2.8.4). Resolved via merge.
   Two conflicts in session files (SESSION-2026-05-12-0110-UTC.md and
   SESSIONS-INDEX.md): kept our complete snapshot, merged index with
   Claude.ai's entries. Committed as f5d4788.

2. Cold restart: pkill -f "next dev", rm -rf .next, npm run dev. Ready in 1555ms.
   Port 3000, no conflicts.

3. Smoke tests (all passed):

   /correspondence
   - GET /correspondence: 200
   - POST /api/correspondence: 201 (created id: c7dcac6d-...)
   - GET /correspondence/[id]: 200
   - No errors in dev log. Clean.

   /dna-tracker
   - GET /dna-tracker: 200
   - POST /api/dna-matches: first attempt failed -- platform "AncestryDNA" rejected
     by check constraint (expects lowercase). Second attempt with "ancestry": 201.
   - GET /dna-tracker/[id]: 200
   - UI dropdowns verified: they use lowercase values (ancestry, 23andme, ftdna).
     No UI bug. Direct API callers must use lowercase.

   /file-naming
   - GET /file-naming: 200
   - Client-side only. No POST needed. Loaded and compiled clean.
   - Copy buttons not verified via CLI (require browser interaction).

4. AGENT.md updated from v2.8.4 to v2.8.5:
   - Version header + last updated timestamp
   - Module 14: NOT STARTED → COMPLETE with full details
   - Module 13: NOT STARTED → COMPLETE with full details
   - Build Path: 10 of 16 → 12 of 16, Modules 13+14 added to complete list
   - Repository Structure: sql/018-dna-tracker.sql added
   - Project State: timestamp, module count, smoke test results, open threads updated
   - Current version line: 2.8.5

STATE AT CAPTURE -- TIMESTAMP: 2026-05-12 14:30 UTC
All committed to main. Git clean.
Dev server running at localhost:3000 (fresh cold start this session).
Committed this session:
  - merge: resolve session file conflicts (f5d4788)
  - AGENT.md v2.8.5
  - sessions/SESSION-2026-05-12-CLAUDECODE-UTC.md (this file)
  - sessions/SESSIONS-INDEX.md (updated)

DECISIONS MADE THIS SESSION

TIMESTAMP: 2026-05-12 14:15 UTC -- dna-tracker platform constraint is correct
  behavior, not a bug. The check constraint requires lowercase ('ancestry', '23andme',
  etc.). The UI dropdown option values are already lowercase. Direct API callers
  must use lowercase. Documented in AGENT.md Project State and Module 14 entry.

OPEN THREADS -- TIMESTAMP: 2026-05-12 14:30 UTC
1. Voice profile discussion -- required before Module 9 begins
2. Module 11 output storage table design -- needs Dave input before building
3. Module 8 spatial FAN map redesign discussion -- before building
4. src/types/index.ts investigation types -- deferred until type error surfaces
5. Supabase seed data (Singer/Springer) -- deferred
6. Platform name -- pending
7. /file-naming copy buttons -- verified page loads; button functionality
   requires browser. Assumed working (client-side only module, no API calls).

PARTIALLY BUILT WORK
None.

DO NOT DO THIS
- Inherits all entries from SESSION-2026-05-12-1415-UTC.md.
- Do not push AGENT.md via MCP when the connector is marginal -- 44KB file
  times out. Use Claude Code git commit instead (confirmed working this session).
- Do not use uppercase platform values with dna-tracker API directly
  ("AncestryDNA" fails; "ancestry" works).

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-12 14:30 UTC
Dave + Claude.ai: voice profile discussion (Module 9 blocked until complete)
OR Module 11 output storage design decision. Dave's call which to tackle first.
4 modules remain: Module 9, Module 1, Module 11, Module 8.
--- END SNAPSHOT ---
