/**
 * FTM Import API
 *
 * GET  /api/ftm-import  -- current FTM import stats from Supabase
 * POST /api/ftm-import  -- trigger the import script (fire-and-forget)
 *
 * The import script (scripts/import-ftm.mjs) runs as a detached child process.
 * stdout/stderr are captured to FTM_LOG_FILE.
 * FTM_LOCK_FILE tracks running state.
 * Poll /api/ftm-import/status for live log and running status.
 *
 * Local only: the import requires the compiled ARM64 ftm-extractor binary
 * and the FTM 2024 .ftm file on Dave's Mac. Will not run on Vercel.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { spawn } from 'child_process'
import { writeFileSync, appendFileSync, unlinkSync, existsSync } from 'fs'
import { resolve } from 'path'
import { isImportRunning, FTM_LOG_FILE, FTM_LOCK_FILE, FTM_DEFAULT_PATH } from '@/lib/ftm-import'

export const runtime = 'nodejs'

const PROJECT_ROOT = resolve(process.cwd())

// ---------------------------------------------------------------------------
// GET -- current FTM import stats from Supabase
// ---------------------------------------------------------------------------

export async function GET() {
  // Fetch all FTM persons (ancestry_id LIKE 'ftm:%')
  // Ordered by updated_at desc so [0] gives us the last-imported timestamp.
  // NOTE: .in() with >500 UUIDs may need chunking for the full ~1500-person tree.
  const { data: ftmPersons, error: personErr } = await supabase
    .from('persons')
    .select('id, updated_at')
    .like('ancestry_id', 'ftm:%')
    .order('updated_at', { ascending: false })

  if (personErr) {
    console.error('GET /api/ftm-import persons error:', personErr)
    return NextResponse.json({ error: personErr.message }, { status: 500 })
  }

  const ftmPersonIds = (ftmPersons ?? []).map(p => p.id as string)
  const lastImported = ftmPersons?.[0]?.updated_at ?? null

  // Source count (FTM-imported sources are marked with collection = 'FTM Import')
  const { count: sourceCount, error: sourceErr } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true })
    .eq('collection', 'FTM Import')

  if (sourceErr) console.error('GET /api/ftm-import sources error:', sourceErr)

  let tlEventCount   = 0
  let tlSourcedCount = 0
  let familyCount    = 0

  if (ftmPersonIds.length > 0) {
    const [evAll, evSourced, famRows] = await Promise.all([
      // Total timeline events for FTM persons
      supabase
        .from('timeline_events')
        .select('*', { count: 'exact', head: true })
        .in('person_id', ftmPersonIds),

      // Sourced (GPS evidence chain wired) timeline events
      supabase
        .from('timeline_events')
        .select('*', { count: 'exact', head: true })
        .in('person_id', ftmPersonIds)
        .not('source_id', 'is', null),

      // Family membership rows -- deduplicated in JS to get distinct family count
      supabase
        .from('family_members')
        .select('family_id')
        .in('person_id', ftmPersonIds),
    ])

    tlEventCount   = evAll.count   ?? 0
    tlSourcedCount = evSourced.count ?? 0
    familyCount    = new Set(
      (famRows.data ?? []).map((r: { family_id: string }) => r.family_id)
    ).size
  }

  return NextResponse.json({
    persons:         ftmPersonIds.length,
    sources:         sourceCount ?? 0,
    families:        familyCount,
    timeline_events: tlEventCount,
    sourced_events:  tlSourcedCount,
    last_imported:   lastImported,
    running:         isImportRunning(),
  })
}

// ---------------------------------------------------------------------------
// POST -- trigger the import script
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Reject if import already running
  if (isImportRunning()) {
    return NextResponse.json({ error: 'Import already running' }, { status: 409 })
  }

  // Parse optional body: { ftm_path?: string }
  let ftmPath = FTM_DEFAULT_PATH
  try {
    const body = await request.json()
    if (typeof body?.ftm_path === 'string' && body.ftm_path.trim()) {
      ftmPath = body.ftm_path.trim()
    }
  } catch { /* body is optional */ }

  // Write lock and initialise log
  const startedAt = Date.now()
  writeFileSync(
    FTM_LOG_FILE,
    `--- Import started ${new Date(startedAt).toISOString()} ---\nFTM path: ${ftmPath}\n\n`
  )
  writeFileSync(FTM_LOCK_FILE, String(startedAt))

  // Spawn the import script as a detached child process
  const proc = spawn('node', ['scripts/import-ftm.mjs', ftmPath], {
    cwd:      PROJECT_ROOT,
    detached: true,
    stdio:    ['ignore', 'pipe', 'pipe'],
    env:      { ...process.env },
  })

  proc.stdout?.on('data', (chunk: Buffer) => {
    try { appendFileSync(FTM_LOG_FILE, chunk.toString()) } catch { /* ignore */ }
  })
  proc.stderr?.on('data', (chunk: Buffer) => {
    try { appendFileSync(FTM_LOG_FILE, chunk.toString()) } catch { /* ignore */ }
  })
  proc.on('close', (code: number | null) => {
    try {
      appendFileSync(
        FTM_LOG_FILE,
        `\n--- Finished ${new Date().toISOString()} (exit ${code ?? '?'}) ---\n`
      )
      if (existsSync(FTM_LOCK_FILE)) unlinkSync(FTM_LOCK_FILE)
    } catch { /* ignore */ }
  })
  proc.on('error', (err: Error) => {
    try {
      appendFileSync(FTM_LOG_FILE, `\nFATAL: ${err.message}\n--- Aborted ---\n`)
      if (existsSync(FTM_LOCK_FILE)) unlinkSync(FTM_LOCK_FILE)
    } catch { /* ignore */ }
  })
  proc.unref() // don't block the Node.js event loop

  return NextResponse.json({ status: 'started' })
}
