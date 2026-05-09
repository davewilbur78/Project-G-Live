# Module 06: Source Conflict Resolver

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Side-by-side GPS-compliant conflict analysis when two or more sources
disagree about the same fact.

## Status

NOT STARTED -- Design phase.

## Description

The Source Conflict Resolver presents conflicting claims about the same
fact side by side and guides the researcher through GPS-compliant conflict
analysis. When two or more sources disagree about a date, name, place, or
relationship, the module displays each source with its full Three-Layer
classification, ranks the sources using the GPS preponderance hierarchy
(Original over Derivative over Authored; Primary information over
Secondary), and prompts the researcher to reason through which claim is
best supported by the evidence. The outcome is a documented resolution
note that becomes part of the proof argument for that fact, stored in
Supabase and linkable to Case Study Builder entries. A conflict that
cannot be resolved is documented as open and surfaces in the Research
To-Do Tracker.

## Key Inputs

- Two or more source records asserting conflicting claims about the
  same fact (date, name, place, or relationship)
- Three-Layer classifications for each source from Document Analysis
  Worksheet (05)

## Key Outputs

- Side-by-side display of conflicting sources with their full
  Three-Layer classifications
- GPS preponderance ranking of sources (Original over Derivative over
  Authored; Primary information over Secondary)
- Researcher-authored resolution note documenting which claim is best
  supported and why
- Open conflict flag for unresolved cases, surfaced to Research To-Do
  Tracker (15)

## GPS Touchpoints

- Directly addresses resolution of conflicting evidence (GPS element 4)
- Applies the GPS preponderance hierarchy to rank competing sources
- Resolution note becomes part of the proof argument, satisfying the
  requirement for a soundly reasoned written conclusion (GPS element 5)
- No conflict may be bypassed -- GPS requires all conflicts to be
  addressed or disclosed

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer governs all conflict analysis
  and resolution language; enforces the preponderance hierarchy

## Data Written to Supabase

- Requires a `conflicts` table -- not yet defined in architecture. This
  table needs to be designed and added to /docs/architecture.md before
  this module is built. The table must link resolution notes to the
  relevant citation records from both conflicting sources.

## Connection to Other Modules

- Draws source classifications from Document Analysis Worksheet (05)
- Resolution notes feed Case Study Builder (10) as documented conflict
  resolutions -- the prototype's Conflict Analysis stage maps directly
  to this module's output
- Resolved conflicts are referenced in Research Report Writer (09)
- Unresolved conflicts surface as action items in Research To-Do
  Tracker (15)

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Document Analysis Worksheet (05) complete -- Three-Layer classifications
  are required inputs
- `conflicts` table designed and added to /docs/architecture.md
  (currently TBD in schema)

Note: The Case Study Builder prototype's Conflict Analysis stage (Stage 4)
demonstrates the UI pattern for this module. Review that prototype before
designing the Source Conflict Resolver interface.
