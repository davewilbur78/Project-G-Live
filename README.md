# Project-G-Live

Personal Genealogy Operations Platform

A modular web application supporting serious genealogical research
and professional development toward BCG certification. Built for
one user. Not a replacement for Ancestry.com or FamilyTreeMaker --
a working and documentation layer on top of them.

## For AI Agents

If you are an AI beginning a session on this project, your first
step is to fetch AGENT.md via the GitHub API:

```
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
```

Decode the base64 content field. Read the full file before doing
anything else. AGENT.md is the single source of truth.

Do not use raw.githubusercontent.com -- it is CDN-cached and
may not reflect the current committed version.

## About

This platform enforces the Genealogical Proof Standard (GPS) in
plain language and structures research to produce defensible
conclusions. It integrates with an existing Ashkenazi Jewish
genealogy and DNA research workflow.

## AI-Agnostic

This project is designed to work with any AI platform. Perplexity,
Claude.ai, Claude Code, or any future AI with GitHub access can
read, write, build, and commit. GitHub is the persistent memory.
No AI owns the project.

## Stack

Next.js · React · Tailwind CSS · Supabase · Anthropic Claude API · Vercel

## Structure

```
/prototypes/    -- HTML prototype files
/docs/          -- Architecture, module specs, research output
/src/           -- Application source code
```
