--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-15 UTC
Captured by: Claude (claude.ai)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
PersonExternal initiative from start to finish. Discovered that PersonExternal table
in the .ftm file is empty -- Ancestry IDs actually live in Sync_Person.AmtId. Designed
migration 019 (person_external_ids join table, Option B). Ran migration via Claude in Chrome.
Supervised Claude Code through importer Phase 7, discovery and fix of a latent 1000-row
pagination bug, families orphan cleanup, and final idempotency verification. All work
merged to main at 24b0a0b. Also caught and corrected an error where claude.ai initially
proposed Option A (flat column) -- Claude Code correctly pushed back citing existing AGENT.md spec.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-15 UTC
All work committed and merged to main at 24b0a0b. No wip/ branch.

Migration 019 live: person_external_ids table, UNIQUE(provider, external_id), two indexes.
1,576 rows, all provider='ancestry', idempotent across two runs.

Pagination fix live (commit 9886492): import-ftm.mjs now loops range() calls to
fetch all FTM persons regardless of tree size. Was silently capped at 1000 rows.
Pre-existing latent bug; only triggered on 2nd+ run of a >1000-person tree.

Families cleanup: 1,088 double-NULL orphan rows deleted. Root cause: families.partner1_id
and partner2_id use ON DELETE SET NULL, not CASCADE. Orphans lingered after persons
cleanup. 89 single-NULL families left intact (may be legit FTM single-parent records).

Final database state:
  persons: 1,577 (1,576 FTM + 1 pre-existing)
  person_external_ids: 1,576 (all provider='ancestry', idempotent)
  timeline_events: 5,983
  families: 625 (zero orphans)
  family_members: 2,204

DECISIONS MADE THIS SESSION
TIMESTAMP: 2026-05-15 UTC -- PersonExternal table is empty in .ftm. Ancestry IDs live
  in Sync_Person.AmtId. All 1,576 persons populated. FSIDs universally NULL.
TIMESTAMP: 2026-05-15 UTC -- Option B (join table) confirmed for migration 019.
  claude.ai initially proposed Option A; Claude Code correctly pushed back -- join table
  already spec'd in AGENT.md with multiple downstream references. Option A closed.
TIMESTAMP: 2026-05-15 UTC -- Pagination fix: loop .range() calls until response
  returns fewer than 1000 rows. Minimal change, no schema work.
TIMESTAMP: 2026-05-15 UTC -- Orphan families (both partners NULL): deleted via SQL.
  89 single-NULL families left intact.

OPEN THREADS -- TIMESTAMP: 2026-05-15 UTC
- Notes pipeline: ftm_notes table + importer extension. Decisions locked. Build pending.
- Fact-type normalizer: Category A TAG_TO_EVENT additions + Category B regex pass.
  Decisions locked. Build pending.
- families ON DELETE SET NULL behavior documented in Known Technical Debt. Consider
  whether to change to CASCADE in a future migration.
- Untracked files on main: package-lock.json, prototypes/dashboard-mockup-v1.html,
  scripts/import-gedcom.js. Dave to decide.
- Vercel deployment: pending.
- Voice profile discussion: pending, gates Module 9.

PARTIALLY BUILT WORK
None.

DO NOT DO THIS
- Do not reopen Option A vs Option B for migration 019. Closed.
- Do not bulk import media. Selective on-demand is the architecture. Closed.
- Do not reopen Category A/B fact-type decisions. Closed.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-15 UTC
Notes pipeline: design ftm_notes table migration and importer extension.
Decisions are locked in AGENT.md. Claude Code or claude.ai.
--- END SNAPSHOT ---
