--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-16 20:50 UTC
Captured by: Claude (claude.ai)
Posture at capture: EXPLORE
Trigger: session close (deliberate -- closing clean before Connie Knox session)

WHAT THIS SESSION WAS DOING
Stepped back from build mode to examine the overall shape of the app after
a dense run of FTM work. Identified the module taxonomy problem (13 "modules"
are not all the same kind of thing), the Person Hub problem (1,576 people
with no front door in the app), and established the Connie Knox Ancestry
workflow session as the required next EXPLORE step before any navigation
or person-page design work. Committed a living design document to the repo.
Discussed Vercel deployment framing and correctly deferred it.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-16 20:50 UTC
One artifact committed this session:
  df453f5 -- docs/architecture/app-design-exploration.md (new file)
No code written. No wip/ branch. Repo clean.

DECISIONS MADE THIS SESSION
TIMESTAMP: 2026-05-16 20:50 UTC -- Module taxonomy: infrastructure components
  (File Naming System, FTM Bridge, Citation Builder) do not belong in main
  navigation alongside user-facing destinations. Working nav is ~8-10 modules.
TIMESTAMP: 2026-05-16 20:50 UTC -- Person Detail Page has no front door.
  A People section with search and browse must be built as a first-class
  navigation destination before any other navigation work.
TIMESTAMP: 2026-05-16 20:50 UTC -- Vercel deployment gated on navigation
  restructure + People hub completion. Deploying now would harden an
  incoherent navigation. Not a current priority.
TIMESTAMP: 2026-05-16 20:50 UTC -- Connie Knox Ancestry workflow session
  is the next session, and is a required input before person-page and
  navigation design work begins.

OPEN THREADS
TIMESTAMP: 2026-05-16 20:50 UTC -- Ancestry tree sources masquerading
  as real sources. 87.6% source-wiring figure may be overstated. Many
  events may be sourced to member trees, not original records. Needs audit
  and triage mechanism. Not now. Tracked in design doc.
TIMESTAMP: 2026-05-16 20:50 UTC -- Person page design and aesthetics not
  yet discussed. Should follow Connie Knox session so design decisions are
  informed by workflow understanding.
TIMESTAMP: 2026-05-16 20:50 UTC -- Voice profile discussion still pending.
  Gates Module 9 (Research Report Writer). Not yet scheduled.

PARTIALLY BUILT WORK
None.

DO NOT DO THIS
- Do not begin navigation restructure or People hub design before the
  Connie Knox Ancestry workflow session is complete. That session is
  the required input. Design without it produces the wrong thing.
- Do not treat Vercel deployment as a near-term build priority.
  It is gated on navigation coherence.
- Do not treat all 13 modules as equivalent navigation items.
  Infrastructure components belong in Settings, not main nav.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-16 20:50 UTC
Open a fresh session. Paste restoration prompt. Feed in Perplexity
summaries of the full Connie Knox Ancestry playlist. Use that material
to map Ancestry's power-user workflows and identify the gaps this app
should fill. Output feeds directly into People hub and person page design.
--- END SNAPSHOT ---
