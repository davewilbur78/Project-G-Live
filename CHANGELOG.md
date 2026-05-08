# Changelog

> **Single source of truth:** AGENT.md is the only active instruction set for this project.
> This changelog is a historical record only. Nothing here overrides AGENT.md.

## v1.0.0 -- 2026-05-08 UTC [Perplexity]

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
