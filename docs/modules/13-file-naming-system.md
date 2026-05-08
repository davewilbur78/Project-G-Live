# Module 13: File Naming System

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Standardized file naming and folder structure generator.

## Status

Design phase. Not yet built.

## What It Does

The File Naming System generates standardized file names and folder structures for all research documents. Consistent naming is essential for managing large document collections and for producing citations that can be verified.

## Naming Convention

File names encode:
- Subject surname (standardized)
- Subject given name
- Document type
- Date (YYYY or YYYY-MM-DD)
- Repository abbreviation
- Sequence number if multiple documents of same type

Example: `Singer_Jacob_NatPetition_1919_NARA-M1972.pdf`

## Folder Structure

Standardized hierarchy:
```
/Research/
  /Surnames/
    /Singer/
      /Jacob_Singer/
        /Vital_Records/
        /Census/
        /Immigration/
        /Naturalization/
        /Military/
        /Correspondence/
```

## Integration

When a document is uploaded to Supabase storage, the File Naming System generates the standardized name and path. The document record in the `documents` table stores the standardized name alongside the Supabase storage URL.

## Data Written

- `documents` table: standardized file name and folder path
