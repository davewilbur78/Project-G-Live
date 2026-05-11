# Project-G-Live Prompt Engine Library

TIMESTAMP established: 2026-05-11 19:15 UTC

This directory contains the AI prompt engines powering Project-G-Live's research,
transcription, image analysis, and writing modules.

The majority of prompts in this library are authored by **Steve Little**
(@DigitalArchivst) and distributed under the
**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International**
(CC BY-NC-SA 4.0) license. Project-G-Live is a personal, non-commercial
research platform. All Steve Little prompts are used in strict accordance
with the CC BY-NC-SA 4.0 terms.

Upstream repository: https://github.com/DigitalArchivst/Open-Genealogy
Steve's Substack: https://vibegenealogy.ai

---

## How Engines Are Used

Engines are loaded by the engine registry in `src/lib/ai.ts` via a
`callWithEngine(engineName, content, context)` function. No engine prompt
is hardcoded inline in an API route. Each route imports the engine by name.

The GRA (Genealogical Research Assistant) is not one engine among many.
It is the **base enforcement layer** -- composed into every research-facing
API call. It cannot be removed from research routes.

---

## Directory Structure

```
/prompts/
  /research/
    gra-v8.5.2c.md                  -- GPS enforcement layer (base, always present)
    research-agent-assignment-v2.1.md -- Research Plan Builder logic
    research-with-citations-v7.md   -- TODO: fetch from upstream
    research-assistant-v8.md        -- TODO: fetch full 700-line version from upstream

  /transcription/
    ocr-htr-v08.md                  -- General diplomatic transcription
    jewish-transcription-v2.md      -- Specialized Jewish document transcription

  /image-analysis/
    deep-look-v2.md                 -- 9-layer forensic image analysis
    hebrew-headstone-helper-v9.md   -- 10-phase headstone analysis with gematria

  /writing/
    fact-extractor-v4.md            -- Structured LABEL: Value extraction
    fact-narrator-v4.md             -- Assertions to narrative prose
    narrative-assistant-v3.md       -- GPS-informed narrative (3 modes)
    linguistic-profiler-v3.md       -- Writer voice fingerprinting
    conversation-abstractor-v2.md   -- Session/interview summarization
    document-distiller-v2.md        -- Document summarization and action extraction
    image-citation-builder-v2.md    -- Image provenance citation (layered model)
    lingua-maven-v9.md              -- TODO: fetch from upstream
```

---

## Module-Engine Mapping

| Module | Primary Engines | Notes |
|--------|----------------|-------|
| 2 Research Plan Builder | research-agent-assignment-v2.1, gra | Replaces inline approximation |
| 3 Research Log | conversation-abstractor-v2, gra | Session summaries |
| 4 Citation Builder | image-citation-builder-v2, gra | Image/photo citations |
| 5 Document Analysis | ocr-htr-v08, jewish-transcription-v2, deep-look-v2, hebrew-headstone-v9, fact-extractor-v4, gra | Full input pipeline |
| 6 Source Conflict Resolver | gra | GPS enforcement |
| 7 Timeline Builder | gra | Address normalization |
| 9 Research Report Writer | narrative-assistant-v3, linguistic-profiler-v3, fact-narrator-v4, document-distiller-v2, gra | Full writing pipeline |
| 10 Case Study Builder | gra | GPS enforcement throughout |
| 16 Research Investigation | gra, conversation-abstractor-v2 | Core investigation workspace |

---

## Photo Restoration (Future)

Steve Little's restoration methodology (restoration-v2.md et al.) describes
quality standards and philosophy that apply regardless of which image model
performs the restoration. The correct API (Replicate, Adobe Firefly, or
other) has not yet been selected. This is a last-priority build item.
Claude's own vision capabilities for photo analysis should not be
understimated -- Dave has achieved strong restoration results using Claude
directly with good prompts. Evaluate before committing to a third-party API.

---

## Attribution

All Steve Little prompts:
- Author: Steve Little (@DigitalArchivst)
- License: CC BY-NC-SA 4.0
- Upstream: https://github.com/DigitalArchivst/Open-Genealogy
- Usage: Personal non-commercial research only per license terms

Project-G-Live original prompts (none yet -- to be added as built):
- License: Private
