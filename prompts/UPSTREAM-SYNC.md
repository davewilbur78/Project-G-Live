# Prompt Engine Upstream Sync

TIMESTAMP last updated: 2026-05-12 00:35 UTC
Source repository: https://github.com/DigitalArchivst/Open-Genealogy
License: CC BY-NC-SA 4.0
Project-G-Live is personal and non-commercial -- use fully within license terms.
Author: Steve Little (@DigitalArchivst)

---

## Why This File Exists

Steve Little releases updated prompt versions regularly (GRA v8.5.1c in March 2026,
v8.5.2c in April 2026). Version changes are detectable by filename -- he encodes
the version in the filename itself (e.g. gra-v8.5.2c.md). This file tracks every
engine we have: what version, when we downloaded it, and where it lives upstream.

This file is the authoritative record for the prompt library. Claude reads it at
session start when the prompt library is discussed. Update it any time a file is
added, updated, or excluded.

---

## Sync Protocol

### Recommended cadence
- Monthly: check Steve's repo for version number changes in files we use
- After Steve announces updates on Vibe Genealogy Substack (vibegenealogy.substack.com)
- Before any module build that uses a specific engine -- confirm version is current
- After any Steve Little social post mentioning a new version or release

### How to perform a sync check (from local machine)

1. Clone or update Steve's repo locally:
   ```bash
   # First time:
   git clone https://github.com/DigitalArchivst/Open-Genealogy.git /tmp/open-genealogy

   # Subsequent times:
   cd /tmp/open-genealogy && git pull
   ```

2. Compare filenames in Steve's directories against our /prompts/ directory:
   ```bash
   # Example: check research directory
   ls /tmp/open-genealogy/research/
   ls /Users/dave/Project-G-Live/prompts/research/

   # Check writing tools
   ls /tmp/open-genealogy/writing-tools/
   ls /Users/dave/Project-G-Live/prompts/writing/
   ```
   A filename change (e.g. gra-v8.5.2c.md becoming gra-v8.5.3.md) means a new
   version is available.

3. For any new version, copy the file to the right place in /prompts/:
   ```bash
   # Example: new GRA version
   cp /tmp/open-genealogy/research/gra-v8.5.3.md \
      /Users/dave/Project-G-Live/prompts/research/gra-v8.5.3.md
   ```
   Keep the old file in /prompts/ until the new version is confirmed working.
   Update ENGINE_FILES in src/lib/ai.ts to point to the new filename.

4. Commit the new file and update this sync file:
   ```bash
   cd /Users/dave/Project-G-Live
   git add prompts/research/gra-v8.5.3.md prompts/UPSTREAM-SYNC.md
   git commit -m "prompts: update gra to v8.5.3 from upstream -- TIMESTAMP: YYYY-MM-DD HH:MM UTC"
   git push
   ```

5. Tell Claude in the next session: "I updated the GRA to v8.5.3." Claude will
   update ENGINE_FILES in ai.ts and AGENT.md accordingly.

---

## What We Have

All 15 files below are committed to /prompts/. Last full sync check: 2026-05-12.

| Engine Key | Our File | Version | Downloaded | Steve's Upstream Path |
|------------|----------|---------|------------|-----------------------|
| gra | gra-v8.5.2c.md | v8.5.2c | 2026-05-11 | research/gra-v8.5.2c.md |
| research_agent | research-agent-assignment-v2.1.md | v2.1 | 2026-05-11 | research/research-agent-assignment-v2.1.md |
| research_assistant | research-assistant-v8.md | v8 | 2026-05-12 | research/research-assistant-v8.md |
| ocr_htr | ocr-htr-v08.md | v08 | 2026-05-11 | transcription/ocr-htr-v08.md |
| jewish_transcription | jewish-transcription-v2.md | v2 | 2026-05-11 | transcription/jewish-transcription-v2.md |
| deep_look | deep-look-v2.md | v2 | 2026-05-11 | image-analysis/deep-look-v2.md |
| hebrew_headstone | hebrew-headstone-helper-v9.md | v9 | 2026-05-11 | hebrew-headstones/hebrew-headstone-helper-v9.md |
| fact_extractor | fact-extractor-v4.md | v4 | 2026-05-11 | writing-tools/fact-extractor-v4.md |
| fact_narrator | fact-narrator-v4.md | v4 | 2026-05-11 | writing-tools/fact-narrator-v4.md |
| narrative_assistant | narrative-assistant-v3.md | v3 | 2026-05-11 | writing-tools/narrative-assistant-v3.md |
| linguistic_profiler | linguistic-profiler-v3.md | v3 | 2026-05-11 | writing-tools/linguistic-profiler-v3.md |
| lingua_maven | lingua-maven-v9.md | v9 | 2026-05-12 | writing-tools/lingua-maven-v9.md |
| conversation_abstractor | conversation-abstractor-v2.md | v2 | 2026-05-11 | writing-tools/conversation-abstractor-v2.md |
| document_distiller | document-distiller-v2.md | v2 | 2026-05-11 | writing-tools/document-distiller-v2.md |
| image_citation_builder | image-citation-builder-v2.md | v2 | 2026-05-11 | writing-tools/image-citation-builder-v2.md |

---

## Still to Fetch

None. All engines in the integration plan are now committed and live.

---

## Excluded from Integration

These Steve Little files exist in his repo but were explicitly evaluated and excluded.
Do not re-evaluate without a specific reason documented here.

| File / Directory | Reason for Exclusion | Decided |
|-----------------|----------------------|---------|
| photo-restoration/restoration-v2.md | Claude's own vision capabilities for photo restoration must be evaluated first. Dave has achieved strong restoration results using Claude directly with good prompts. Do not default to a third-party API. Revisit when platform is ready for photo features. | 2026-05-11 |
| assistants/news-hound-*.md | Too generic. Not genealogically specific. Not relevant to research workflow. | 2026-05-11 |
| writing-tools/event-materials-synthesizer-*.md | Not relevant to core genealogical research workflow. | 2026-05-11 |
| writing-tools/quick-editor-*.md | Redundant with narrative-assistant-v3. Adds no functionality we don't already have. | 2026-05-11 |
| gpt-configs/* | ChatGPT-specific configuration files. Not applicable to Claude API integration. | 2026-05-11 |
| media/* | Educational and media content only. Not prompt engineering. | 2026-05-11 |
| benchmark/* | AI evaluation framework. Interesting but not part of the application. May revisit for quality testing. | 2026-05-11 |

---

## Directory Mapping: Steve's Repo to Our /prompts/

Steve's upstream directory structure does not exactly match ours. This table
is the authoritative mapping.

| Steve's Directory | Our /prompts/ Subdirectory |
|-------------------|---------------------------|
| research/ | prompts/research/ |
| transcription/ | prompts/transcription/ |
| image-analysis/ | prompts/image-analysis/ |
| hebrew-headstones/ | prompts/image-analysis/ (same folder) |
| writing-tools/ | prompts/writing/ |

Note: Steve's writing-tools/ maps to our prompts/writing/ (shorter name).
Note: Hebrew headstone prompts live in Steve's hebrew-headstones/ but we
store them in prompts/image-analysis/ alongside other visual analysis engines.

---

## Update Log

| Date | Action | Who |
|------|--------|-----|
| 2026-05-11 | Initial download: 13 engine files committed to /prompts/ | Claude (session) |
| 2026-05-11 | UPSTREAM-SYNC.md created | Claude (session) |
| 2026-05-12 | Fetched research-assistant-v8.md + lingua-maven-v9.md via GitHub connector | Claude (session) |
| 2026-05-12 | ENGINE_FILES in ai.ts: uncommented research_assistant + lingua_maven | Claude (session) |
