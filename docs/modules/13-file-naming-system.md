# Module 13: File Naming System

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Standardized file names and folder structures for all research documents
and downloads -- every file permanently traceable back to its citation.

## Status

NOT STARTED -- Design phase.

## Description

The File Naming System generates standardized file names and folder
structures for all research documents, images, and downloads. A
consistent naming convention is essential for a research collection
that spans decades and thousands of files. The module applies a
configurable naming schema -- typically encoding the subject surname,
given name, record type, date, and repository in the filename -- and
generates the correct name for any document based on its citation
metadata. The module also suggests the correct folder path within the
researcher's local archive structure. File names generated here are
stored in Supabase alongside the document record so files can always
be located and re-cited.

## Key Inputs

- Document citation metadata from Citation Builder (04): subject
  surname, given name, record type, date, repository
- Document record from the `documents` table

## Key Outputs

- Standardized file name encoding the subject, record type, date,
  and repository
- Suggested folder path within the researcher's local archive structure

## GPS Touchpoints

- Supports complete and accurate citations (GPS element 2) by ensuring
  every file can always be located and re-cited
- Maintains research trail integrity by keeping file names and citation
  records permanently linked in Supabase

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied to naming conventions
  and output

## Data Written to Supabase

- `documents` -- generated file name stored alongside the document
  record so files remain locatable and re-citable

## Connection to Other Modules

- Receives citation metadata from Citation Builder (04) to construct
  the file name
- Generated file names are stored with document records that feed
  Document Analysis Worksheet (05)

## Build Notes

This module is standalone -- it needs only Citation Builder (04)
as a prerequisite. It can be built at any point after Citation Builder
is complete.

Prerequisites:
- Citation Builder (04) complete
