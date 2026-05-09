# PERPLEXITY COMMIT INSTRUCTIONS
# Project-G-Live complete repo alignment -- v1.3.0
# TIMESTAMP: 2026-05-08 07:00 UTC
# Prepared by: Claude after full comparative review of both repos

Execute every step in order. Do not skip. Do not improvise.
When done, Project-G-Live will be better than Project-G in every
dimension with nothing left behind.

---

## FILES PROVIDED BY CLAUDE

1. AGENT.md (v1.3.0 -- corrected and final)
2. README.md (boot entry point only)
3. docs/architecture.md (updated)
4. docs/modules/ -- all 15 module docs rebuilt
5. prototypes/case_study_builder_v2.html (migrated from Project-G)

---

## STEP 1: WRITE THE SESSION SNAPSHOT

Create: /sessions/SESSION-2026-05-08-0700-UTC.md

--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-08 07:00 UTC
Captured by: Claude (claude.ai) -- committed by Perplexity
Posture at capture: EXPLORE
Trigger: session close

WHAT THIS SESSION WAS DOING
Full comparative review of Project-G and Project-G-Live. Read every
file in both repos. Identified regressions, missing migrations, and
errors. Rebuilt entire documentation layer. No application code touched.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-08 07:00 UTC
AGENT.md v1.3.0 written and corrected. All 15 module docs rebuilt.
architecture.md updated. README.md rewritten. Prototype migrated.
All output provided to Perplexity for commit.

DECISIONS MADE THIS SESSION
TIMESTAMP: 2026-05-08 06:00 UTC -- Module docs in new repo were a
regression. Old format had Description, Key Inputs, Key Outputs, GPS
Touchpoints, Prompt Engines, Data Written, Connection to Other Modules.
New repo stripped all of those. Rebuilt all 15 to full standard plus
new Build Notes section.
TIMESTAMP: 2026-05-08 06:10 UTC -- AGENT.md incorrectly said Supabase
schema does not exist. architecture.md has it. Corrected.
TIMESTAMP: 2026-05-08 06:15 UTC -- Build order revised. Citation
Builder first. Case Study Builder second. GEDCOM Bridge at position 9.
TIMESTAMP: 2026-05-08 06:20 UTC -- Build Notes section added to every
module doc -- tells a BUILD agent what must be in place before starting.
TIMESTAMP: 2026-05-08 06:25 UTC -- TBD tables flagged in architecture.md:
conflicts, case_studies, output storage for modules 09 and 11.
TIMESTAMP: 2026-05-08 06:30 UTC -- Claude Code local path added to
architecture.md: /Users/dave/Project-G-Live/
TIMESTAMP: 2026-05-08 06:35 UTC -- Prototype recovered from Project-G,
migrated to Project-G-Live /prototypes/.
TIMESTAMP: 2026-05-08 06:40 UTC -- Singer_Springer_Research_Record.docx
identified as unmigrated. Instructions in Step 10.

OPEN THREADS -- TIMESTAMP: 2026-05-08 07:00 UTC
- Singer_Springer_Research_Record.docx needs manual copy (Step 10)
- claude.ai project instructions need to be installed by user
- TBD schema tables need design before modules 06, 09, 10, 11 can build
- README.md Boot URLs need updating after this snapshot is committed

PARTIALLY BUILT WORK
None. All output provided to Perplexity.

DO NOT DO THIS
- Do not reintroduce separate architecture docs or prompts folder
- Do not hardcode a model string
- Do not mark schema as missing

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-08 07:00 UTC
Execute these instructions. Next session: Claude, BUILD posture.
Expand architecture.md schema for Citation Builder. Begin Module 04.
--- END SNAPSHOT ---

Commit message:
  session: EXPLORE 2026-05-08 -- full repo alignment [Claude]


---

## STEP 2: COMMIT AGENT.md

Replace /AGENT.md with the v1.3.0 file provided by Claude.

Also update the header of AGENT.md before committing:
  Last updated: [today's actual datetime] UTC
  Last updated by: Perplexity

Commit message:
  feat: AGENT.md v1.3.0 -- consolidated, corrected, build order
  revised [Claude]


---

## STEP 3: COMMIT README.md

Replace /README.md with the file provided by Claude.

Commit message:
  feat: README.md -- boot entry point, Boot URLs section [Claude]


---

## STEP 4: COMMIT architecture.md

Replace /docs/architecture.md with the updated file provided by Claude.

Commit message:
  feat: docs/architecture.md -- TBD tables, Claude Code path,
  model string fixed [Claude]


---

## STEP 5: COMMIT ALL 15 MODULE DOCS

Replace all 15 files in /docs/modules/ with the files provided by Claude.

Commit message:
  feat: rebuild all 15 module docs to full standard [Claude]


---

## STEP 6: COMMIT PROTOTYPE

Commit /prototypes/case_study_builder_v2.html provided by Claude.

Commit message:
  feat: migrate Case Study Builder v2 prototype from Project-G [Claude]


---

## STEP 7: UPDATE SESSIONS-INDEX.md AND COMMIT

Update /sessions/SESSIONS-INDEX.md. Add at top of entries list:

  2026-05-08 07:00 UTC | EXPLORE | Claude | Full comparative review.
  All 15 module docs rebuilt, AGENT.md corrected, prototype migrated.
  See SESSION-2026-05-08-0700-UTC.md.

Update the TIMESTAMP last updated line.

Commit message:
  session: update SESSIONS-INDEX for 2026-05-08 Claude session [Claude]


---

## STEP 8: UPDATE README.md BOOT URLS

After Step 1 is committed, update README.md Boot URLs section.
Replace the placeholder with this exact URL:

  https://api.github.com/repos/davewilbur78/Project-G-Live/contents/sessions/SESSION-2026-05-08-0700-UTC.md

Commit message:
  chore: README Boot URLs updated [Perplexity]


---

## STEP 9: RETIRE OLD FOLDERS

For each file below, either delete it or add "RETIRED as of v1.3.0.
Content absorbed into AGENT.md." at the top.

- /docs/architecture/OPERATING-MODEL.md
- /docs/architecture/SESSION-MEMORY.md
- /docs/architecture/SIGNAL-VOCABULARY.md
- /prompts/BOOT-ANY-AI.md
- /prompts/perplexity-space-instructions.md
- /prompts/README.md

Commit message:
  chore: retire /docs/architecture/ and /prompts/ [Claude]


---

## STEP 10: MIGRATE THE RESEARCH RECORD

Singer_Springer_Research_Record.docx exists in the OLD Project-G repo at:
https://github.com/davewilbur78/Project-G/blob/main/docs/research/Singer_Springer_Research_Record.docx

Copy it to Project-G-Live at:
/docs/research/Singer_Springer_Research_Record.docx

This is the primary research artifact for the Module 10 test case.

Commit message:
  feat: migrate Singer_Springer_Research_Record.docx from
  Project-G [Claude]


---

## STEP 11: WRITE CHANGELOG ENTRY

Add at the top of CHANGELOG.md, above v1.2.0:

---

## v1.3.0 -- 2026-05-08 UTC [Claude]

### Full repo alignment -- everything from Project-G preserved and improved

EXPLORE session. No application code written.

What was fixed:
- All 15 module docs rebuilt to full standard (Description, Key Inputs,
  Key Outputs, GPS Touchpoints, Prompt Engines, Data Written to Supabase,
  Connection to Other Modules, Build Notes). New repo had stripped these
  critical sections.
- AGENT.md false statement corrected: schema document exists in
  architecture.md. Was incorrectly declared missing.
- Build order revised: Citation Builder first, Case Study Builder second,
  GEDCOM Bridge at position 9.
- architecture.md model string hardcoded -- fixed to current Sonnet.
- TBD tables flagged in architecture.md (conflicts, case_studies).
- Claude Code local path added to architecture.md.
- Case Study Builder v2 prototype migrated from Project-G.
- Singer_Springer_Research_Record.docx migrated from Project-G.

What is next:
1. User installs claude.ai project instructions from AGENT.md Backlog
2. First Phase 3 BUILD session: expand architecture.md for Citation
   Builder, begin Module 04

---

Commit message:
  chore: CHANGELOG v1.3.0 [Claude]


---

## STEP 12: VERIFY

Fetch:
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md

Confirm version reads 1.3.0 and timestamp is today. If wrong, fix.

---

## STEP 13: PRODUCE HANDOFF BLOCK

--- HANDOFF ---
Session closed by: Perplexity
TIMESTAMP: [your actual timestamp]
Posture(s) this session: EXPLORE
Version after this session: 1.3.0
Session snapshot: /sessions/SESSION-2026-05-08-0700-UTC.md
What was done: Full comparative review by Claude. All 15 module docs
rebuilt. AGENT.md corrected. Prototype and research record migrated.
Repo is now complete and better than Project-G in every dimension.
What is next: Claude, BUILD posture. Expand architecture.md for
Citation Builder. Begin Module 04.
--- END HANDOFF ---

---

Done. Thirteen steps. The repo is healed.
