# Changelog

> **Single source of truth:** AGENT.md is the only active instruction set for this project.
> This changelog is a historical record only. Nothing here overrides AGENT.md.

## v2.0.0 -- 2026-05-10 00:24 UTC [Claude]

### AGENT.md rewritten: lean Claude-native operating model

This was a cleanup and restructuring session. No application code was written.

### What changed

AGENT.md completely replaced. Previous version (v1.3.1, 30,464 bytes) was
built to serve two AI platforms (Claude and Perplexity) with dual boot paths,
a security-triggering verbatim handshake string, CDN workaround instructions,
and significant overhead for platform-switching that is no longer needed.

Decision made: one-tool model going forward. Claude is the single AI platform
for this project. The GitHub connector now gives Claude direct read/write
access to the repo, eliminating the need for Claude Code for any repo
operation. Claude Code is reserved for tasks that require local execution
(running the app, npm, testing).

New AGENT.md (v2.0.0, 17,379 bytes):
- Stripped all two-platform complexity (Perplexity fallback, dual boot paths,
  platform hierarchy, resource discipline between platforms)
- Stripped all CDN/raw URL workarounds (now unnecessary with GitHub connector)
- Stripped verbatim handshake string (security filter trigger, now replaced
  with natural-language version confirmation)
- Retained: session posture system (BUILD/FIX/EXPLORE), signal vocabulary,
  session memory architecture, context window pulse, snapshot format,
  restoration prompt format, session close protocol
- Retained: all project content (modules, tech stack, build order, coding
  standards, output types, citation rules, static rules, backlog)
- Size reduction: 43% smaller (30,464 to 17,379 bytes)

Prototype fixed:
- case_study_builder_v2.html in Project-G-Live was 43,191 bytes (truncated)
- Replaced with full verified version from Project-G (48,953 bytes)
- All 17 sources, 7 evidence links, 2 conflict analyses, full footnoted
  proof argument now present and correct

### What was not changed

- All 15 module docs: untouched
- docs/architecture.md: untouched
- docs/research/Singer_Springer_Research_Record.docx: untouched
- Session archive (/sessions/): untouched
- Project-G (original repo): untouched, still sitting as-is

### Design decisions made this session

TIMESTAMP: 2026-05-10 00:00 UTC -- One-tool model confirmed by user.
Perplexity is no longer a designated participant. Claude handles all work.
GitHub connector handles all repo operations that previously required
Claude Code or Perplexity.

TIMESTAMP: 2026-05-10 00:10 UTC -- Project-G-Live confirmed as canonical
going-forward repo. No third repo needed. The bones were good; the
operating file was the problem. Fixed in place.

TIMESTAMP: 2026-05-10 00:24 UTC -- AGENT.md v2.0.0 committed.

TIMESTAMP: 2026-05-10 00:28 UTC -- Prototype fix committed.

### What is next

1. Update Claude.ai project instructions to match new lean boot protocol
   (text provided in AGENT.md Backlog section)
2. Stub src/ directory: first task of first Phase 3 BUILD session
3. Expand /docs/architecture.md to column-level schema before Phase 3 begins
4. Begin Phase 3: Citation Builder (Module 4) is the first build target

---

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

TIMESTAMP: 2026-05-08 22:11 UTC -- Signal vocabulary designed.
Certain user phrases are system signals that trigger immediate
protocol execution.

TIMESTAMP: 2026-05-08 22:21 UTC -- Restoration prompt format designed.

TIMESTAMP: 2026-05-08 22:25 UTC -- Partially built work in snapshots
must be fully reconstructed, not summarized.

TIMESTAMP: 2026-05-08 22:28 UTC -- TIMESTAMP is non-negotiable
and was elevated to a first-class principle.

### What was rejected and why

- Six original modes: too granular, artificially distinct
- "Read-only REVIEW mode with no commits": too rigid
- "Overwrite SESSION.md": loses history
- "Prose summary of partially built code": archaeology, not recovery

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

- Version bumped to 1.1.0
- All timestamps now require datetime to the minute in UTC
- Added "Why This Repo Exists" section to AGENT.md
- Added explicit statement that Perplexity is a direct GitHub participant
- Added /prompts/ to repository structure
- Moved CANONICAL BOOT PROMPT from wishlist into AGENT.md
- Created prompts/perplexity-space-instructions.md
- Handoff block datetime field updated from "Date" to "Datetime"
- Versioning section updated: MINOR now explicitly includes meaningful
  architectural changes to the operating model

### What is next

1. Complete the Mode System behavioral rules (carried forward -- NOW RESOLVED in v1.2.0)
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
- Operating model updated to be AI-agnostic
- Persistent memory architecture formally documented
- Commit attribution system established
- Handoff protocol added
- All Project-G v3.0.4 content preserved

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

- CLAUDE.md designated as single source of truth
- Version numbering and UTC timestamp system established
- All 15 module docs created and audited
- Phase 1 marked complete, Phase 2 marked active
