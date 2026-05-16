--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-16 17:45 UTC
Captured by: Claude (claude.ai)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
Opened with a full big-picture review at the user's request: assessed where the project
stands, where it should be heading, and proposed a priority sequence (close FTM loose ends,
deploy to Vercel, voice profile discussion, Module 8 as the differentiating feature).
Built the notes pipeline in full: migration 021 (ftm_notes table) and importer Phase 8
(discrete RTF-stripped note rows, upserted on UNIQUE(person_id, ftm_note_id)).
Processed a Claude Code session report on operational lessons learned and hardened the
importer and AGENT.md with three permanent platform-knowledge additions.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-16 17:45 UTC
All work committed and merged to main. Repo is clean.
  ce74180 -- sql/021-ftm-notes.sql (ftm_notes table)
  019ad52 -- importer Phase 8 (notes import)
  239dc80 -- Phase 8 PostgREST schema cache warmup poll
  7f6f6c9 -- AGENT.md v2.16.0

Migration 021 is committed but not yet run in Supabase. Claude Code needs to run it
before Phase 8 can write any rows. Importer will warm-poll and throw a clear error
if it has not been run.

DECISIONS MADE THIS SESSION
TIMESTAMP: 2026-05-16 06:00 UTC -- Notes stored as discrete ftm_notes rows, not
  merged into persons.notes. Idempotency via upsert on UNIQUE(person_id, ftm_note_id).
  persons.notes (concatenated blob) preserved for backward compatibility alongside.
TIMESTAMP: 2026-05-16 06:00 UTC -- Supabase Management API (localStorage token +
  /v1/projects/.../database/query) adopted as the primary DDL mechanism for Claude Code.
  CodeMirror interaction deprecated permanently. Documented in AGENT.md as mandatory pattern.
TIMESTAMP: 2026-05-16 06:00 UTC -- PostgREST schema cache lag pattern formalized:
  poll up to 10 x 2s before any upsert into a freshly-migrated table. Phase 8 warmup
  block is the canonical reference implementation.
TIMESTAMP: 2026-05-16 06:00 UTC -- SESSIONS-INDEX.md git rebase conflicts: always
  resolve as keep-both-sides, most-recent-first. Never abort the rebase for this file.

OPEN THREADS -- TIMESTAMP: 2026-05-16 17:45 UTC
None. Notes pipeline is fully closed. Migration 021 is the only outstanding activation step
(run in Supabase), and the importer handles it gracefully.

PARTIALLY BUILT WORK
None. All work committed.

DO NOT DO THIS
- Do not attempt CodeMirror form_input for Supabase SQL. Use the Management API.
- Do not reopen notes pipeline architecture. Discrete rows in ftm_notes. Decided.
- Do not merge persons.notes concatenation away -- it is kept alongside ftm_notes for
  backward compatibility and is not a bug.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-16 17:45 UTC
Fact-type normalizer: Category A TAG_TO_EVENT additions + Category B regex pass.
Decisions are locked in AGENT.md (Fact-Type Normalizer section). Build is ready.
--- END SNAPSHOT ---
