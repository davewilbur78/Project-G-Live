'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SourceType, InfoType, EvidenceType, SourceCategory } from '@/types'

// -------------------------------------------------------------------------
// Field definitions per source category
// -------------------------------------------------------------------------

interface FieldDef {
  key: string
  label: string
  placeholder?: string
  required?: boolean
  type?: 'text' | 'textarea' | 'select'
  options?: string[]
  hint?: string
}

interface CategoryDef {
  id: SourceCategory
  label: string
  icon: string
  description: string
  fields: FieldDef[]
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'vital-record',
    label: 'Vital Record',
    icon: '\u{1F4DC}',
    description: 'Birth, marriage, death, or burial certificate',
    fields: [
      { key: 'record_subtype', label: 'Record type', type: 'select', required: true,
        options: ['Birth', 'Marriage', 'Death', 'Burial'] },
      { key: 'subject_name', label: 'Name as recorded', placeholder: 'Exact name on the record', required: true },
      { key: 'date_of_event', label: 'Date of event', placeholder: 'e.g., 14 March 1892' },
      { key: 'registration_place', label: 'Registration place', placeholder: 'County, State, Country' },
      { key: 'certificate_number', label: 'Certificate / register number', placeholder: 'e.g., No. 1847' },
      { key: 'informant', label: 'Informant', placeholder: 'Name and relationship to subject' },
      { key: 'repository', label: 'Repository', placeholder: 'Holding institution', required: true },
    ],
  },
  {
    id: 'census',
    label: 'Census Record',
    icon: '\u{1F3DB}\uFE0F',
    description: 'Federal, state, or territorial census',
    fields: [
      { key: 'year', label: 'Census year', placeholder: 'e.g., 1900', required: true },
      { key: 'state', label: 'State / Territory', required: true },
      { key: 'county', label: 'County', required: true },
      { key: 'township_district', label: 'Township / ED / District', placeholder: 'e.g., Ward 14, ED 312' },
      { key: 'page_line', label: 'Page and line', placeholder: 'e.g., p. 12, line 44' },
      { key: 'nara_series', label: 'NARA series', placeholder: 'e.g., T623, roll 1047' },
      { key: 'ancestry_url', label: 'Ancestry URL', placeholder: 'https://www.ancestry.com/...', hint: 'For access only -- not the citation itself' },
    ],
  },
  {
    id: 'passenger-manifest',
    label: 'Passenger Manifest',
    icon: '\u26F4\uFE0F',
    description: 'Ship arrival or departure list',
    fields: [
      { key: 'ship_name', label: 'Ship name', placeholder: 'e.g., S.S. Marion', required: true },
      { key: 'departure_port', label: 'Port of departure', placeholder: 'e.g., Hamburg, Germany' },
      { key: 'arrival_port', label: 'Port of arrival', placeholder: 'e.g., New York' },
      { key: 'arrival_date', label: 'Arrival date', placeholder: 'e.g., 4 June 1907', required: true },
      { key: 'list_line', label: 'List / line number', placeholder: 'e.g., List 14, line 5' },
      { key: 'nara_series', label: 'NARA series', placeholder: 'e.g., M237, roll 512' },
      { key: 'ancestry_url', label: 'Ancestry URL', placeholder: 'https://www.ancestry.com/...', hint: 'For access only -- not the citation itself' },
    ],
  },
  {
    id: 'naturalization',
    label: 'Naturalization Record',
    icon: '\u{1F985}',
    description: 'Declaration, petition, or certificate of naturalization',
    fields: [
      { key: 'record_subtype', label: 'Record type', type: 'select', required: true,
        options: ['Declaration of Intention', 'Petition for Naturalization', 'Certificate of Naturalization', 'Index card'] },
      { key: 'court_name', label: 'Court name', placeholder: 'e.g., U.S. District Court, Southern District of New York', required: true },
      { key: 'court_location', label: 'Court location', placeholder: 'County, State' },
      { key: 'date', label: 'Date', placeholder: 'e.g., 15 March 1919' },
      { key: 'volume_roll', label: 'Volume / roll number', placeholder: 'e.g., Vol. 3, roll 47' },
      { key: 'certificate_number', label: 'Certificate number', placeholder: 'e.g., No. 1,234,567' },
      { key: 'nara_series', label: 'NARA series', placeholder: 'e.g., M1614, roll 2' },
    ],
  },
  {
    id: 'land-deed',
    label: 'Land / Deed Record',
    icon: '\u{1F5FA}\uFE0F',
    description: 'Deed, mortgage, or land grant',
    fields: [
      { key: 'deed_type', label: 'Record type', type: 'select',
        options: ['Deed', 'Mortgage', 'Land Grant', 'Other'] },
      { key: 'grantor', label: 'Grantor', placeholder: 'Seller / transferor' },
      { key: 'grantee', label: 'Grantee', placeholder: 'Buyer / recipient' },
      { key: 'date', label: 'Date', placeholder: 'e.g., 12 May 1880' },
      { key: 'county_state', label: 'County, State', required: true },
      { key: 'book_page', label: 'Book and page', placeholder: 'e.g., Deed Book D, p. 432' },
      { key: 'repository', label: 'Repository', placeholder: 'County courthouse or archive', required: true },
    ],
  },
  {
    id: 'probate',
    label: 'Probate Record',
    icon: '\u2696\uFE0F',
    description: 'Will, estate administration, or inventory',
    fields: [
      { key: 'record_type', label: 'Record type', type: 'select',
        options: ['Will', 'Administration', 'Inventory', 'Bond', 'Other'] },
      { key: 'deceased', label: 'Deceased name', placeholder: 'Name as recorded', required: true },
      { key: 'county_state', label: 'County, State', required: true },
      { key: 'date', label: 'Date (proved or recorded)', placeholder: 'e.g., 6 October 1902' },
      { key: 'case_number', label: 'Case / file number', placeholder: 'e.g., Estate No. 4821' },
      { key: 'repository', label: 'Repository', required: true },
    ],
  },
  {
    id: 'newspaper',
    label: 'Newspaper',
    icon: '\u{1F4F0}',
    description: 'Newspaper article, notice, or announcement',
    fields: [
      { key: 'newspaper_title', label: 'Newspaper title', required: true },
      { key: 'city_state', label: 'City, State', required: true },
      { key: 'date', label: 'Date', placeholder: 'e.g., 14 November 1921', required: true },
      { key: 'article_title', label: 'Article / headline', placeholder: 'As it appears in print' },
      { key: 'page_column', label: 'Page and column', placeholder: 'e.g., p. 7, col. 2' },
      { key: 'repository', label: 'Repository or digitized source', placeholder: 'e.g., Chronicling America, NYPL' },
    ],
  },
  {
    id: 'photograph',
    label: 'Photograph',
    icon: '\u{1F4F7}',
    description: 'Photograph, portrait, or image document',
    fields: [
      { key: 'subject_description', label: 'Subject / description', type: 'textarea', required: true,
        placeholder: 'What or who is depicted, setting, any identifying features' },
      { key: 'date_approximate', label: 'Date (or approximate)', placeholder: 'e.g., circa 1910' },
      { key: 'creator', label: 'Photographer / creator', placeholder: 'If known' },
      { key: 'custodian', label: 'Current custodian', placeholder: 'Who holds this image now?', required: true },
      { key: 'format', label: 'Format', type: 'select',
        options: ['Print', 'Digital', 'Negative', 'Tintype', 'Cabinet card', 'Other'] },
    ],
  },
  {
    id: 'database',
    label: 'Database / Online Collection',
    icon: '\u{1F5C4}\uFE0F',
    description: 'Ancestry, FamilySearch, JRI-Poland, or similar',
    fields: [
      { key: 'database_name', label: 'Database / site name', placeholder: 'e.g., Ancestry.com, FamilySearch', required: true },
      { key: 'collection_title', label: 'Collection / record set title', placeholder: 'Exact collection name', required: true },
      { key: 'entry_identifier', label: 'Entry identifier', placeholder: 'Record ID, certificate number, etc.' },
      { key: 'url', label: 'URL', placeholder: 'https://',
        hint: 'For access only -- not the citation itself' },
      { key: 'date_accessed', label: 'Date accessed', placeholder: 'e.g., 2 May 2026' },
      { key: 'original_source', label: 'Underlying original source', type: 'textarea', required: true,
        placeholder: 'What original record does this database image?',
        hint: 'Required for proper EE citation. Ancestry/FamilySearch URLs are not sources.' },
    ],
  },
  {
    id: 'website',
    label: 'Website',
    icon: '\u{1F310}',
    description: 'Website article, page, or online publication',
    fields: [
      { key: 'site_title', label: 'Website / organization name', required: true },
      { key: 'page_title', label: 'Page / article title', required: true },
      { key: 'author', label: 'Author', placeholder: 'If identified' },
      { key: 'url', label: 'URL', placeholder: 'https://', required: true },
      { key: 'date_accessed', label: 'Date accessed', placeholder: 'e.g., 9 May 2026', required: true },
      { key: 'sponsor', label: 'Sponsoring organization', placeholder: 'If different from site title' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '\u{1F4C2}',
    description: 'Any source type not covered above',
    fields: [
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'repository', label: 'Repository or location', required: true },
      { key: 'date', label: 'Date', placeholder: 'Date of document or access' },
    ],
  },
]

// -------------------------------------------------------------------------
// GPS classification text -- shown inline with each option
// -------------------------------------------------------------------------

const GPS_HELP = {
  source_type: {
    Original: 'The first recording of information -- created at or near the time of the event by someone with firsthand knowledge. Examples: original birth certificate, deed, church register.',
    Derivative: 'A later transcription, abstract, translation, or database image of an original. Examples: microfilmed census, digitized vital records, indexed abstracts.',
    Authored: 'An organized work created from multiple sources. Examples: family history books, biographies, compiled genealogies.',
  },
  info_type: {
    Primary: 'Information provided by someone with firsthand knowledge of the event being recorded.',
    Secondary: 'Information provided by someone without firsthand knowledge -- family tradition, hearsay, or information recorded long after the event.',
    Undetermined: 'The informant cannot be identified, or their knowledge at the time of the event cannot be assessed.',
    'N/A': 'Not applicable -- typically for authored works, finding aids, or sources where informant knowledge is irrelevant.',
  },
  evidence_type: {
    Direct: 'The source explicitly answers the question being researched without requiring inference.',
    Indirect: 'The source implies an answer but requires reasoning or inference to reach the conclusion.',
    Negative: 'The absence of the expected information in a source that should contain it -- which itself constitutes evidence.',
  },
} as const

// -------------------------------------------------------------------------
// Form state and steps
// -------------------------------------------------------------------------

type Step = 'category' | 'fields' | 'gps' | 'citation' | 'review'
const STEP_ORDER: Step[] = ['category', 'fields', 'gps', 'citation', 'review']
const STEP_LABELS: Record<Step, string> = {
  category: 'Source Type',
  fields:   'Details',
  gps:      'Classification',
  citation: 'Citation',
  review:   'Review',
}

interface FormState {
  category:         SourceCategory | null
  label:            string
  fields:           Record<string, string>
  source_type:      SourceType | ''
  info_type:        InfoType | ''
  evidence_type:    EvidenceType | ''
  ee_full_citation: string
  ee_short_citation: string
  repository:       string
  collection:       string
  ark_identifier:   string
  nara_series:      string
  ancestry_url:     string
}

const INITIAL: FormState = {
  category: null, label: '', fields: {},
  source_type: '', info_type: '', evidence_type: '',
  ee_full_citation: '', ee_short_citation: '',
  repository: '', collection: '', ark_identifier: '', nara_series: '', ancestry_url: '',
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

export default function NewSourcePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const stepIndex = STEP_ORDER.indexOf(step)
  const category = CATEGORIES.find(c => c.id === form.category)

  // ---- helpers ---------------------------------------------------------

  const setField = (key: string, val: string) =>
    setForm(f => ({ ...f, fields: { ...f.fields, [key]: val } }))

  function setTop<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  const canAdvance = (): boolean => {
    if (step === 'category') return !!form.category
    if (step === 'fields') {
      if (!category) return false
      return category.fields.filter(f => f.required).every(f => !!form.fields[f.key]?.trim())
    }
    if (step === 'gps') return !!form.source_type && !!form.info_type && !!form.evidence_type
    if (step === 'citation') return !!form.label.trim() && !!form.ee_full_citation.trim() && !!form.ee_short_citation.trim()
    return true
  }

  const advance = () => { const n = STEP_ORDER[stepIndex + 1]; if (n) setStep(n) }
  const back    = () => { const p = STEP_ORDER[stepIndex - 1]; if (p) setStep(p) }

  const save = async () => {
    setSaving(true); setSaveError(null)
    try {
      const body = {
        label:            form.label,
        source_type:      form.source_type,
        info_type:        form.info_type,
        evidence_type:    form.evidence_type,
        ee_full_citation: form.ee_full_citation,
        ee_short_citation: form.ee_short_citation,
        repository:       form.repository || form.fields.repository || null,
        collection:       form.collection || null,
        ark_identifier:   form.ark_identifier || null,
        nara_series:      form.nara_series || form.fields.nara_series || null,
        ancestry_url:     form.ancestry_url || form.fields.ancestry_url || form.fields.url || null,
      }
      const res = await fetch('/api/citation-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }
      const data = await res.json()
      router.push(`/citation-builder/${data.source.id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
      setSaving(false)
    }
  }

  // ---- render ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Back link */}
        <button
          onClick={() => router.push('/citation-builder')}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] mb-6 block"
        >
          ← Source Library
        </button>

        {/* Title */}
        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-8">New Source</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-10 flex-wrap">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-mono transition-colors ${
                i < stepIndex
                  ? 'bg-[var(--color-gold)] text-[var(--color-bg)]'
                  : i === stepIndex
                  ? 'border-2 border-[var(--color-gold)] text-[var(--color-gold)]'
                  : 'border border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}>{i + 1}</div>
              <span className={`text-xs hidden sm:block ${
                i === stepIndex ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
              }`}>{STEP_LABELS[s]}</span>
              {i < STEP_ORDER.length - 1 && (
                <div className="w-4 h-px bg-[var(--color-border)] mx-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* ---- STEP: category ----------------------------------------- */}
        {step === 'category' && (
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              What type of source is this?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setTop('category', cat.id); setStep('fields') }}
                  className={`p-4 text-left border rounded transition-colors hover:border-[var(--color-gold)] ${
                    form.category === cat.id
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-semibold">{cat.label}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1 leading-snug">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- STEP: fields ------------------------------------------- */}
        {step === 'fields' && category && (
          <div>
            <h2 className="font-display text-xl mb-1">
              {category.icon} {category.label}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Fill in what you know.</p>
            <div className="space-y-5">
              {category.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold mb-1.5">
                    {field.label}
                    {field.required && <span className="text-[var(--color-gold)] ml-1">*</span>}
                  </label>
                  {field.hint && (
                    <p className="text-xs text-[var(--color-text-muted)] mb-1.5">{field.hint}</p>
                  )}
                  {field.type === 'select' ? (
                    <select
                      value={form.fields[field.key] ?? ''}
                      onChange={e => setField(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={form.fields[field.key] ?? ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)] resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form.fields[field.key] ?? ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- STEP: GPS classification ------------------------------- */}
        {step === 'gps' && (
          <div>
            <h2 className="font-display text-xl mb-1">GPS Classification</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Three required classifications. These apply to the source, the informant,
              and the relationship between this source and your research question.
            </p>

            {/* Source Type */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                Source Type <span className="text-[var(--color-gold)]">*</span>
              </h3>
              <div className="space-y-2">
                {(['Original', 'Derivative', 'Authored'] as SourceType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setTop('source_type', type)}
                    className={`w-full p-3.5 text-left border rounded transition-colors ${
                      form.source_type === type
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex-shrink-0 transition-colors ${
                        form.source_type === type
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                          : 'border-[var(--color-border)]'
                      }`} />
                      <div>
                        <span className="text-sm font-semibold">{type}</span>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                          {GPS_HELP.source_type[type]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Information Type */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                Information Type <span className="text-[var(--color-gold)]">*</span>
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                Did the informant have firsthand knowledge of the event?
              </p>
              <div className="space-y-2">
                {(['Primary', 'Secondary', 'Undetermined', 'N/A'] as InfoType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setTop('info_type', type)}
                    className={`w-full p-3.5 text-left border rounded transition-colors ${
                      form.info_type === type
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex-shrink-0 transition-colors ${
                        form.info_type === type
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                          : 'border-[var(--color-border)]'
                      }`} />
                      <div>
                        <span className="text-sm font-semibold">{type}</span>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                          {GPS_HELP.info_type[type]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Evidence Classification */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                Evidence Classification <span className="text-[var(--color-gold)]">*</span>
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                How does this source relate to the specific fact you are trying to prove?
              </p>
              <div className="space-y-2">
                {(['Direct', 'Indirect', 'Negative'] as EvidenceType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setTop('evidence_type', type)}
                    className={`w-full p-3.5 text-left border rounded transition-colors ${
                      form.evidence_type === type
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex-shrink-0 transition-colors ${
                        form.evidence_type === type
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                          : 'border-[var(--color-border)]'
                      }`} />
                      <div>
                        <span className="text-sm font-semibold">{type}</span>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                          {GPS_HELP.evidence_type[type]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ---- STEP: citation ----------------------------------------- */}
        {step === 'citation' && (
          <div>
            <h2 className="font-display text-xl mb-1">Citation</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Enter the Evidence Explained-style citation. Both forms are required
              before this source may be cited in any output.
            </p>

            <div className="space-y-6">
              {/* Label */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Source label <span className="text-[var(--color-gold)]">*</span>
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                  Short display name used throughout the platform.
                </p>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setTop('label', e.target.value)}
                  placeholder="e.g., 1907 Passenger Manifest, S.S. Marion"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              {/* Full citation */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Full citation (first-reference form) <span className="text-[var(--color-gold)]">*</span>
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                  Complete EE-style citation as it appears in a first footnote.
                </p>
                <textarea
                  rows={6}
                  value={form.ee_full_citation}
                  onChange={e => setTop('ee_full_citation', e.target.value)}
                  placeholder={`"New York, Passenger Lists, 1820-1957," database and images, Ancestry (https://www.ancestry.com : accessed 2 May 2026), entry for [name], arriving [date] aboard S.S. Marion; citing NARA microfilm T715, roll 1047.`}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--color-gold)] resize-none"
                />
              </div>

              {/* Short citation */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Short reference note (subsequent-reference form) <span className="text-[var(--color-gold)]">*</span>
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                  Abbreviated form for subsequent footnotes in the same document.
                </p>
                <textarea
                  rows={3}
                  value={form.ee_short_citation}
                  onChange={e => setTop('ee_short_citation', e.target.value)}
                  placeholder={`"New York, Passenger Lists," Ancestry, entry for [name], S.S. Marion, [date].`}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--color-gold)] resize-none"
                />
              </div>

              {/* Optional identifiers */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  Optional identifiers
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'ark_identifier' as keyof FormState, label: 'FamilySearch ARK identifier', placeholder: 'ark:/61903/...' },
                    { key: 'collection'     as keyof FormState, label: 'Collection name', placeholder: 'Within the repository' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1">{f.label}</label>
                      <input
                        type="text"
                        value={form[f.key] as string}
                        onChange={e => setTop(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- STEP: review ------------------------------------------- */}
        {step === 'review' && (
          <div>
            <h2 className="font-display text-xl mb-1">Review</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Confirm before saving to the Source Library.
            </p>

            <div className="space-y-5">
              {/* Label + badges */}
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <p className="font-semibold text-lg mb-3">{form.label}</p>
                <div className="flex gap-3 flex-wrap text-xs font-mono">
                  <span className="px-2 py-0.5 border border-green-400/30 text-green-400 bg-green-400/10 rounded">
                    {form.source_type}
                  </span>
                  <span className="text-[var(--color-text-muted)]">{form.info_type} information</span>
                  <span className="text-[var(--color-text-muted)]">{form.evidence_type} evidence</span>
                </div>
              </div>

              {/* Full citation */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Full citation
                </p>
                <p className="text-sm font-mono leading-relaxed p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                  {form.ee_full_citation}
                </p>
              </div>

              {/* Short citation */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Short reference note
                </p>
                <p className="text-sm font-mono leading-relaxed p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                  {form.ee_short_citation}
                </p>
              </div>

              {/* Source-specific fields */}
              {category && Object.entries(form.fields).some(([, v]) => !!v) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                    Source details
                  </p>
                  <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded space-y-2">
                    {category.fields.map(f =>
                      form.fields[f.key] ? (
                        <div key={f.key} className="flex gap-3 text-sm">
                          <span className="text-[var(--color-text-muted)] min-w-[140px] flex-shrink-0 text-xs">
                            {f.label}
                          </span>
                          <span className="text-[var(--color-text)] text-xs break-all">
                            {form.fields[f.key]}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {saveError && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">
                  {saveError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- Navigation -------------------------------------------- */}
        {step !== 'category' && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--color-border)]">
            <button
              onClick={back}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              ← Back
            </button>

            {step === 'review' ? (
              <button
                onClick={save}
                disabled={saving}
                className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'Saving...' : 'Save Source'}
              </button>
            ) : (
              <button
                onClick={advance}
                disabled={!canAdvance()}
                className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Continue →
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
