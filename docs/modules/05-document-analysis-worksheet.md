# Module 05: Document Analysis Worksheet

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Applies the Three-Layer Evidence Model to any uploaded document --
transcription, fact extraction, and full GPS classification of every claim.

## Status

NOT STARTED -- Design phase.

## Description

The Document Analysis Worksheet applies the Three-Layer Evidence Model
to any uploaded document. Layer one classifies the source itself
(Original, Derivative, or Authored). Layer two classifies the information
within the source (Primary or Secondary, based on what the informant could
have known firsthand). Layer three classifies the evidence produced by
each fact claim (Direct, Indirect, or Negative). The OCR-HTR Transcription
Tool v08 handles handwritten documents on upload. The Fact Extractor v4
then extracts discrete factual claims from the transcription. Each claim
is individually classified and stored with its citation, ready for use
in timelines, conflict analysis, and proof arguments.

## Key Inputs

- Uploaded document (image or scan)
- Citation record from Citation Builder (04) for the document being
  analyzed

## Key Outputs

- Transcription of the document text (for handwritten documents, via
  OCR-HTR)
- List of discrete factual claims extracted from the transcription
- Three-Layer classification for each claim:
  - Source type: Original, Derivative, or Authored
  - Information type: Primary or Secondary
  - Evidence type: Direct, Indirect, or Negative

## GPS Touchpoints

- Applies the Three-Layer Evidence Model, the core analytical framework
  of the GPS
- Supports analysis and correlation of evidence (GPS element 3) by
  classifying every claim before it enters any proof argument
- Ensures Direct, Indirect, and Negative evidence are distinguished
  throughout -- never conflated
- Classified facts provide the building blocks for the proof argument
  (GPS element 5)

## Prompt Engines Used

- **OCR-HTR Transcription Tool v08** (Steve Little) -- transcribes
  handwritten and printed documents on upload
- **Fact Extractor v4** (Steve Little) -- extracts discrete factual
  claims from the transcription
- **GRA v8.5c** -- GPS enforcement layer applied across all
  classification output

## Data Written to Supabase

- `documents` -- document record with transcription text and file
  reference
- `citations` -- evidence classification attached to each extracted
  fact claim, linked to the source record

## Connection to Other Modules

- Receives citation records from Citation Builder (04)
- Extracted and classified facts feed Timeline Builder (07) as dateable
  events
- Conflicting claims between documents surface in Source Conflict
  Resolver (06)
- Classified facts are used directly in Case Study Builder (10) proof
  arguments
- Transcriptions and fact lists are drawn into Research Report Writer (09)
- Generated file names from File Naming System (13) are stored with the
  document record

## Build Notes

Prerequisites:
- Citation Builder (04) complete -- every document analyzed must have
  a citation record first
- OCR-HTR Transcription Tool v08 prompt integrated into AI layer
- Fact Extractor v4 prompt integrated into AI layer
- `documents` table defined in Supabase schema

Note: The document viewer wishlist item (source images rendering inline)
belongs here. Design the document record panel with this in mind even
if the viewer is not built initially.
