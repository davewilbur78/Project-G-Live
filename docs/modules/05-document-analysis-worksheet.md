# Module 05: Document Analysis Worksheet

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Three-Layer Model classifier applying GPS source/information/evidence analysis to every document.

## Status

Design phase. Not yet built.

## What It Does

When a researcher uploads or references a document, this module guides a structured analysis using the GPS Three-Layer Model:

**Layer 1 -- Source Analysis**
What is this document physically? Is it an original record, a derivative (transcription, abstract, photocopy), or an authored work? What is its provenance?

**Layer 2 -- Information Analysis**
Who provided the information in this document? Was the informant present at the event (primary information) or reporting after the fact (secondary information)? What did they know and when?

**Layer 3 -- Evidence Analysis**
How does the information in this document answer the research question? Is it direct evidence (directly answers the question), indirect evidence (contributes to answering the question), or negative evidence (absence of expected information)?

## OCR and Transcription

When a document image is uploaded, the OCR-HTR Transcription Tool runs first to produce a text transcription. The Fact Extractor then identifies discrete factual claims. The worksheet guides analysis of those claims.

## Prompt Engines

- OCR-HTR Transcription Tool v08 (Steve Little): document transcription
- Fact Extractor v4 (Steve Little): extracts discrete factual claims
- GRA v8.5c (Steve Little): GPS enforcement throughout

## Data Written

- `documents` table: transcription, source layer analysis, information layer analysis, evidence layer analysis
- `sources` table: updated with Three-Layer classification
