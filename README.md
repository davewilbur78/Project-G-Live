# Project-G-Live

Personal Genealogy Operations Platform

A modular web application supporting serious genealogical research
and professional development toward BCG certification. Built for
one user. Not a replacement for Ancestry.com or FamilyTreeMaker --
a working and documentation layer on top of them.

---

## If You Are an AI Starting a Session

Read this section completely before doing anything else.

**Step 1: Get AGENT.md.**

For Perplexity and any AI that can make live API calls:

    https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md

The response is JSON. Decode the base64 content field. Read the full file.
Do not use raw.githubusercontent.com -- CDN-cached and unreliable.

For Claude (claude.ai): the user will provide AGENT.md as a file attachment
or paste. Wait for it. Do not proceed without it.

**Step 2: Fetch the session index and latest snapshot using these exact URLs.**

Session index:

    https://api.github.com/repos/davewilbur78/Project-G-Live/contents/sessions/SESSIONS-INDEX.md

Latest session snapshot (updated every session close):

    [LATEST_SNAPSHOT_URL]

**Step 3: Execute the boot handshake.**

State exactly: "AGENT.md received. Version [X.X.X], last updated
[YYYY-MM-DD HH:MM UTC] by [AI name]. Ready for posture confirmation."

Wait for the user to confirm before doing anything else.

**Step 4: Ask the user for session posture.**

BUILD, FIX, or EXPLORE. Wait for confirmation. Do not begin work until confirmed.

---

## Boot URLs

These URLs are updated at every session close by the closing AI.
Always use these exact URLs. Do not construct URLs from decoded content.

AGENT.md (current):
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md

Sessions index:
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/sessions/SESSIONS-INDEX.md

Latest session snapshot:
[TO BE UPDATED BY PERPLEXITY AFTER THIS SESSION'S SNAPSHOT IS COMMITTED]

---

## Single Source of Truth

AGENT.md is the only active instruction set for this project. Everything
else in this repo is either build artifacts, session memory, or module
specs. Nothing overrides AGENT.md.

---

## Tech Stack

Next.js · React · Tailwind CSS · Supabase · Anthropic Claude API · Vercel

---

## Current Build Status

- Phase 1: Documentation and architecture -- complete
- Phase 2: Prototype artifacts -- active
  - Module 10 Case Study Builder prototype v2 complete
  - Test case: Jacob Singer / Yankel Springer identity proof
- Phases 3-5: Full web app -- pending
