--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-16 19:30 UTC
Captured by: Claude (claude.ai)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
Built and deployed the fact-type normalizer: Category A TAG_TO_EVENT additions
(ARVL, DPRT, CHR, ADDR, PROB, DIVF, _MILT) and Category B regex normalizer
(~140 custom FTM fact names collapsed to structured event types; naturalization
sub-events kept granular). Discovered that the existing check constraint on
timeline_events.event_type needed expanding -- wrote and committed migration 022,
then ran both migration 021 (ftm_notes) and 022 (event type constraint) directly
via the Supabase Management API through Claude in Chrome. Completed a full live
import. Resolved a parallel-sessions git conflict during the session.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-16 19:30 UTC
Repo is clean. All work pushed to main at 9e0eacc.
  6c522882 -- fact-type normalizer Category A + B (import-ftm.mjs)
  dbb8bc5c -- migration 022 (expand event type constraint)
  9e0eacc  -- merge commit (parallel sessions reconciled, pushed clean)

Migrations 021 and 022 are both live in Supabase.
Full import complete: 1,576 persons, 625 families, 5,980 timeline events, 44 notes.
New event types (arrival, departure, christening, obituary, naturalization
sub-events, etc.) are live in the database.

DECISIONS MADE THIS SESSION
TIMESTAMP: 2026-05-16 19:30 UTC -- Migrations 021 and 022 run via Supabase
  Management API through Claude in Chrome. Both returned [] (success).
TIMESTAMP: 2026-05-16 19:30 UTC -- Parallel session git conflict resolved via
  merge (not rebase). Rebase tangled old commits; merge was the right call.

OPEN THREADS -- TIMESTAMP: 2026-05-16 19:30 UTC
None. Import pipeline is fully complete and clean.

PARTIALLY BUILT WORK
None.

DO NOT DO THIS
- Do not attempt git rebase on SESSIONS-INDEX.md conflicts. Use merge.
  Rebase tangles old commits on this repo. This was confirmed again this session.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-16 19:30 UTC
Vercel deployment or voice profile discussion (gates Module 9). Both are unblocked.
--- END SNAPSHOT ---
