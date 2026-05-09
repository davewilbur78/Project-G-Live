# Module 09: Research Report Writer

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Formal narrative research report generator with two output modes --
professional GPS-compliant output and plain English client output --
from the same underlying research record.

## Status

NOT STARTED -- Design phase.

## Description

The Research Report Writer generates formal narrative research reports
in GPS-compliant style. A research report documents the scope of a
research project, the sources searched (including those that yielded
nothing), what was found, and the conclusions reached -- with full
citations embedded in the narrative. The Fact Narrator v4 prompt engine
converts structured extracted facts into coherent narrative prose. The
report writer pulls data from the Research Log, Timeline Builder, and
Document Analysis Worksheets to assemble a complete, auditable account
of the research conducted for a given person or question. Reports are
formatted for human review and can be exported to Word or PDF.

Two output modes are generated from the same data:

PROFESSIONAL OUTPUT: GPS-compliant language, full EE citations, inline
footnotes, Three-Layer analysis visible. For BCG submissions, peer
review, and professional correspondence.

CLIENT OUTPUT: Plain English narrative. Methodology invisible. No GPS
or EE terminology. Warm and readable. For family members and paying
clients.

## Key Inputs

- Research scope and question
- Research Log sessions for the relevant person or project
- Timeline Builder data for the subject
- Document Analysis Worksheets and classified fact lists
- Family Group Sheet Builder data for foundational person and family facts

## Key Outputs

- Formal narrative research report with embedded EE-style citations
- Documents scope, sources searched (including negatives), findings,
  and conclusions
- Two formats: professional GPS-compliant and plain English client-facing
- Exportable to Word or PDF

## GPS Touchpoints

- Fulfills the GPS requirement for a soundly reasoned written conclusion
  (GPS element 5)
- Documents reasonably exhaustive search (GPS element 1) by narrating
  what was and was not found
- Embeds complete and accurate citations (GPS element 2) throughout
  the narrative

## Prompt Engines Used

- **Fact Narrator v4** (Steve Little) -- converts structured extracted
  facts into coherent narrative prose
- **GRA v8.5c** -- GPS enforcement layer applied to all generated text

## Data Written to Supabase

- Report storage format and table are TBD. Needs design before this
  module is built. Add to /docs/architecture.md at that time.

## Connection to Other Modules

- Draws from Research Log (03), Timeline Builder (07), and Document
  Analysis Worksheet (05)
- Family Group Sheet Builder (11) data provides foundational person
  and family facts for the narrative
- May incorporate Case Study Builder (10) proof arguments for complex
  conclusions
- Completed research plans from Research Plan Builder (02) document
  the scope of research

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Research Log (03) complete
- Document Analysis Worksheet (05) complete
- Timeline Builder (07) complete
- Fact Narrator v4 prompt integrated into AI layer
- Report storage table designed and added to /docs/architecture.md
