# Module 12: Correspondence Log

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Tracks all outgoing research inquiries and responses.

## Status

Design phase. Not yet built.

## What It Does

The Correspondence Log tracks every research inquiry sent to archives, repositories, family members, or other researchers. GPS requires that the researcher document their search process -- correspondence is part of that record.

Each entry records:
- Date sent
- Recipient (institution, individual)
- Subject (research question being pursued)
- Method (email, letter, online form)
- Summary of inquiry
- Response received (date and summary)
- Outcome: record found, negative response, no response

## Research Value

The log prevents duplicate inquiries, documents the scope of the reasonably exhaustive search, and provides a paper trail for BCG submissions demonstrating research effort.

## Data Written

- `correspondence` table: inquiry records with dates, recipients, outcomes
- Links to `research_plans` and `persons` tables
