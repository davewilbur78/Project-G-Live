#!/usr/bin/env node
/**
 * FTM → Supabase importer
 *
 * Reads directly from the encrypted FTM SQLite database and upserts
 * data into the Project-G-Live Supabase schema.
 *
 * Usage:
 *   node scripts/import-ftm.mjs [options] [path-to-ftm-file]
 *
 * Options:
 *   --dry-run       Print what would be imported, don't write to Supabase
 *   --skip-extract  Reuse /tmp/ftm_data.json from a previous run
 *
 * Re-import is fully idempotent — no manual cleanup required.
 * Families and timeline_events are deleted and re-inserted on each run.
 * Persons, repositories, and sources are upserted in-place.
 * ftm_notes are upserted on (person_id, ftm_note_id).
 *
 * Requirements:
 *   - scripts/ftm-extractor must be compiled (see scripts/ftm-extractor.c)
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
 *     (loaded from .env.local automatically)
 *
 * Import order (respects FK deps):
 *   1. repositories
 *   2. persons
 *   3. sources  (FK → repositories)
 *   3.5. cleanup: delete prior FTM families + timeline_events
 *   4. families (FK → persons)
 *   5. family_members (FK → persons + families)
 *   6. timeline_events (FK → persons, sources)
 *   8. ftm_notes (FK → persons) [Phase 7 = person_external_ids, handled separately]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

/* ------------------------------------------------------------------ */
/* Config                                                               */
/* ------------------------------------------------------------------ */

const __dir = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dir, '..');
const EXTRACTOR_BIN = join(__dir, 'ftm-extractor');
const JSON_DUMP = '/tmp/ftm_data.json';
const FTM_FRAMEWORKS = '/Applications/Family Tree Maker 2024.app/Contents/Frameworks';
const FTM_DEFAULT_PATH = '/Users/dave/ftm playground /Mom plus 1 generation.ftm';
const CHANGEDBY = 'FTM Import';

/* ------------------------------------------------------------------ */
/* CLI args                                                             */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_EXTRACT = args.includes('--skip-extract');
const ftmPath = args.find(a => !a.startsWith('--')) ?? FTM_DEFAULT_PATH;

/* ------------------------------------------------------------------ */
/* Load env from .env.local                                            */
/* ------------------------------------------------------------------ */

function loadEnv() {
  const envFile = join(PROJECT_ROOT, '.env.local');
  if (!existsSync(envFile)) return;
  const lines = readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Date decoding: FTM stores dates as JDN * 512 + flags               */
/* ------------------------------------------------------------------ */

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function jdnToGregorian(jdn) {
  const l  = jdn + 68569;
  const n  = Math.floor(4 * l / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i  = Math.floor(4000 * (l2 + 1) / 1461001);
  const l3 = l2 - Math.floor(1461 * i / 4) + 31;
  const j  = Math.floor(80 * l3 / 2447);
  const day   = l3 - Math.floor(2447 * j / 80);
  const l4    = Math.floor(j / 11);
  const month = j + 2 - 12 * l4;
  const year  = 100 * (n - 49) + i + l4;
  return { year, month, day };
}

/**
 * Decode an FTM date integer.
 * Returns { display: string|null, sort: string|null, qualifier: string }
 * where sort is an ISO date string suitable for a Postgres DATE column.
 */
function decodeFTMDate(n, modifier = 0) {
  if (!n || n === 0) return { display: null, sort: null, qualifier: 'exact' };

  // Date range "startInt:endInt" → decode start
  const raw = String(n);
  const colonIdx = raw.indexOf(':');
  let mainInt = colonIdx > 0 ? parseInt(raw.slice(0, colonIdx), 10) : n;

  const flags = mainInt & 0x1FF;
  const jdn   = Math.floor(mainInt / 512);
  if (jdn < 1000000) return { display: null, sort: null, qualifier: 'exact' }; // bogus

  const { year, month, day } = jdnToGregorian(jdn);
  if (year < 1 || year > 2100) return { display: null, sort: null, qualifier: 'exact' };

  // qualifier from DateModifier1
  const QUALIFIERS = { 0: 'exact', 1: 'about', 2: 'before', 3: 'after', 4: 'calculated', '-1': 'about' };
  const qualifier = QUALIFIERS[modifier] ?? 'exact';
  const prefix    = qualifier === 'about' ? 'abt ' : qualifier === 'before' ? 'bef ' : qualifier === 'after' ? 'aft ' : '';

  // Precision from flags
  const yearOnly      = (flags & 0xC0) === 0xC0;
  const yearMonthOnly = !yearOnly && (flags & 0x40) === 0x40;

  let display, sort;
  if (yearOnly) {
    display = `${prefix}${year}`;
    sort    = `${year}-01-01`;
  } else if (yearMonthOnly) {
    display = `${prefix}${MONTHS_SHORT[month - 1]} ${year}`;
    sort    = `${year}-${String(month).padStart(2, '0')}-01`;
  } else {
    display = `${prefix}${day} ${MONTHS_SHORT[month - 1]} ${year}`;
    sort    = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return { display, sort, qualifier };
}

/* ------------------------------------------------------------------ */
/* Place parsing: FTM uses two formats                                 */
/* ------------------------------------------------------------------ */

function parseFTMPlace(name) {
  if (!name) return null;
  // Format 1: /Display Name|// → everything between first / and first |
  if (name.includes('|')) {
    return name.split('|')[0].replace(/^\/+/, '').trim() || null;
  }
  // Format 2: /city/address/county/state/country/numericCode/lat/lon
  // Filter out empty parts, numeric codes, and lat/lon values
  const parts = name.split('/')
    .map(p => p.trim())
    .filter(p => p.length > 0 && !/^-?\d+(\.\d+)?$/.test(p));
  return parts.length > 0 ? parts.join(', ') : null;
}

/* ------------------------------------------------------------------ */
/* GEDCOM name cleaner: strips /Surname/ delimiters from name strings  */
/* ------------------------------------------------------------------ */

function cleanGedcomName(text) {
  if (!text) return null;
  // GEDCOM format wraps surnames in forward slashes: "Given /Surname/ Suffix"
  return text.replace(/\/([^/]*)\//g, '$1').replace(/\s+/g, ' ').trim() || null;
}

/* ------------------------------------------------------------------ */
/* RTF stripper (rough but effective for genealogy notes)              */
/* ------------------------------------------------------------------ */

function stripRTF(rtf) {
  if (!rtf) return null;
  let s = rtf
    .replace(/\{\\[^}]{0,200}\}/g, ' ')  // remove header/table groups
    .replace(/\\[a-z*]+\d*\s?/gi, '')    // remove control words
    .replace(/\\'/g, '')                  // remove hex escapes
    .replace(/[{}]/g, '')                 // remove remaining braces
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s || null;
}

/* ------------------------------------------------------------------ */
/* Sex mapping                                                          */
/* ------------------------------------------------------------------ */

function ftmSex(v) {
  if (v === 0 || v === '0') return 'M';
  if (v === 1 || v === '1') return 'F';
  return 'U';
}

/* ------------------------------------------------------------------ */
/* Child relationship nature mapping                                   */
/* ------------------------------------------------------------------ */

function ftmNature(n) {
  const map = { 0: 'natural', 1: 'adopted', 2: 'step', 3: 'foster' };
  return map[n] ?? 'unknown';
}

/* ------------------------------------------------------------------ */
/* GEDCOM tag → our event_type                                         */
/* ------------------------------------------------------------------ */

const TAG_TO_EVENT = {
  BIRT: 'birth',   DEAT: 'death',   MARR: 'marriage', DIV:  'divorce',
  RESI: 'residence', IMMI: 'immigration', EMIG: 'emigration',
  NATU: 'naturalization', MILI: 'military_service',
  OCCU: 'occupation', LAND: 'land_record', CENS: 'census',
  BAPM: 'baptism', BURI: 'burial', EDUC: 'education',
};

function tagToEventType(tag) {
  return TAG_TO_EVENT[tag] ?? 'other';
}

/* ------------------------------------------------------------------ */
/* Repository type heuristic                                           */
/* ------------------------------------------------------------------ */

function guessRepoType(name) {
  if (!name) return 'other';
  const n = name.toLowerCase();
  if (n.includes('ancestry') || n.includes('familysearch') || n.includes('findmypast')
      || n.includes('newspapers') || n.includes('findagrave') || n.includes('fold3')
      || n.includes('www.') || n.includes('http')) return 'online';
  if (n.includes('archive') || n.includes('nara') || n.includes('national')) return 'archive';
  if (n.includes('library') || n.includes('librar')) return 'library';
  if (n.includes('court') || n.includes('county clerk')) return 'courthouse';
  if (n.includes('church') || n.includes('synagogue') || n.includes('parish')) return 'church';
  return 'other';
}

/* ------------------------------------------------------------------ */
/* Extract FTM data                                                    */
/* ------------------------------------------------------------------ */

function extractFTMData() {
  if (SKIP_EXTRACT && existsSync(JSON_DUMP)) {
    console.log(`Reusing existing ${JSON_DUMP}`);
    return JSON.parse(readFileSync(JSON_DUMP, 'utf8'));
  }

  if (!existsSync(EXTRACTOR_BIN)) {
    console.error(`Extractor binary not found: ${EXTRACTOR_BIN}`);
    console.error('Run: clang -arch arm64 -o scripts/ftm-extractor scripts/ftm-extractor.c');
    process.exit(1);
  }

  console.log(`Extracting from: ${ftmPath}`);
  const result = spawnSync(EXTRACTOR_BIN, [ftmPath], {
    env: { ...process.env, DYLD_FRAMEWORK_PATH: FTM_FRAMEWORKS },
    maxBuffer: 50 * 1024 * 1024,
  });

  if (result.status !== 0) {
    console.error('Extractor failed:', result.stderr?.toString() ?? 'unknown error');
    process.exit(1);
  }

  const json = result.stdout.toString('utf8');
  writeFileSync(JSON_DUMP, json);  // cache for --skip-extract
  const data = JSON.parse(json);
  console.log(`Extracted: ${data.persons.length} persons, ${data.facts.length} facts, `
    + `${data.masterSources.length} sources, ${data.relationships.length} families, `
    + `${data.notes?.length ?? 0} notes`);
  return data;
}

/* ------------------------------------------------------------------ */
/* Batch insert helper (Supabase has ~1000-row limit per call)        */
/* ------------------------------------------------------------------ */

async function batchInsert(sb, table, rows, chunkSize = 200) {
  let total = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error, count } = await sb.from(table).insert(chunk, { count: 'exact' });
    if (error) throw new Error(`Insert into ${table}: ${error.message}\nFirst row: ${JSON.stringify(chunk[0])}`);
    total += count ?? chunk.length;
  }
  return total;
}

async function batchUpsert(sb, table, rows, conflictCol, chunkSize = 200) {
  let total = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error, count } = await sb.from(table)
      .upsert(chunk, { onConflict: conflictCol, count: 'exact' });
    if (error) throw new Error(`Upsert into ${table}: ${error.message}`);
    total += count ?? chunk.length;
  }
  return total;
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  console.log(DRY_RUN ? '--- DRY RUN (no writes) ---' : '--- LIVE IMPORT ---');

  const data = extractFTMData();
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  /* ---- Phase 1: Repositories ---- */
  console.log('\n[1/8] Repositories...');
  const repoRows = data.repositories.map(r => ({
    name:         r.Name,
    type:         guessRepoType(r.Name),
    url:          r.Address?.startsWith('http') ? r.Address : null,
    address_line: r.Address?.startsWith('http') ? null : (r.Address || null),
    notes:        r.Email ? `Contact: ${r.Email}` : null,
  })).filter(r => r.name);

  // ftmRepoId → Supabase uuid
  const repoIdMap = new Map(); // ftm_id → supabase uuid

  if (!DRY_RUN) {
    for (const [i, row] of repoRows.entries()) {
      // Check existing by name
      const { data: existing } = await sb.from('repositories').select('id').eq('name', row.name).limit(1);
      if (existing?.length) {
        repoIdMap.set(data.repositories[i].ID, existing[0].id);
      } else {
        const { data: inserted, error } = await sb.from('repositories').insert(row).select('id').single();
        if (error) throw new Error(`Repository insert: ${error.message}`);
        repoIdMap.set(data.repositories[i].ID, inserted.id);
      }
    }
    console.log(`  ${repoRows.length} repositories processed`);
  } else {
    console.log(`  Would process ${repoRows.length} repositories`);
  }

  /* ---- Pre-Phase 2: Build alternate names map ---- */
  // FactClass=257 NAME and ALIA facts carry alternate name strings in Text field.
  // Text uses GEDCOM format (/Surname/ delimiters) — clean before storing.
  const altNamesMap = new Map();  // ftm person ID → deduplicated string[]
  for (const f of data.facts) {
    if (f.LinkTableID !== 5) continue;
    if (f.factTypeTag !== 'NAME' && f.factTypeTag !== 'ALIA') continue;
    const cleaned = cleanGedcomName(f.Text);
    if (!cleaned) continue;
    const set = altNamesMap.get(f.LinkID) ?? new Set();
    set.add(cleaned);
    altNamesMap.set(f.LinkID, set);
  }
  // Convert sets to arrays
  for (const [id, set] of altNamesMap) altNamesMap.set(id, [...set]);

  /* ---- Phase 2: Persons ---- */
  console.log('\n[2/8] Persons...');

  // Build notes map: ftm person id → combined note text (for persons.notes field)
  // Individual note rows are imported separately in Phase 8 (ftm_notes table).
  const personNotes = new Map();
  for (const n of (data.notes ?? [])) {
    if (n.LinkTableID === 5) {
      const stripped = stripRTF(n.NoteText);
      if (stripped) {
        const existing = personNotes.get(n.LinkID) ?? '';
        personNotes.set(n.LinkID, existing ? `${existing}\n\n${stripped}` : stripped);
      }
    }
  }

  const personRows = data.persons.map(p => {
    const birth = decodeFTMDate(p.BirthDate, 0);
    const death = decodeFTMDate(p.DeathDate, 0);
    return {
      ancestry_id:      `ftm:${p.ID}`,
      given_name:       p.GivenName || null,
      surname:          p.FamilyName || null,
      display_name:     p.FullName || [p.GivenName, p.FamilyName].filter(Boolean).join(' ') || null,
      suffix:           p.NameSuffix || null,
      sex:              ftmSex(p.Sex),
      private:          Boolean(p.Private),
      living:           false,  // FTM 2024 schema 20200615 has no IsLiving column
      alt_names:        altNamesMap.get(p.ID) ?? [],
      birth_date:       birth.display,
      birth_date_sort:  birth.sort,
      birth_place:      parseFTMPlace(p.BirthPlace),
      death_date:       death.display,
      death_date_sort:  death.sort,
      death_place:      parseFTMPlace(p.DeathPlace),
      notes:            personNotes.get(p.ID) ?? null,
      changedby:        CHANGEDBY,
    };
  });

  // ftm_id → supabase uuid (for FK lookups)
  const personIdMap = new Map();

  if (!DRY_RUN) {
    // Fetch existing FTM persons by ancestry_id (manual upsert since no unique constraint exists)
    const { data: existing, error: fetchErr } = await sb.from('persons')
      .select('id, ancestry_id')
      .like('ancestry_id', 'ftm:%');
    if (fetchErr) throw new Error(`Fetch persons: ${fetchErr.message}`);
    const existingIds = new Map((existing ?? []).map(p => [p.ancestry_id, p.id]));

    let inserted = 0, updated = 0;
    for (const [i, row] of personRows.entries()) {
      const existingId = existingIds.get(row.ancestry_id);
      if (existingId) {
        // Update existing
        const { ancestry_id, ...updateData } = row;
        const { error } = await sb.from('persons').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', existingId);
        if (error) throw new Error(`Person update: ${error.message}`);
        personIdMap.set(data.persons[i].ID, existingId);
        updated++;
      } else {
        // Insert new
        const { data: ins, error } = await sb.from('persons').insert(row).select('id').single();
        if (error) throw new Error(`Person insert: ${error.message}\nRow: ${JSON.stringify(row)}`);
        personIdMap.set(data.persons[i].ID, ins.id);
        inserted++;
      }
    }
    console.log(`  ${inserted} persons inserted, ${updated} updated`);
  } else {
    for (const [i, p] of data.persons.entries()) personIdMap.set(p.ID, `dry-run-uuid-${i}`);
    console.log(`  Would upsert ${personRows.length} persons`);
    console.log('  Sample:', JSON.stringify(personRows[0], null, 2));
  }

  /* ---- Phase 3: Sources ---- */
  console.log('\n[3/8] Sources (MasterSources)...');

  // ftm master_source_id → supabase source uuid
  const sourceIdMap = new Map();

  const sourceRows = data.masterSources.map(ms => {
    // Build ee_full_citation from available fields
    const parts = [ms.Title];
    if (ms.Author)            parts.push(`Author: ${ms.Author}`);
    if (ms.PublisherName)     parts.push(ms.PublisherName);
    if (ms.PublisherLocation) parts.push(ms.PublisherLocation);
    if (ms.PublishDate)       parts.push(ms.PublishDate);
    const fullCit = parts.join('. ');

    return {
      label:          ms.Title,
      source_type:    'Derivative',
      info_type:      'Undetermined',
      evidence_type:  'Indirect',
      ee_full_citation:  fullCit,
      ee_short_citation: ms.Title,
      collection:     'FTM Import',   // used as marker for idempotency
      repository_id:  ms.RepositoryID ? repoIdMap.get(ms.RepositoryID) ?? null : null,
    };
  });

  if (!DRY_RUN) {
    // Fetch existing FTM Import sources keyed by ee_full_citation
    const { data: existingSources, error: srcFetchErr } = await sb.from('sources')
      .select('id, ee_full_citation')
      .eq('collection', 'FTM Import');
    if (srcFetchErr) throw new Error(`Fetch sources: ${srcFetchErr.message}`);

    const existingByCitation = new Map((existingSources ?? []).map(s => [s.ee_full_citation, s.id]));

    const toInsert = [];
    const toInsertIndices = [];
    for (let i = 0; i < sourceRows.length; i++) {
      const existingId = existingByCitation.get(sourceRows[i].ee_full_citation);
      if (existingId) {
        sourceIdMap.set(data.masterSources[i].ID, existingId);
      } else {
        toInsert.push(sourceRows[i]);
        toInsertIndices.push(i);
      }
    }

    if (toInsert.length > 0) {
      for (let i = 0; i < toInsert.length; i += 200) {
        const chunk = toInsert.slice(i, i + 200);
        const idxChunk = toInsertIndices.slice(i, i + 200);
        const { data: inserted, error } = await sb.from('sources').insert(chunk).select('id');
        if (error) throw new Error(`Source insert: ${error.message}`);
        for (let j = 0; j < chunk.length; j++) {
          sourceIdMap.set(data.masterSources[idxChunk[j]].ID, inserted[j].id);
        }
      }
    }
    console.log(`  ${toInsert.length} sources inserted, ${sourceRows.length - toInsert.length} reused`);
  } else {
    console.log(`  Would insert/reuse ${sourceRows.length} sources`);
    // Populate sourceIdMap with placeholder values so the SourceLink wiring
    // report below produces a meaningful count in dry-run mode.
    for (const ms of data.masterSources) sourceIdMap.set(ms.ID, `dry-run-${ms.ID}`);
  }

  /* ---- Build source chain map (SourceLink wiring) ---- */
  // Build sourceCitation → masterSource map
  const citationToMasterMap = new Map();
  for (const sc of data.sourceCitations) {
    citationToMasterMap.set(sc.ID, sc.MasterSourceID);
  }

  // LinkTableID=2 is FTM's internal Fact table ID — confirmed from test file diagnostic.
  // All SourceLinks in this schema version link to Fact records.
  const factSourceMap = new Map();  // ftm fact ID → supabase source UUID
  for (const sl of data.sourceLinks) {
    if (sl.LinkTableID !== 2) continue;  // only Fact-linked sourceLinks
    const masterSourceId = citationToMasterMap.get(sl.SourceID);
    if (masterSourceId == null) continue;
    const uuid = sourceIdMap.get(masterSourceId);
    if (uuid) factSourceMap.set(sl.LinkID, uuid);
  }
  console.log(`  SourceLink wiring: ${factSourceMap.size} fact→source links (from ${data.sourceLinks.length} total sourceLinks)`);

  /* ---- Phase 3.5: Clean prior FTM families + timeline_events ---- */
  // Delete-then-reinsert ensures idempotency without unique constraints.
  // FTM is authoritative for these records; persons are preserved (upserted above).
  // ftm_notes use upsert (Phase 8) and do not need cleanup here.
  if (!DRY_RUN) {
    console.log('\n[3.5] Cleaning prior FTM import data...');
    const ftmPersonUuids = [...personIdMap.values()];

    // Delete timeline_events for FTM persons (chunked to stay within URL limits)
    let deletedEvents = 0;
    for (let i = 0; i < ftmPersonUuids.length; i += 200) {
      const chunk = ftmPersonUuids.slice(i, i + 200);
      const { count, error } = await sb.from('timeline_events')
        .delete({ count: 'exact' }).in('person_id', chunk);
      if (error) throw new Error(`Delete timeline_events: ${error.message}`);
      deletedEvents += count ?? 0;
    }
    console.log(`  Deleted ${deletedEvents} timeline_events`);

    // Fetch all families that involve any FTM person (chunked)
    const ftmFamilyIds = new Set();
    for (let i = 0; i < ftmPersonUuids.length; i += 100) {
      const chunk = ftmPersonUuids.slice(i, i + 100);
      const ids = chunk.join(',');
      const { data: famBatch, error } = await sb.from('families').select('id')
        .or(`partner1_id.in.(${ids}),partner2_id.in.(${ids})`);
      if (error) throw new Error(`Fetch families for cleanup: ${error.message}`);
      for (const f of famBatch ?? []) ftmFamilyIds.add(f.id);
    }

    if (ftmFamilyIds.size > 0) {
      const famIdArr = [...ftmFamilyIds];
      for (let i = 0; i < famIdArr.length; i += 200) {
        const { error } = await sb.from('family_members').delete().in('family_id', famIdArr.slice(i, i + 200));
        if (error) throw new Error(`Delete family_members: ${error.message}`);
      }
      for (let i = 0; i < famIdArr.length; i += 200) {
        const { error } = await sb.from('families').delete().in('id', famIdArr.slice(i, i + 200));
        if (error) throw new Error(`Delete families: ${error.message}`);
      }
      console.log(`  Deleted ${ftmFamilyIds.size} families + their members`);
    } else {
      console.log('  No prior families found to delete');
    }
  }

  /* ---- Phase 4: Families ---- */
  console.log('\n[4/8] Families...');

  // Get marriage facts for each relationship (LinkTableID=7)
  const relMarriageFacts = new Map();  // relId → best marriage fact
  for (const f of data.facts) {
    if (f.LinkTableID === 7 && (f.factTypeTag === 'MARR' || f.factTypeName?.includes('Marriage'))) {
      const existing = relMarriageFacts.get(f.LinkID);
      if (!existing || (f.Preferred && !existing.Preferred)) {
        relMarriageFacts.set(f.LinkID, f);
      }
    }
  }

  const familyInserts = [];
  const familyFtmToIdx = new Map();  // ftm rel id → index in familyInserts

  for (const rel of data.relationships) {
    const p1uuid = rel.Person1ID ? personIdMap.get(rel.Person1ID) : null;
    const p2uuid = rel.Person2ID ? personIdMap.get(rel.Person2ID) : null;
    const mf = relMarriageFacts.get(rel.ID);
    const marriageDate = mf ? decodeFTMDate(mf.DateSort1, mf.DateModifier1) : { display: null, sort: null };

    familyFtmToIdx.set(rel.ID, familyInserts.length);
    familyInserts.push({
      partner1_id:          p1uuid,
      partner2_id:          p2uuid,
      marriage_date_display: marriageDate.display,
      marriage_date_sort:   marriageDate.sort,
      marriage_place:       mf ? parseFTMPlace(mf.placeName) : null,
      marriage_type:        'MARR',
      private:              Boolean(rel.Private),
    });
  }

  // ftm rel id → supabase family uuid
  const familyIdMap = new Map();

  if (!DRY_RUN) {
    const { data: insertedFamilies, error } = await sb.from('families').insert(familyInserts).select('id');
    if (error) throw new Error(`Family insert: ${error.message}`);
    for (const [ftmId, idx] of familyFtmToIdx) {
      familyIdMap.set(ftmId, insertedFamilies[idx].id);
    }
    console.log(`  ${familyInserts.length} families inserted`);
  } else {
    data.relationships.forEach((r, i) => familyIdMap.set(r.ID, `dry-family-uuid-${i}`));
    console.log(`  Would insert ${familyInserts.length} families`);
  }

  /* ---- Phase 5: Family Members ---- */
  console.log('\n[5/8] Family members...');

  const memberRows = [];

  // Children
  for (const cr of data.childRelationships) {
    const personUuid = personIdMap.get(cr.PersonID);
    const familyUuid = familyIdMap.get(cr.RelationshipID);
    if (!personUuid || !familyUuid) continue;
    memberRows.push({
      person_id:                 personUuid,
      family_id:                 familyUuid,
      role:                      'child',
      relationship_to_partner1:  ftmNature(cr.Nature1),
      relationship_to_partner2:  ftmNature(cr.Nature2),
      birth_order:               cr.ChildOrder > 0 ? cr.ChildOrder : null,
      has_descendants:           false,
    });
  }

  // Partners (both people in each relationship become partner members)
  for (const rel of data.relationships) {
    const familyUuid = familyIdMap.get(rel.ID);
    if (!familyUuid) continue;
    for (const pid of [rel.Person1ID, rel.Person2ID]) {
      if (!pid) continue;
      const personUuid = personIdMap.get(pid);
      if (!personUuid) continue;
      memberRows.push({
        person_id:  personUuid,
        family_id:  familyUuid,
        role:       'partner',
        has_descendants: false,
      });
    }
  }

  if (!DRY_RUN) {
    // family_members has unique(person_id, family_id) — ignoreDuplicates is safe
    let n = 0;
    for (let i = 0; i < memberRows.length; i += 200) {
      const chunk = memberRows.slice(i, i + 200);
      const { error } = await sb.from('family_members').insert(chunk, { ignoreDuplicates: true });
      if (error) throw new Error(`family_members insert: ${error.message}`);
      n += chunk.length;
    }
    console.log(`  ${n} family members inserted`);
  } else {
    console.log(`  Would insert ${memberRows.length} family members`);
  }

  /* ---- Phase 6: Timeline Events ---- */
  console.log('\n[6/8] Timeline events...');

  // Only import events (FactClass=263) and custom events (FactClass=259)
  // Skip attribute facts (FactClass=257): Name, Sex, Refn, etc.
  // Only import facts linked to persons (LinkTableID=5)
  const SKIP_TAGS = new Set(['NAME', 'SEX', 'REFN', 'FSID', 'ALIA', 'SSN', '_HEIG', '_WEIG', '_NAMS']);

  // For birth/death/burial/baptism: only import the Preferred fact to avoid duplicates
  const SINGLE_PREFERRED_TAGS = new Set(['BIRT', 'DEAT', 'BURI', 'BAPM']);
  // Track which (person, tag) combos we've already added a preferred fact for
  const addedPreferred = new Set();

  const eventRows = [];
  for (const f of data.facts) {
    if (f.LinkTableID !== 5) continue;  // only person facts
    if (SKIP_TAGS.has(f.factTypeTag)) continue;
    if (f.factTypeClass === 257) continue;  // skip all attribute facts

    // For single-instance event types, only import the preferred fact
    if (SINGLE_PREFERRED_TAGS.has(f.factTypeTag)) {
      const key = `${f.LinkID}:${f.factTypeTag}`;
      if (f.Preferred !== 1 && f.Preferred !== '1') {
        if (addedPreferred.has(key)) continue;  // skip non-preferred if preferred exists
      } else {
        addedPreferred.add(key);
      }
    }

    const personUuid = personIdMap.get(f.LinkID);
    if (!personUuid) continue;

    const decoded = decodeFTMDate(f.DateSort1, f.DateModifier1);
    const place   = parseFTMPlace(f.placeName);
    const etype   = tagToEventType(f.factTypeTag);

    // For date ranges (between), also decode end date
    let endDate = null;
    if (f.DateSort2 && f.DateSort2 > 0 && f.DateSort2 !== f.DateSort1) {
      const endDecoded = decodeFTMDate(f.DateSort2, 0);
      endDate = endDecoded.sort;
    }

    // description: custom event type name when it's not a standard GEDCOM tag
    const isCustom = !TAG_TO_EVENT[f.factTypeTag];
    const description = isCustom ? f.factTypeName : null;

    eventRows.push({
      person_id:      personUuid,
      event_type:     etype,
      event_date:     decoded.sort,
      event_date_end: endDate,
      date_qualifier: decoded.qualifier,
      date_display:   decoded.display,
      place_name:     place,
      description:    description,
      notes:          f.Text || null,
      evidence_type:  'Indirect',  // GPS default; researcher corrects
      source_id:      factSourceMap.get(f.ID) ?? null,
    });
  }

  if (!DRY_RUN) {
    const n = await batchInsert(sb, 'timeline_events', eventRows);
    const withSource = eventRows.filter(e => e.source_id !== null).length;
    console.log(`  ${n} timeline events inserted (${withSource} with source_id wired)`);
  } else {
    console.log(`  Would insert ${eventRows.length} timeline events`);
    const withSource = eventRows.filter(e => e.source_id !== null).length;
    console.log(`  ${withSource} would have source_id wired`);
    const byType = {};
    for (const e of eventRows) byType[e.event_type] = (byType[e.event_type] ?? 0) + 1;
    console.log('  By type:', byType);
  }

  /* ---- Phase 8: FTM Notes (discrete rows in ftm_notes) ---- */
  // Phase 7 = person_external_ids (handled separately via migration 019).
  // LinkTableID=5 = person notes. Family notes (LinkTableID=7) not yet imported.
  // Idempotency: upsert on UNIQUE(person_id, ftm_note_id). No cleanup needed.
  // source_id is NULL at import time; future enhancement to link notes to sources.
  console.log('\n[8/8] FTM Notes...');

  // Schema cache warmup: PostgREST may lag several seconds after a fresh migration.
  // Poll until ftm_notes is visible before attempting the upsert.
  // See AGENT.md "PostgREST schema cache lag" for the canonical pattern.
  if (!DRY_RUN) {
    const WARMUP_TRIES = 10;
    const WARMUP_DELAY_MS = 2000;
    for (let attempt = 1; attempt <= WARMUP_TRIES; attempt++) {
      const { error } = await sb.from('ftm_notes').select('id').limit(0);
      if (!error) break;
      if (attempt === WARMUP_TRIES) {
        throw new Error(
          `ftm_notes not visible in PostgREST after ${WARMUP_TRIES} attempts. `
          + `Run migration 021 (sql/021-ftm-notes.sql) in Supabase first, then retry. `
          + `Last error: ${error.message}`
        );
      }
      console.log(`  PostgREST schema cache warming up `
        + `(attempt ${attempt}/${WARMUP_TRIES}, waiting ${WARMUP_DELAY_MS}ms)...`);
      await new Promise(r => setTimeout(r, WARMUP_DELAY_MS));
    }
  }

  const noteRows = [];
  for (const n of (data.notes ?? [])) {
    if (n.LinkTableID !== 5) continue;  // only person notes for now
    const personUuid = personIdMap.get(n.LinkID);
    if (!personUuid) continue;
    const content = stripRTF(n.NoteText);
    if (!content) continue;  // skip blank after RTF stripping
    noteRows.push({
      person_id:   personUuid,
      source_id:   null,
      ftm_note_id: n.ID,
      content,
    });
  }

  if (!DRY_RUN) {
    const total = await batchUpsert(sb, 'ftm_notes', noteRows, 'person_id,ftm_note_id');
    console.log(`  ${total} notes imported (${noteRows.length} substantive after RTF stripping)`);
  } else {
    const uniquePersons = new Set(noteRows.map(n => n.person_id)).size;
    console.log(`  Would import ${noteRows.length} notes across ${uniquePersons} persons`);
    if (noteRows.length > 0) {
      console.log('  Sample note (first 120 chars):', noteRows[0].content.slice(0, 120));
    }
  }

  /* ---- Summary ---- */
  console.log('\n--- Import complete ---');
  if (DRY_RUN) console.log('(Dry run — nothing written to Supabase)');
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
