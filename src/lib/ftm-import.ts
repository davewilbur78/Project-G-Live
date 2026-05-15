/**
 * Shared constants and helpers for the FTM import pipeline.
 * Used by both /api/ftm-import and /api/ftm-import/status routes.
 *
 * NOTE: This module uses Node.js fs APIs.
 * Import only from server-side code (API routes). Never from client components.
 */

import { existsSync, readFileSync, unlinkSync } from 'fs'

export const FTM_LOG_FILE     = '/tmp/ftm_import_log.txt'
export const FTM_LOCK_FILE    = '/tmp/ftm_import.lock'
export const FTM_DEFAULT_PATH = '/Users/dave/ftm playground /Mom plus 1 generation.ftm'

/**
 * Returns true if an import is currently running.
 * Automatically clears stale lock files older than 15 minutes.
 * A stale lock means the import process crashed without cleaning up.
 */
export function isImportRunning(): boolean {
  if (!existsSync(FTM_LOCK_FILE)) return false
  try {
    const started = Number(readFileSync(FTM_LOCK_FILE, 'utf8').trim())
    if (!isNaN(started) && Date.now() - started > 15 * 60 * 1000) {
      // Stale lock (>15 min) -- auto-clear
      try { unlinkSync(FTM_LOCK_FILE) } catch { /* ignore */ }
      return false
    }
    return true
  } catch {
    return false
  }
}
