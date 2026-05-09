# Signal Vocabulary

TIMESTAMP: 2026-05-08 23:35 UTC
Authored by: Perplexity
Version: 1.0.0

This document is the full signal dictionary for
Project-G-Live. Signal phrases are recognized by any
AI on this project and trigger specific protocols
immediately, before any other response.

Add new signals here as they are identified. Update
version and TIMESTAMP when modified.

---

## Why Signals Exist

The user should not have to remember procedure during a
crisis. When a session is going wrong, when the context
window is failing, when the user has to leave suddenly --
natural language phrases should trigger the right response
automatically. The AI recognizes the signal and acts.

---

## Exit Signals

Trigger: user needs to leave, session must be preserved.

Recognized phrases (partial match is sufficient):
  "i have to go"
  "going to bed"
  "leaving for dinner"
  "have to go to bed now"
  "leaving for dinner now"
  "stepping away"
  "brb"
  "i have to leave"
  "gotta run"
  "need to stop"
  "wrapping up"
  "calling it a night"

Protocol -- execute in this order, no questions asked:
  1. TIMESTAMP the signal event
  2. Name exactly what work was in motion at this moment
  3. Commit all uncommitted work to wip/ branch
  4. Write full session snapshot to /sessions/ with TIMESTAMP
  5. Update SESSIONS-INDEX.md
  6. Generate restoration prompt
  7. Confirm: "Session preserved.
     Snapshot: [/sessions/SESSION-filename.md]
     Restoration prompt ready when you return."

Do not ask questions. Do not discuss. Execute and confirm.

---

## Distress Signals

Trigger: something is wrong with the session, the AI,
or the direction of work.

Recognized phrases:
  "something is wrong"
  "this isn't working"
  "you're going in circles"
  "are you okay"
  "context window"
  "you're losing it"
  "something is off"
  "start over"
  "you're confused"
  "this is broken"
  "you're repeating yourself"
  "you lost the thread"

Protocol -- execute in this order:
  1. TIMESTAMP the signal event
  2. STOP all forward work
     But first: name exactly what was in motion at this
     moment. Do not let the frame drop. What was being
     built, written, or decided right now.
  3. Commit all in-progress work to wip/ branch with TIMESTAMP
  4. Write full session snapshot to /sessions/
  5. Update SESSIONS-INDEX.md
  6. Generate restoration prompt
  7. Report context window status honestly
  8. Ask: "What feels wrong? Describe it and I will
     assess before we continue."
  9. Do not resume forward work until user confirms direction

---

## Health Check Signals

Trigger: user wants to know the state of the session.

Recognized phrases:
  "how are we doing"
  "check yourself"
  "context check"
  "where are we"
  "status"
  "health check"
  "how full are you"
  "are we okay"

Protocol:
  1. TIMESTAMP the check
  2. Report honestly:
     - Estimated context window load (low / moderate / heavy / critical)
     - What has been done this session, with TIMESTAMPs
     - Anything that feels degraded, inconsistent, or drifted
     - Recommendation: continue / checkpoint / close
  3. Ask if user wants to act on the recommendation

---

## Transcript Signals

Trigger: user wants full session reasoning preserved.

Recognized phrases:
  "save this conversation"
  "preserve this"
  "pull the transcript"
  "this is important, log it"
  "transcript"
  "log everything"
  "save all of this"

Protocol:
  1. Write the most detailed possible session log.
     Not a summary. A full reconstruction:
     - Complete decision trail with TIMESTAMPs
     - All reasoning, including what was considered
       and rejected and why
     - All open threads
     - All context that shaped decisions
  2. Commit to /sessions/ immediately with TIMESTAMP
  3. Update SESSIONS-INDEX.md
  4. Confirm: "Transcript committed:
     [/sessions/SESSION-filename.md]"

---

## Adding New Signals

When a new natural language pattern is identified that
should trigger a protocol:
  1. Add it to this file with TIMESTAMP
  2. Bump version number
  3. Note it in CHANGELOG
  4. Update the summary in AGENT.md Signal Vocabulary section
