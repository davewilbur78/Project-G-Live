# Module 15: Research To-Do Tracker

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Running research agenda organized by person and priority.

## Status

Design phase. Not yet built.

## What It Does

The Research To-Do Tracker maintains a running list of research tasks organized by subject person and priority. It is the operational layer that translates research plans and session outcomes into actionable next steps.

Each to-do item records:
- Subject person
- Research question being pursued
- Specific action (search X repository for Y record)
- Priority (high / medium / low)
- Status (open / in progress / complete / abandoned)
- Notes
- Link to the research plan or session that generated this task

## Auto-Population

To-do items are generated automatically from:
- Research Plan Builder (tasks from the plan)
- Research Log (next steps from each session)
- Source Conflict Resolver (unresolved conflicts become to-dos)
- Case Study Builder (gaps identified in the evidence chain)

## GPS Connection

The To-Do Tracker is the operational enforcement of the reasonably exhaustive search standard. It ensures that identified gaps are tracked and pursued, not forgotten.

## Data Written

- `todos` table: task records with person link, question, action, priority, status
