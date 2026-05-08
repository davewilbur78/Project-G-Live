# Module 11: Family Group Sheet Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Fully cited nuclear family unit documentation.

## Status

Design phase. Not yet built.

## What It Does

The Family Group Sheet Builder produces a formal family group sheet for a nuclear family unit -- one couple and their children. Every fact on the sheet is cited.

Fields covered:
- Husband: name variants, birth, death, burial, marriage, parents
- Wife: name variants, birth, death, burial, marriage, parents
- Children: name, birth, death, marriage (with spouse name)
- All events: date, place, source citation

## Citation Integration

Every date and place field links to a source citation in the Citation Builder. A fact without a citation cannot be entered as finalized -- it must be marked as undocumented.

## Output

Generates a formatted family group sheet document suitable for:
- BCG submission supporting materials
- Family history publications
- Sharing with family members (client output mode: citations simplified)

## Data Read

- `persons` table
- `sources` and `citations` tables
- `timeline_events` table

## Data Written

- Family group sheet records (linked to persons)
