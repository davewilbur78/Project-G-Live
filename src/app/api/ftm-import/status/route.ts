/**
 * GET /api/ftm-import/status
 *
 * Returns current running state and full log content.
 * Poll this route while an import is in progress.
 *
 * Response: { running: boolean, log: string }
 */

import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import { isImportRunning, FTM_LOG_FILE } from '@/lib/ftm-import'

export const runtime = 'nodejs'

export async function GET() {
  const running = isImportRunning()

  let log = ''
  if (existsSync(FTM_LOG_FILE)) {
    try {
      log = readFileSync(FTM_LOG_FILE, 'utf8')
    } catch { /* ignore read errors */ }
  }

  return NextResponse.json({ running, log })
}
