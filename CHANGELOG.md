# Changelog

> **Single source of truth:** AGENT.md is the only active instruction set for this project.
> This changelog is a historical record only. Nothing here overrides AGENT.md.

## v1.2.0 -- 2026-05-08 23:54 UTC [Perplexity]

### Operating model redesign -- Session memory architecture, posture system, signal vocabulary

This was a deep EXPLORE session. No application code was written.
The entire session was devoted to redesigning the operating model
from first principles. The "mode system" placeholder carried forward
from Project-G was examined, questioned, and rebuilt as something
fundamentally more useful.

### What was designed and why

The original six-mode system (BUILD, DEBUG, PLAN, MODIFY, REVIEW,
TEST) was inherited from Project-G without being designed from
first principles. It existed because the user had experienced a
specific failure: AI sessions would boot, read the build path,
and immediately begin building -- even when the session was meant
to fix a problem. The mode declaration was a forcing function to
make the AI stop and ask before assuming.

This session identified that problem precisely and redesigned the
entire operating model around it. The result is substantially
different from and better than what existed before.

### Changes committed this session

AGENT.md:
- Version bumped to 1.2.0
- TABLE OF CONTENTS added at top
- Session Start Protocol updated: AI must fetch SESSIONS-INDEX.md
  and most recent session snapshot at boot alongside AGENT.md
- Persistent Memory Architecture loop updated to include session
  snapshot fetch as step 2
- Six-mode system replaced with three-posture system:
  BUILD / FIX / EXPLORE
- Posture transition protocol added: explicit declaration with
  TIMESTAMP required. Transitions do not require new threads.
- Signal Vocabulary section added (full dictionary in
  /docs/architecture/SIGNAL-VOCABULARY.md)
- Session Memory Architecture section added: /sessions/ folder,
  snapshot format, /wip/ branch protocol, context window pulse
- TIMESTAMP declared non-negotiable throughout: every artifact,
  decision, commit, snapshot carries YYYY-MM-DD HH:MM UTC
- Restoration Prompt section added with full format
- Handoff Protocol updated: now includes pointer to session
  snapshot file
- Session Close Protocol expanded to 10 steps including wip/
  branch commit, session snapshot, SESSIONS-INDEX update
- Repository Structure updated to include /sessions/ and wip/ branch
- "What This File Is" section updated to require fetching
  SESSIONS-INDEX.md and most recent snapshot at boot

New files created:
- /sessions/SESSION-2026-05-08-2335-UTC.md -- mid-session snapshot
- /sessions/SESSIONS-INDEX.md -- session archive index
- /docs/architecture/OPERATING-MODEL.md -- full operating model design doc
- /docs/architecture/SESSION-MEMORY.md -- session memory system design doc
- /docs/architecture/SIGNAL-VOCABULARY.md -- full signal phrase dictionary
- /prompts/BOOT-ANY-AI.md -- platform-neutral boot prompt
- /prompts/README.md -- prompts folder guide

### Design decisions made this session -- with TIMESTAMPs

TIMESTAMP: 2026-05-08 21:36 UTC -- Modes are session postures not
locks. Forcing new threads to switch modes breaks continuity and
loses context. Transitions must be allowed within a session.

TIMESTAMP: 2026-05-08 21:43 UTC -- The original six-mode system
was a placeholder, not a design. The real problem it solved was
preventing AI from defaulting to build posture at boot. That
problem requires an explicit boot gate, not a complex mode taxonomy.

TIMESTAMP: 2026-05-08 21:46 UTC -- Three postures chosen: BUILD,
FIX, EXPLORE. Broad enough to breathe, distinct enough to matter.
Each answers a different version of "what kind of work is this."

TIMESTAMP: 2026-05-08 21:51 UTC -- Context window is the real
constraint, not mode. The system must monitor context health
actively, not reactively. 60% checkpoint, 80% checkpoint and ask.

TIMESTAMP: 2026-05-08 22:01 UTC -- SESSION.md architecture designed.
Session snapshots are never deleted, never overwritten. Named by
datetime. Committed to /sessions/. The archive is first-class memory.

TIMESTAMP: 2026-05-08 22:05 UTC -- Transcripts on demand, not by
default. Triggered by signal phrase. Full reconstruction, not summary.
Summaries are lossy. Transcripts preserve nuance.

TIMESTAMP: 2026-05-08 22:11 UTC -- Signal vocabulary designed.
Certain user phrases are system signals that trigger immediate
protocol execution. Exit signals, distress signals, health checks,
transcript requests. The AI executes before responding.

TIMESTAMP: 2026-05-08 22:21 UTC -- Restoration prompt format designed.
Must contain: hard facts, decision trail with TIMESTAMPs, open
threads, partially built work (complete reconstruction not summary),
DO NOT DO THIS list, single next action, confirmation gate.
AI does not proceed until user confirms accuracy.

TIMESTAMP: 2026-05-08 22:25 UTC -- Partially built work in snapshots
must be fully reconstructed, not summarized. A future session must
be able to continue the work, not reverse-engineer it. Commit to
wip/ branch whenever possible; full reconstruction in snapshot
only when commit is not possible.

TIMESTAMP: 2026-05-08 22:28 UTC -- TIMESTAMP is non-negotiable
and was elevated to a first-class principle. Every fact without
a timestamp is a rumor. Screamed in AGENT.md accordingly.

### What was rejected and why

- Six original modes: too granular, artificially distinct,
  DEBUG and MODIFY were redundant with BUILD
- "Read-only REVIEW mode with no commits": too rigid. Finding
  something broken during review and being unable to fix it
  requires a full session reboot. Bad.
- "Overwrite SESSION.md": loses history. Every snapshot is
  permanent. Named by datetime. Never overwritten.
- "Prose summary of partially built code": archaeology, not
  recovery. Code goes to wip/ branch. Full reconstruction
  in snapshot only as fallback.

### What is next

1. Update README.md as operating model entry point
2. Write final session close snapshot to /sessions/
3. Seed /prototypes/ with Case Study Builder v2 from Project-G
4. Add Supabase schema document to /docs/
5. Expand Module 10 to buildable spec
6. Continue Phase 2 prototype work

---

## v1.1.0 -- 2026-05-08 23:29 UTC [Perplexity]

### Operating model upgrades

This session focused entirely on establishing the new repo
as the correct working environment and closing gaps between
what was discussed and what was committed.

### Changes

- Version bumped to 1.1.0 (meaningful architectural upgrade,
  not a patch)
- All timestamps now require datetime to the minute in UTC.
  Date-only stamps are no longer permitted anywhere in the
  project.
- Added "Why This Repo Exists" section to AGENT.md:
  documents the transition from Project-G, the three key
  changes, and why the old model was replaced
- Added explicit statement that Perplexity is a direct
  GitHub participant -- can read/write repo via API without
  needing Claude Code or local machine as intermediary
- Added /prompts/ to repository structure
- Moved CANONICAL BOOT PROMPT from wishlist into AGENT.md
  as a named wishlist item (to be resolved)
- Created prompts/perplexity-space-instructions.md --
  the canonical copy-pasteable boot prompt for Perplexity
  Space sessions
- Handoff block datetime field updated from "Date" to
  "Datetime" to enforce full timestamp format
- Versioning section updated: MINOR now explicitly includes
  meaningful architectural changes to the operating model

### Design decisions made this session

Timestamps must be full datetimes. A date alone is useless
on a project that can have multiple sessions in one day.
All future timestamps use YYYY-MM-DD HH:MM UTC format.

Perplexity is a full direct participant. No intermediary
required for planning, documentation, or AGENT.md work.
This is a firm operating principle, not a preference.

Boot prompt is now a committed artifact. It lives in
/prompts/ and is versioned alongside the project.

### What is next

1. Complete the Mode System behavioral rules (first PLAN
   session agenda item -- carried forward -- NOW RESOLVED
   in v1.2.0)
2. Expand Module 9 and Module 10 docs to buildable specs
3. Add Supabase schema document to /docs/
4. Seed /prototypes/ with Case Study Builder v2 from Project-G
5. Continue Phase 2 prototype work

---

## v1.0.0 -- 2026-05-08 22:30 UTC [Perplexity]

### Project-G-Live established

This repo was created from Project-G v3.0.4 during a planning
session with Perplexity on 2026-05-08.

### Key changes from Project-G

- Repo renamed Project-G-Live
- CLAUDE.md renamed AGENT.md
- Operating model updated to be fully AI-agnostic: any AI can
  read, write, build, and commit. No role restrictions between
  AI platforms.
- Persistent memory architecture formally documented in AGENT.md
- Commit attribution system established: every commit identifies
  the AI that made it
- Handoff protocol added: structured block produced at session
  end when switching AI platforms or context
- Claude Code instructions block added to handoff format:
  explicit step-by-step commands for local build work, written
  so the user can paste them directly
- Fetch URL updated to point to Project-G-Live repo
- All Project-G v3.0.4 content preserved

### Design decisions made this session

Repo-as-persistent-memory: formally documented as the core
architectural insight. GitHub is the brain. AI platforms are
stateless workers that read from and write to it.

AI-agnostic by design: no AI owns the project. Any capable AI
is a full participant. This was the user's explicit requirement
and is now a firm operating principle.

Local machine is optional: the local development machine is
not required for planning, design, or documentation work.
Claude Code handles local build work when needed. The division
is practical (what each tool does best), not architectural
(what each tool is allowed to do).

All work products committed: nothing lives only in a context
window. Every session's output must be committed before close.

### What is next

1. Complete the Mode System behavioral rules (first PLAN
   session agenda item -- carried forward from Project-G)
2. Expand Module 9 and Module 10 docs to buildable specs
3. Add Supabase schema document to /docs/
4. Seed /prototypes/ with Case Study Builder v2 from Project-G
5. Continue Phase 2 prototype work

---

## [INHERITED FROM PROJECT-G]

All history below is inherited from the Project-G repository.

## v3.0.4 -- 2026-05-08 UTC [Claude]

- Fixed fetch method: GitHub API only, no CDN URLs
- Added session mode gate
- Added Unresolved notice for mode system design

## 2026-05-07 -- Case Study Builder Prototype, Singer/Springer Session [Claude]

- Module 10 prototype v1 and v2 complete
- Jacob Singer / Yankel Springer identity proof research session
- Seven-link evidence chain constructed
- Firm rules established: GEDCOM as infrastructure, Ancestry
  tree links not sources, two output modes, EE citations
- Singer_Springer_Research_Record.docx produced
- Wishlist items added: Document Viewer, Reasonably Exhaustive
  Search Checklist

## v2.0 -- 2026-05-07 UTC [Claude]

- AGENT.md (then CLAUDE.md) designated as single source of truth
- Version numbering and UTC timestamp system established
- All 15 module docs created and audited
- Phase 1 marked complete, Phase 2 marked active
