# Module 08: FAN Club Mapper

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Family, Associates, and Neighbors network tracking.

## Status

Design phase. Not yet built.

## What It Does

The FAN Club Mapper tracks the network of Family, Associates, and Neighbors (FAN) around the research subject. This network is often the key to breaking through brick walls in genealogical research.

Features:
- Add individuals to the FAN network with relationship type (family, associate, neighbor, witness, bondsman, etc.)
- Link FAN members to specific documents (co-appearing in records)
- Track FAN members across multiple documents to identify migration patterns and persistent relationships
- Visualize the network as a graph
- Generate a FAN Club narrative for inclusion in research reports

## Research Value

In Ashkenazi Jewish genealogy specifically, FAN Club research is high-value. Community members frequently:
- Immigrated together or in close sequence
- Settled in the same neighborhoods
- Witnessed each other's vital records
- Named children after shared ancestors
- Appear as contacts in immigration records

Tracking these relationships often resolves identity questions and locates otherwise unfindable records.

## Data Written

- `fan_club` table: nodes (individuals) and edges (relationships and co-appearances)
- Links to `persons`, `documents`, and `timeline_events` tables
