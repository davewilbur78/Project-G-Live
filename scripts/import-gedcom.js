#!/usr/bin/env node
/**
 * FTM → Supabase GEDCOM Import
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-gedcom.js <path-to-file.ged>
 *
 * Imports: persons, families, family_members, timeline_events, sources, repositories
 * Safe to re-run: upserts on ancestry_id (persons) and label (sources)
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ─── Config ──────────────────────────────────────────────────────────────────

const GEDCOM_FILE = process.argv[2]
if (!GEDCOM_FILE) {
  console.error('Usage: node --env-file=.env.local scripts/import-gedcom.js <file.ged>')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── GEDCOM Parser ───────────────────────────────────────────────────────────

function parseGedcom(filePath) {
  const text = readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/)

  // Build a flat list of {level, xref, tag, value} then nest into records
  const parsed = []
  for (const raw of lines) {
    const m = raw.trim().match(/^(\d+)\s+(?:(@[^@]+@)\s+)?(\w+)(?:\s+(.*))?$/)
    if (!m) continue
    parsed.push({ level: parseInt(m[1]), xref: m[2] || null, tag: m[3], value: (m[4] || '').trim() })
  }

  // Group into top-level records (level 0)
  const records = []
  let current = null
  const stack = [] // stack of {level, node}

  for (const token of parsed) {
    const node = { tag: token.tag, value: token.value, xref: token.xref, children: [] }

    if (token.level === 0) {
      current = node
      records.push(current)
      stack.length = 0
      stack.push({ level: 0, node: current })
    } else {
      // Pop stack until we find a parent with lower level
      while (stack.length > 1 && stack[stack.length - 1].level >= token.level) {
        stack.pop()
      }
      const parent = stack[stack.length - 1].node
      parent.children.push(node)
      stack.push({ level: token.level, node })
    }
  }

  return records
}

// ─── GEDCOM Date Parser ──────────────────────────────────────────────────────

const MONTH_MAP = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
}

function parseGedcomDate(raw) {
  if (!raw) return { display: null, sort: null, qualifier: 'exact' }
  const s = raw.trim().toUpperCase()

  let qualifier = 'exact'
  let working = s

  if (s.startsWith('ABT') || s.startsWith('ABOUT') || s.startsWith('CA') || s.startsWith('CIRCA')) {
    qualifier = 'about'
    working = s.replace(/^(ABT\.?|ABOUT|CA\.?|CIRCA)\s*/i, '')
  } else if (s.startsWith('BEF')) {
    qualifier = 'before'
    working = s.replace(/^BEF\.?\s*/i, '')
  } else if (s.startsWith('AFT')) {
    qualifier = 'after'
    working = s.replace(/^AFT\.?\s*/i, '')
  } else if (s.startsWith('BET') || s.startsWith('FROM')) {
    qualifier = 'between'
    // BET 1880 AND 1890 — extract first year
    const m = working.match(/(\d{4})/)
    if (m) working = m[1]
  } else if (s.startsWith('EST')) {
    qualifier = 'calculated'
    working = s.replace(/^EST\.?\s*/i, '')
  }

  // Full date: DD MON YYYY
  let sortDate = null
  let displayDate = null

  const fullMatch = working.match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{4})$/)
  if (fullMatch) {
    const [, day, mon, year] = fullMatch
    const mm = MONTH_MAP[mon]
    if (mm) {
      sortDate = `${year}-${mm}-${String(day).padStart(2, '0')}`
      displayDate = `${String(day).padStart(2, '0')} ${mon.charAt(0) + mon.slice(1).toLowerCase()} ${year}`
    }
  }

  // Month + year: MON YYYY
  if (!sortDate) {
    const monYearMatch = working.match(/^([A-Z]{3})\s+(\d{4})$/)
    if (monYearMatch) {
      const [, mon, year] = monYearMatch
      const mm = MONTH_MAP[mon]
      if (mm) {
        sortDate = `${year}-${mm}-01`
        displayDate = `${mon.charAt(0) + mon.slice(1).toLowerCase()} ${year}`
      }
    }
  }

  // Year only: YYYY
  if (!sortDate) {
    const yearMatch = working.match(/^(\d{4})$/)
    if (yearMatch) {
      sortDate = `${yearMatch[1]}-01-01`
      displayDate = yearMatch[1]
    }
  }

  if (!displayDate) {
    displayDate = raw // keep original if we can't parse
    sortDate = null
    qualifier = 'exact'
  }

  // Prepend qualifier word to display
  const qualifierWords = { about: 'about ', before: 'before ', after: 'after ', between: 'between ', calculated: 'est. ' }
  if (qualifier !== 'exact' && qualifierWords[qualifier]) {
    displayDate = qualifierWords[qualifier] + displayDate
  }

  return { display: displayDate, sort: sortDate, qualifier }
}

// ─── GEDCOM Helper: get first child with tag ─────────────────────────────────

function child(node, tag) {
  return node.children.find(c => c.tag === tag) || null
}

function childValue(node, tag) {
  return child(node, tag)?.value || null
}

function children(node, tag) {
  return node.children.filter(c => c.tag === tag)
}

// ─── GEDCOM event type → our schema ──────────────────────────────────────────

const EVENT_TAG_MAP = {
  BIRT: 'birth',    DEAT: 'death',    BAPM: 'baptism',   BURI: 'burial',
  MARR: 'marriage', DIV:  'divorce',  RESI: 'residence', IMMI: 'immigration',
  EMIG: 'emigration', NATU: 'naturalization', MILI: 'military_service',
  OCCU: 'occupation', CENS: 'census', LAND: 'land_record', EDUC: 'education',
  EVEN: 'other',    CHR:  'baptism',  DSCR: 'other',     PROB: 'other',
  WILL: 'other',    GRAD: 'education', RETI: 'other',
}

// ─── Extract Place fields ─────────────────────────────────────────────────────

function extractPlace(placeValue) {
  if (!placeValue) return { place_name: null, city: null, county: null, state_province: null, country: null }
  // GEDCOM place: "City, County, State, Country" (comma-separated, variable parts)
  const parts = placeValue.split(',').map(p => p.trim()).filter(Boolean)
  return {
    place_name: placeValue,
    city: parts[0] || null,
    county: parts.length === 4 ? parts[1] : null,
    state_province: parts.length >= 3 ? parts[parts.length - 2] : (parts[1] || null),
    country: parts.length >= 2 ? parts[parts.length - 1] : null,
  }
}

// ─── Main Import ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nReading GEDCOM: ${GEDCOM_FILE}`)
  const records = parseGedcom(GEDCOM_FILE)

  const individuals = records.filter(r => r.tag === 'INDI')
  const families    = records.filter(r => r.tag === 'FAM')
  const sources     = records.filter(r => r.tag === 'SOUR')
  const repos       = records.filter(r => r.tag === 'REPO')

  console.log(`Found: ${individuals.length} individuals, ${families.length} families, ${sources.length} sources, ${repos.length} repositories`)

  // Maps from GEDCOM xref → Supabase UUID
  const personMap = new Map()   // @I1@ → uuid
  const sourceMap = new Map()   // @S1@ → uuid
  const repoMap   = new Map()   // @R1@ → uuid

  // ── 1. Repositories ────────────────────────────────────────────────────────
  console.log('\n[1/6] Importing repositories...')
  for (const r of repos) {
    const name = childValue(r, 'NAME')
    if (!name) continue
    const addrNode = child(r, 'ADDR')
    const row = {
      name,
      type: 'other',
      url: childValue(r, 'WWW') || childValue(r, 'URL') || null,
      address_line: addrNode?.value || null,
      city: addrNode ? childValue(addrNode, 'CITY') : null,
      state: addrNode ? childValue(addrNode, 'STAE') : null,
      country: addrNode ? childValue(addrNode, 'CTRY') : null,
    }
    const { data, error } = await supabase
      .from('repositories')
      .upsert(row, { onConflict: 'name' })
      .select('id')
      .single()
    if (error) { console.error(`  Repo error (${name}):`, error.message); continue }
    repoMap.set(r.xref, data.id)
    process.stdout.write('.')
  }
  console.log(` done (${repoMap.size})`)

  // ── 2. Sources ──────────────────────────────────────────────────────────────
  console.log('\n[2/6] Importing sources...')
  let sourceCount = 0
  for (const s of sources) {
    const title = childValue(s, 'TITL') || childValue(s, 'NAME') || 'Untitled Source'
    const auth  = childValue(s, 'AUTH')
    const pub   = childValue(s, 'PUBL')
    const text  = childValue(s, 'TEXT')
    const repoRef = childValue(child(s, 'REPO') || {children:[]}, 'REPO') || child(s, 'REPO')?.value

    // Build a rough EE-style citation from available parts
    const citationParts = [title, auth, pub].filter(Boolean)
    const ee_full = citationParts.join('. ') + (text ? ` [${text}]` : '')

    const row = {
      label: title,
      source_type: 'Derivative',       // safe default — user corrects
      info_type: 'Undetermined',        // safe default
      evidence_type: 'Indirect',        // safe default
      ee_full_citation: ee_full || title,
      ee_short_citation: title,
      repository_id: repoRef ? repoMap.get(repoRef) || null : null,
    }
    const { data, error } = await supabase
      .from('sources')
      .upsert(row, { onConflict: 'label' })
      .select('id')
      .single()
    if (error) { console.error(`  Source error (${title}):`, error.message); continue }
    sourceMap.set(s.xref, data.id)
    sourceCount++
    process.stdout.write('.')
  }
  console.log(` done (${sourceCount})`)

  // ── 3. Persons ──────────────────────────────────────────────────────────────
  console.log('\n[3/6] Importing persons...')
  let personCount = 0
  for (const ind of individuals) {
    const nameNode = child(ind, 'NAME')
    const fullName  = nameNode?.value?.replace(/\//g, '').replace(/\s+/g, ' ').trim() || 'Unknown'
    const givenName = childValue(nameNode || {children:[]}, 'GIVN') || null
    const surname   = childValue(nameNode || {children:[]}, 'SURN') || null
    const prefix    = childValue(nameNode || {children:[]}, 'NPFX') || null
    const suffix    = childValue(nameNode || {children:[]}, 'NSFX') || null
    const nick      = childValue(nameNode || {children:[]}, 'NICK') || null
    const spfx      = childValue(nameNode || {children:[]}, 'SPFX') || null  // surname prefix (van, de)

    // Alternate names
    const altNameNodes = children(ind, 'NAME').slice(1)
    const altNames = altNameNodes
      .map(n => n.value?.replace(/\//g, '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)

    const sex = childValue(ind, 'SEX') || 'U'
    const sexMapped = sex === 'M' ? 'M' : sex === 'F' ? 'F' : 'U'

    const isLiving = !child(ind, 'DEAT')  // no death record → assume living (conservative)

    // Birth
    const birtNode = child(ind, 'BIRT')
    const birthDateRaw = birtNode ? childValue(birtNode, 'DATE') : null
    const birthPlace   = birtNode ? childValue(birtNode, 'PLAC') : null
    const birthParsed  = parseGedcomDate(birthDateRaw)

    // Death
    const deatNode = child(ind, 'DEAT')
    const deathDateRaw = deatNode ? childValue(deatNode, 'DATE') : null
    const deathPlace   = deatNode ? childValue(deatNode, 'PLAC') : null
    const deathParsed  = parseGedcomDate(deathDateRaw)

    // Notes
    const noteNodes = children(ind, 'NOTE')
    const notes = noteNodes.map(n => n.value).filter(Boolean).join('\n\n') || null

    const row = {
      display_name: fullName,
      given_name: givenName || (fullName.split(' ')[0] !== 'Unknown' ? fullName.split(' ')[0] : null),
      surname: surname || null,
      name_prefix: prefix,
      suffix,
      nickname: nick,
      lnprefix: spfx,
      alt_names: altNames.length > 0 ? altNames : null,
      sex: sexMapped,
      living: isLiving,
      private: false,
      birth_date: birthParsed.display,
      birth_date_sort: birthParsed.sort,
      birth_place: birthPlace,
      death_date: deathParsed.display,
      death_date_sort: deathParsed.sort,
      death_place: deathPlace,
      notes,
      ancestry_id: ind.xref,
      changedby: 'FTM Import',
    }

    const { data, error } = await supabase
      .from('persons')
      .upsert(row, { onConflict: 'ancestry_id' })
      .select('id')
      .single()
    if (error) { console.error(`  Person error (${fullName}):`, error.message); continue }
    personMap.set(ind.xref, data.id)
    personCount++
    process.stdout.write('.')
  }
  console.log(` done (${personCount})`)

  // ── 4. Families + Family Members ────────────────────────────────────────────
  console.log('\n[4/6] Importing families + family members...')
  let familyCount = 0
  let memberCount = 0

  for (const fam of families) {
    const partner1Ref = childValue(fam, 'HUSB')
    const partner2Ref = childValue(fam, 'WIFE')
    const partner1Id  = partner1Ref ? personMap.get(partner1Ref) || null : null
    const partner2Id  = partner2Ref ? personMap.get(partner2Ref) || null : null

    const marriNode = child(fam, 'MARR')
    const marrDateRaw = marriNode ? childValue(marriNode, 'DATE') : null
    const marrPlace   = marriNode ? childValue(marriNode, 'PLAC') : null
    const marrParsed  = parseGedcomDate(marrDateRaw)

    const divNode = child(fam, 'DIV')
    const divDateRaw = divNode ? childValue(divNode, 'DATE') : null
    const divPlace   = divNode ? childValue(divNode, 'PLAC') : null
    const divParsed  = parseGedcomDate(divDateRaw)

    // Determine marriage type from event tag if present
    const marriType = child(fam, 'MARR') ? 'MARR'
      : child(fam, 'MARB') ? 'MARB'
      : child(fam, 'MARL') ? 'MARL'
      : null

    const famRow = {
      partner1_id: partner1Id,
      partner2_id: partner2Id,
      marriage_date_display: marrParsed.display,
      marriage_date_sort: marrParsed.sort,
      marriage_place: marrPlace,
      marriage_type: marriType,
      div_date_display: divParsed.display,
      div_date_sort: divParsed.sort,
      div_place: divPlace,
      living: false,
      private: false,
    }

    const { data: famData, error: famError } = await supabase
      .from('families')
      .insert(famRow)
      .select('id')
      .single()
    if (famError) { console.error(`  Family error:`, famError.message); continue }
    const famId = famData.id
    familyCount++

    // Partners as family_members
    for (const [ref, pid] of [[partner1Ref, partner1Id], [partner2Ref, partner2Id]]) {
      if (!pid) continue
      const { error } = await supabase.from('family_members').insert({
        person_id: pid, family_id: famId, role: 'partner',
        has_descendants: children(fam, 'CHIL').length > 0,
      })
      if (error && !error.message.includes('unique')) console.error(`  Member error (partner):`, error.message)
      else memberCount++
    }

    // Children
    const childNodes = children(fam, 'CHIL')
    for (const ch of childNodes) {
      const childId = personMap.get(ch.value)
      if (!childId) continue
      // PEDI tag on child's FAMC record (in the INDI record) — not easily available here; default natural
      const { error } = await supabase.from('family_members').insert({
        person_id: childId, family_id: famId, role: 'child',
        relationship_to_partner1: 'natural',
        relationship_to_partner2: 'natural',
        has_descendants: false,  // will update after all families processed
      })
      if (error && !error.message.includes('unique')) console.error(`  Member error (child):`, error.message)
      else memberCount++
    }

    process.stdout.write('.')
  }
  console.log(` done (${familyCount} families, ${memberCount} members)`)

  // ── 5. Timeline Events ──────────────────────────────────────────────────────
  console.log('\n[5/6] Importing timeline events...')
  let eventCount = 0

  const EVENT_TAGS = Object.keys(EVENT_TAG_MAP)

  for (const ind of individuals) {
    const personId = personMap.get(ind.xref)
    if (!personId) continue

    for (const eventNode of ind.children) {
      const eventType = EVENT_TAG_MAP[eventNode.tag]
      if (!eventType) continue

      // Skip bare BIRT/DEAT with no date/place — already captured on persons row
      const dateRaw = childValue(eventNode, 'DATE')
      const placeRaw = childValue(eventNode, 'PLAC')
      const desc = childValue(eventNode, 'TYPE') || eventNode.value || null
      const noteText = childValue(eventNode, 'NOTE') || null

      if (!dateRaw && !placeRaw && !desc) continue  // nothing to import

      const dateParsed = parseGedcomDate(dateRaw)
      const place = extractPlace(placeRaw)

      // Resolve citation for this event
      const citNode = child(eventNode, 'SOUR') || child(eventNode, 'CITA')
      const sourceRef = citNode?.value || null
      const sourceId  = sourceRef ? sourceMap.get(sourceRef) || null : null

      const row = {
        person_id: personId,
        event_type: eventType,
        date_display: dateParsed.display,
        event_date: dateParsed.sort,
        date_qualifier: dateParsed.qualifier,
        ...place,
        source_id: sourceId,
        evidence_type: 'Indirect',  // GPS default — user corrects
        description: desc,
        notes: noteText,
      }

      const { error } = await supabase.from('timeline_events').insert(row)
      if (error) { console.error(`  Event error (${eventType}):`, error.message); continue }
      eventCount++
    }
  }

  // Family events (MARR already on families table, but also add to timeline for both partners)
  for (const fam of families) {
    for (const ref of [childValue(fam, 'HUSB'), childValue(fam, 'WIFE')]) {
      if (!ref) continue
      const personId = personMap.get(ref)
      if (!personId) continue

      for (const eventNode of fam.children) {
        const eventType = EVENT_TAG_MAP[eventNode.tag]
        if (!eventType) continue
        const dateRaw  = childValue(eventNode, 'DATE')
        const placeRaw = childValue(eventNode, 'PLAC')
        if (!dateRaw && !placeRaw) continue

        const dateParsed = parseGedcomDate(dateRaw)
        const place = extractPlace(placeRaw)
        const citNode = child(eventNode, 'SOUR')
        const sourceId = citNode ? sourceMap.get(citNode.value) || null : null

        const { error } = await supabase.from('timeline_events').insert({
          person_id: personId,
          event_type: eventType,
          date_display: dateParsed.display,
          event_date: dateParsed.sort,
          date_qualifier: dateParsed.qualifier,
          ...place,
          source_id: sourceId,
          evidence_type: 'Indirect',
        })
        if (!error) eventCount++
      }
    }
  }

  console.log(` done (${eventCount})`)

  // ── 6. Summary ──────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────')
  console.log('Import complete.')
  console.log(`  Repositories : ${repoMap.size}`)
  console.log(`  Sources      : ${sourceCount}`)
  console.log(`  Persons      : ${personCount}`)
  console.log(`  Families     : ${familyCount}`)
  console.log(`  Members      : ${memberCount}`)
  console.log(`  Events       : ${eventCount}`)
  console.log('─────────────────────────────────────────')
  console.log('\nNext steps:')
  console.log('  - Open Timeline Builder (Module 7) and spot-check a few people')
  console.log('  - Open Family Group Sheet (Module 11) and verify family links')
  console.log('  - Correct GPS classifications on sources (all defaulted to Derivative/Undetermined/Indirect)')
  console.log('')
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1) })
