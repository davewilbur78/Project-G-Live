# Module 02: Research Plan Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Structured research planning with auto-generated research questions.

## Status

Design phase. Not yet built.

## What It Does

The Research Plan Builder helps the researcher define a focused research objective and generates a structured plan to pursue it. It enforces the GPS requirement for a reasonably exhaustive search by prompting the researcher to account for all relevant source types.

1. Researcher states a research objective (e.g., "Identify the parents of Jacob Singer")
2. Module generates a set of research questions derived from the objective
3. Researcher selects and prioritizes questions
4. Module suggests relevant source types and repositories for each question
5. Plan is saved and linked to the Research Log

## GPS Connection

The Research Plan Builder is the primary enforcement point for the GPS requirement of a reasonably exhaustive search. It prompts the researcher to consider sources they might overlook and documents what was planned, providing a record of research scope.

## Prompt Engine

Research Agent Assignment v2.1 (Steve Little) powers the question generation logic.

## Data Written

- `research_plans` table: objective, questions, source suggestions, priority order
- Links to `persons` table for the research subject
