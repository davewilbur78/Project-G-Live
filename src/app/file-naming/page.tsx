'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const RECORD_TYPES = [
  { value: 'birth-certificate',    label: 'Birth Certificate' },
  { value: 'death-certificate',    label: 'Death Certificate' },
  { value: 'marriage-certificate', label: 'Marriage Certificate' },
  { value: 'divorce-record',       label: 'Divorce Record' },
  { value: 'census',               label: 'Census' },
  { value: 'death-notice',         label: 'Death Notice' },
  { value: 'obituary',             label: 'Obituary' },
  { value: 'passenger-list',       label: 'Passenger List / Ship Manifest' },
  { value: 'naturalization',       label: 'Naturalization Record' },
  { value: 'draft-registration',   label: 'Draft Registration' },
  { value: 'city-directory',       label: 'City Directory' },
  { value: 'land-record',          label: 'Land Record / Deed' },
  { value: 'probate',              label: 'Probate Record' },
  { value: 'will',                 label: 'Will' },
  { value: 'military-record',      label: 'Military Record' },
  { value: 'pension-record',       label: 'Pension Record' },
  { value: 'newspaper-article',    label: 'Newspaper Article' },
  { value: 'photograph',           label: 'Photograph' },
  { value: 'headstone',            label: 'Headstone / Grave Marker' },
  { value: 'letter',               label: 'Letter / Correspondence' },
  { value: 'tax-record',           label: 'Tax Record' },
  { value: 'voter-registration',   label: 'Voter Registration' },
  { value: 'social-security',      label: 'Social Security Record' },
  { value: 'church-record',        label: 'Church Record' },
  { value: 'vital-record',         label: 'Vital Record (generic)' },
  { value: 'other',                label: 'Other' },
]

const EXTENSIONS = [
  '.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.docx', '.txt', '.csv',
]

const MONTHS = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const INPUT_STYLE = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' as const,
}
const LABEL_STYLE = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--color-muted)', marginBottom: '0.35rem',
  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
}
const FIELD = { marginBottom: '1.1rem' }

function slugify(s: string): string {
  return s.trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [text])
  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '0.3rem 0.75rem', borderRadius: 5, fontSize: '0.78rem', fontWeight: 600,
        border: '1px solid var(--color-border)', cursor: 'pointer', flexShrink: 0,
        background: copied ? 'var(--color-green)22' : 'var(--color-surface)',
        color: copied ? 'var(--color-green)' : 'var(--color-muted)',
        transition: 'all 0.15s',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function FileNamingPage() {
  const [surname, setSurname] = useState('')
  const [givenName, setGivenName] = useState('')
  const [recordTypeSelect, setRecordTypeSelect] = useState('birth-certificate')
  const [recordTypeCustom, setRecordTypeCustom] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [repoFull, setRepoFull] = useState('')
  const [repoAbbrev, setRepoAbbrev] = useState('')
  const [ext, setExt] = useState('.pdf')
  const [basePath, setBasePath] = useState('Research')

  const recordType = recordTypeSelect === 'other' ? recordTypeCustom : recordTypeSelect

  const surnameSlug = slugify(surname).toUpperCase()
  const givenSlug   = slugify(givenName)
  const repoSlug    = slugify(repoAbbrev || repoFull)
  const dateSlug    = year
    ? (month ? `${year}-${String(MONTHS.indexOf(month)).padStart(2, '0')}` : year)
    : ''

  const parts = [
    surnameSlug,
    givenSlug,
    slugify(recordType),
    dateSlug,
    repoSlug,
  ].filter(Boolean)

  const fileName = parts.length > 0 ? parts.join('_') + ext : ''
  const folderPath = [
    basePath.replace(/\/+$/, ''),
    surnameSlug || '[SURNAME]',
    slugify(recordType) || '[record-type]',
    year || '[YYYY]',
  ].join('/')
  const fullPath = fileName ? `${folderPath}/${fileName}` : ''

  const isReady = surnameSlug && slugify(recordType) && year && repoSlug

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo; File Naming System
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, margin: '0 0 0.35rem', color: 'var(--color-text)' }}>File Naming System</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>Generate standardized file names and folder paths for research documents. Every file permanently traceable to its citation.</p>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.65rem 1rem', marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>GPS element 2:</strong> Consistent file names keep every document permanently linked to its citation. Never rename a file without updating Supabase.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Subject Surname <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <input style={INPUT_STYLE} value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g. Klein" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Subject Given Name</label>
          <input style={INPUT_STYLE} value={givenName} onChange={(e) => setGivenName(e.target.value)} placeholder="e.g. Julia" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Record Type <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <select style={INPUT_STYLE} value={recordTypeSelect} onChange={(e) => setRecordTypeSelect(e.target.value)}>
            {RECORD_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>

        {recordTypeSelect === 'other' && (
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Custom Record Type</label>
            <input style={INPUT_STYLE} value={recordTypeCustom} onChange={(e) => setRecordTypeCustom(e.target.value)} placeholder="e.g. synagogue-record" />
          </div>
        )}
        {recordTypeSelect !== 'other' && <div style={FIELD} />}

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Year <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <input style={INPUT_STYLE} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="e.g. 1937" maxLength={4} />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Month (optional)</label>
          <select style={INPUT_STYLE} value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={m}>{m || 'Not specified'}</option>)}
          </select>
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Repository / Source <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <input style={INPUT_STYLE} value={repoFull} onChange={(e) => setRepoFull(e.target.value)} placeholder="e.g. Brooklyn Eagle" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Repository Abbreviation <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <input
            style={INPUT_STYLE}
            value={repoAbbrev}
            onChange={(e) => setRepoAbbrev(e.target.value)}
            placeholder={repoFull ? slugify(repoFull.split(' ').map(w => w[0]).join('')) || 'e.g. BklynEagle' : 'e.g. BklynEagle'}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.3rem' }}>Short form used in the filename. Keep it recognizable but brief.</div>
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>File Extension</label>
          <select style={INPUT_STYLE} value={ext} onChange={(e) => setExt(e.target.value)}>
            {EXTENSIONS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Archive Base Path</label>
          <input style={INPUT_STYLE} value={basePath} onChange={(e) => setBasePath(e.target.value)} placeholder="Research" />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.3rem' }}>Root folder of your local research archive. Used in the suggested folder path only.</div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', borderTop: '2px solid var(--color-border)', paddingTop: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--color-text)' }}>Generated Output</h2>

        {!isReady && (
          <div style={{ color: 'var(--color-muted)', fontSize: '0.88rem', fontStyle: 'italic', padding: '1rem 0' }}>
            Fill in surname, record type, year, and repository to generate a name.
          </div>
        )}

        {isReady && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>File Name</div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--color-accent)', flex: 1, wordBreak: 'break-all' }}>{fileName}</code>
                <CopyButton text={fileName} />
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Suggested Folder Path</div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-text)', flex: 1, wordBreak: 'break-all' }}>{folderPath}/</code>
                <CopyButton text={folderPath + '/'} />
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Path</div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.83rem', color: 'var(--color-text)', flex: 1, wordBreak: 'break-all', opacity: 0.85 }}>{fullPath}</code>
                <CopyButton text={fullPath} />
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Convention:</strong>{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>SURNAME_GivenName_record-type_YYYY_Repository.ext</code>
              <span style={{ margin: '0 0.4rem', opacity: 0.4 }}>|</span>
              Case: SURNAME uppercase, given name title case, record type and repository as slugs.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
