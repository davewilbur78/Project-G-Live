--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-12 (post-dinner close) UTC
Captured by: Claude (claude-sonnet-4-6)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
This was the dinner session and its aftermath. It began with the Module 16 smoke test
passing (confirmed by Dave), then pivoted to building Module 12 (Correspondence Log)
while Dave was at dinner. The GitHub MCP connector (Docker-based) went down twice during
the session -- code was staged locally and pushed once the connector recovered after a
Claude Desktop restart. The session also absorbed a significant infrastructure change:
Claude Code (a happy accident session Dave had while thinking he was talking to claude.ai)
migrated the GitHub MCP from Docker to NPX and built a manager script. That context was
delivered via relay and committed to AGENT.md v2.8.4 along with a Dual-AI Workflow section.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-12 (post-dinner close) UTC
All committed to main. No wip/ branch. Git is clean.
- Module 12 (Correspondence Log): COMPLETE. sql/017 live in Supabase. All routes and
  pages committed. Smoke test NOT YET done -- hand to Claude Code next session.
- AGENT.md v2.8.4: MCP Infrastructure (NPX manager) + Dual-AI Workflow documented.
- Module 16 smoke test: PASSED by Dave this session.

DECISIONS MADE THIS SESSION
2026-05-12 UTC -- Module 12 selected as dinner build target: standalone, no discussion
  required, prerequisites met.
2026-05-12 UTC -- Two-batch GitHub push strategy adopted to avoid MCP timeout on large
  payloads. (SQL + API routes), then (pages) as separate commits.
2026-05-12 UTC -- Claude Code division of labor formalized: smoke tests and local
  execution go to Claude Code, not to Dave as a terminal command list.
2026-05-12 UTC -- Module 14 (DNA Evidence Tracker) identified as next build target
  but deferred to a fresh session due to context load.
2026-05-12 UTC -- MCP NPX mode confirmed as active config. Docker no longer in use.
  Claude Desktop restart still pending to activate NPX config fully.

REJECTED:
- Do not build Module 14 in a heavy session. It connects to the Ashkenazi DNA workflow
  and deserves full context.
- Do not use HTTP mode for MCP -- no GitHub Copilot subscription.

OPEN THREADS -- TIMESTAMP: 2026-05-12 (post-dinner close) UTC
1. Claude Desktop restart: needed to fully activate NPX MCP config. Not done this session.
2. Module 12 smoke test: Claude Code to git pull, restart dev server, open
   localhost:3000/correspondence, create one entry, verify list and detail pages.
3. Module 14 (DNA Evidence Tracker): next build. Read design doc first.
4. Voice profile discussion: required before Module 9. Still pending.
5. Platform name: still pending. Ask Dave periodically.
6. src/types/index.ts investigation types: deferred until a type error surfaces.
7. Supabase seed data (Singer/Springer sources): after smoke tests pass.

PARTIALLY BUILT WORK
None. Everything is committed.

DO NOT DO THIS
- Do not push all module files in a single github:push_files call -- payload too large,
  times out. Push in 2 batches: (SQL + API routes), then (pages).
- Do not use coordinate clicks for the Supabase Run button -- use find() + ref click.
- Do not give Dave terminal commands to run himself when Claude Code can do it.
- Do not start Module 14 in a session that is already context-heavy.
- Do not use the Greene/Greenspun line as test data.
- Do not run git clone inside a Claude Code session.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-12 (post-dinner close) UTC
New session. Restart Claude Desktop first (activates NPX MCP config).
Hand Module 12 smoke test to Claude Code.
Then BUILD: Module 14 (DNA Evidence Tracker).
--- END SNAPSHOT ---
