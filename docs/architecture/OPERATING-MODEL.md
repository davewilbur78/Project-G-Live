# Project-G-Live Operating Model

TIMESTAMP: 2026-05-08 23:35 UTC
Authored by: Perplexity
Version: 1.0.0

This document explains the operating model of Project-G-Live
as a coherent whole. It is a design document, not an
instruction set. Instructions live in AGENT.md. This document
explains why the system works the way it does.

---

## The Core Insight

AI platforms have no memory between sessions. This is not a
bug -- it is a fundamental property of how they work. The
design question is not how to give AI platforms memory. It
is how to build a project that does not need them to have it.

The answer: GitHub is the brain. The repo is the persistent
memory layer. AI platforms are stateless workers that read
from and write to it. Every session starts by reading the
current state. Every session ends by committing its output.
Nothing lives only in a context window.

---

## Why AI-Agnostic

The original repo (Project-G) used a file called CLAUDE.md,
which implied one AI owned the project. That assumption
broke every time a different tool was more useful for a
specific task. The renamed AGENT.md and the AI-agnostic
principle remove that friction permanently.

Any AI -- Perplexity, Claude, Claude Code, or any future
platform -- can do anything on this project at any time.
The user chooses freely. No restructuring required.

---

## The Session Posture System

The posture system exists to solve a specific failure pattern:
an AI boots, reads the build path, sees the next module, and
immediately starts building -- even when the session was
opened to fix a problem. This compounds problems.

The fix is simple: the AI must not infer session direction
from project state. It asks. It waits. It proceeds only
after the user confirms the posture.

Three postures cover all real work:
- BUILD: moving forward
- FIX: something is broken
- EXPLORE: figuring something out

Postures are phases, not locks. Transitions are always
permitted with an explicit timestamped declaration. This
preserves continuity -- no forced new threads, no lost
context -- while maintaining a clear record of what kind
of work was happening at every point in a session.

---

## The Session Memory Architecture

Context windows fill. Sessions end abruptly. Work gets lost.
The session memory architecture solves this at every level.

/sessions/ is a permanent, append-only archive of session
snapshots. Every snapshot is timestamped and named by
datetime. None are ever deleted. This folder is the
project's mind -- not just what was built, but what was
thought, what was rejected, what was mid-air.

The wip/ branch is for partially built code. A description
of half-built code is archaeology. The actual code committed
to a branch is recoverable. Broken code in the repo is
always preferable to complete code that only exists in a
context window.

The context window pulse is an active monitoring practice.
The AI does not wait until the window is full. At 60% it
checkpoints. At 80% it asks. This prevents the worst failure
mode: a context window that fills silently and loses
everything.

---

## The Signal Vocabulary

Certain natural language phrases from the user trigger
specific protocols. This exists because the user should
not have to remember procedure during a crisis. "I have to
go" preserves the session. "Something is wrong" stops
forward work and captures the state. "How are we doing"
gets an honest context health report.

The AI executes signal protocols before responding to
anything else. The signal is recognized first, acted on
first, then acknowledged.

---

## The Restoration Prompt

When a session ends unexpectedly or the context window
becomes unhealthy, the restoration prompt is the artifact
that makes recovery possible. It is not a summary. It is
a precise reconstruction of session state: what was decided,
what was in motion, what must not be re-opened, and what
the single next action is.

The restoration prompt ends with a confirmation gate. The
new session does not proceed until the user confirms the
restoration is accurate. This prevents a bad restoration
from compounding a problem.

---

## Division of Labor Between AI Platforms

Perplexity: planning, design, documentation, AGENT.md
updates, spec writing, architecture decisions. Can read
from and write directly to GitHub without intermediary.

Claude (conversational): same scope as Perplexity.
Can participate in any session type.

Claude Code: local build work that requires it. Terminal
commands, running the dev server, local testing, complex
multi-file refactors. The handoff block always includes
explicit Claude Code instructions when the next step
requires local work.

This division is practical, not architectural. Any AI can
do anything. The division reflects what each tool does best,
not what it is allowed to do.

---

## What Is Not In This Document

Instruction sets, protocols, and procedures live in AGENT.md.
Signal vocabulary details live in SIGNAL-VOCABULARY.md.
Session memory format details live in SESSION-MEMORY.md.
This document explains the why. The others explain the how.
