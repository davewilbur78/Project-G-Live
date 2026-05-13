'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ---- Types ----

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type Evidence = {
  id: string
  title: string
  record_type: string | null
  record_date: string | null
  notes: string | null
  added_at: string
}

type MatrixCell = {
  id: string
  candidate_id: string
  record_type: string
  value: string | null
}

type Candidate = {
  id: string
  candidate_name: string
  status: 'unresolved' | 'confirmed' | 'eliminated'
  notes: string | null
  matrix_cells: MatrixCell[]
}

type Investigation = {
  id: string
  name: string
  problem_statement: string
  status: string
  entry_point: string
  orientation: { determined_so_far?: string; next_question?: string } | null
  conclusion_notes: string | null
  opened_at: string
  last_worked_at: string
  persons?: { id: string; given_name: string; surname: string } | null
}

type Tab = 'conversation' | 'evidence' | 'people' | 'conclusions'

// ---- Constants ----

const STATUS_COLORS: Record<string, string> = {
  in_progress: 'bg-blue-100 text-blue-800',
  resolved:    'bg-green-100 text-green-800',
  stalled:     'bg-yellow-100 text-yellow-800',
  handed_off:  'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'In Progress',
  resolved:    'Resolved',
  stalled:     'Stalled',
  handed_off:  'Handed Off',
}

const CANDIDATE_COLORS: Record<string, string> = {
  unresolved: 'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-green-100 text-green-800',
  eliminated: 'bg-red-100 text-red-800',
}

// ---- Component ----

export default function InvestigationWorkbenchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [inv, setInv] = useState<Investigation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [tab, setTab] = useState<Tab>('conversation')
  const [loading, setLoading] = useState(true)

  // Conversation
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Evidence form
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [evForm, setEvForm] = useState({ title: '', record_type: '', record_date: '', notes: '' })
  const [savingEv, setSavingEv] = useState(false)

  // Candidate form
  const [showCandForm, setShowCandForm] = useState(false)
  const [newCandName, setNewCandName] = useState('')
  const [savingCand, setSavingCand] = useState(false)

  // Matrix
  const [editingCell, setEditingCell] = useState<{ candidateId: string; recordType: string } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const [showAddCol, setShowAddCol] = useState(false)
  const [newColName, setNewColName] = useState('')

  // Conclusions
  const [conclusionNotes, setConclusionNotes] = useState('')
  const [savingConclusions, setSavingConclusions] = useState(false)
  const [saved, setSaved] = useState(false)

  // ---- Data loading ----

  const loadAll = useCallback(async () => {
    const [invData, msgs, evid, cands] = await Promise.all([
      fetch(`/api/investigation/${id}`).then(r => r.json()),
      fetch(`/api/investigation/${id}/messages`).then(r => r.json()),
      fetch(`/api/investigation/${id}/evidence`).then(r => r.json()),
      fetch(`/api/investigation/${id}/candidates`).then(r => r.json()),
    ])
    setInv(invData)
    setMessages(Array.isArray(msgs) ? msgs : [])
    setEvidence(Array.isArray(evid) ? evid : [])
    setCandidates(Array.isArray(cands) ? cands : [])
    setConclusionNotes(invData?.conclusion_notes ?? '')
    setLoading(false)
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (tab === 'conversation') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, tab])

  // ---- Conversation ----

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    setMessages(m => [...m, { id: 'opt', role: 'user', content, created_at: new Date().toISOString() }])
    await fetch(`/api/investigation/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const fresh = await fetch(`/api/investigation/${id}/messages`).then(r => r.json())
    setMessages(Array.isArray(fresh) ? fresh : [])
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ---- Evidence ----

  const saveEvidence = async () => {
    if (!evForm.title.trim()) return
    setSavingEv(true)
    await fetch(`/api/investigation/${id}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evForm),
    })
    const fresh = await fetch(`/api/investigation/${id}/evidence`).then(r => r.json())
    setEvidence(Array.isArray(fresh) ? fresh : [])
    setEvForm({ title: '', record_type: '', record_date: '', notes: '' })
    setShowEvidenceForm(false)
    setSavingEv(false)
  }

  // ---- Candidates ----

  const saveCandidate = async () => {
    if (!newCandName.trim()) return
    setSavingCand(true)
    await fetch(`/api/investigation/${id}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_name: newCandName }),
    })
    const fresh = await fetch(`/api/investigation/${id}/candidates`).then(r => r.json())
    setCandidates(Array.isArray(fresh) ? fresh : [])
    setNewCandName('')
    setShowCandForm(false)
    setSavingCand(false)
  }

  const updateCandidateStatus = async (candidateId: string, status: string) => {
    await fetch(`/api/investigation/${id}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const fresh = await fetch(`/api/investigation/${id}/candidates`).then(r => r.json())
    setCandidates(Array.isArray(fresh) ? fresh : [])
  }

  // ---- Matrix ----

  const saveCell = async (candidateId: string, recordType: string) => {
    await fetch(`/api/investigation/${id}/matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, record_type: recordType, value: cellValue }),
    })
    const fresh = await fetch(`/api/investigation/${id}/candidates`).then(r => r.json())
    setCandidates(Array.isArray(fresh) ? fresh : [])
    setEditingCell(null)
    setCellValue('')
  }

  const addColumn = async () => {
    if (!newColName.trim() || candidates.length === 0) return
    await Promise.all(
      candidates.map(c =>
        fetch(`/api/investigation/${id}/matrix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidate_id: c.id, record_type: newColName.trim(), value: null }),
        })
      )
    )
    const fresh = await fetch(`/api/investigation/${id}/candidates`).then(r => r.json())
    setCandidates(Array.isArray(fresh) ? fresh : [])
    setNewColName('')
    setShowAddCol(false)
  }

  // ---- Conclusions ----

  const saveConclusions = async () => {
    setSavingConclusions(true)
    const res = await fetch(`/api/investigation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conclusion_notes: conclusionNotes }),
    })
    const updated = await res.json()
    setInv(updated)
    setSavingConclusions(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/investigation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      }),
    })
    const updated = await res.json()
    setInv(updated)
  }

  // ---- Derived ----

  const recordTypes = Array.from(
    new Set(candidates.flatMap(c => (c.matrix_cells ?? []).map(mc => mc.record_type)))
  )

  // ---- Render guards ----

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading investigation...</p>
      </div>
    )
  }

  if (!inv) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Investigation not found.</p>
      </div>
    )
  }

  // ---- Main render ----

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 pt-4 pb-0">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <div className="mb-2 text-xs text-stone-400">
            <Link href="/" className="hover:text-stone-600">Dashboard</Link>
            <span className="mx-2">/</span>
            <Link href="/investigation" className="hover:text-stone-600">Research Investigation</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-700">{inv.name}</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-serif text-stone-900">{inv.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>
                  {STATUS_LABELS[inv.status]}
                </span>
                {inv.persons && (
                  <span className="text-xs text-stone-400">
                    Subject: {inv.persons.given_name} {inv.persons.surname}
                  </span>
                )}
              </div>

              {/* Orientation block */}
              {inv.orientation?.determined_so_far ? (
                <div className="mt-1 text-xs text-stone-500">
                  <span className="font-medium">Determined: </span>{inv.orientation.determined_so_far}
                  {inv.orientation.next_question && (
                    <span className="ml-3">
                      <span className="font-medium">Open: </span>{inv.orientation.next_question}
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs text-stone-400 max-w-2xl line-clamp-2">{inv.problem_statement}</p>
              )}
            </div>

            <div className="text-right text-xs text-stone-400 shrink-0">
              <div>Opened {new Date(inv.opened_at).toLocaleDateString()}</div>
              <div>Worked {new Date(inv.last_worked_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-3">
            {([
              { key: 'conversation', label: `Conversation (${messages.length})` },
              { key: 'evidence',     label: `Evidence (${evidence.length})` },
              { key: 'people',       label: `People & Matrix (${candidates.length})` },
              { key: 'conclusions',  label: 'Conclusions' },
            ] as { key: Tab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-stone-800 text-stone-900 font-medium'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">

        {/* === CONVERSATION === */}
        {tab === 'conversation' && (
          <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 240px)' }}>
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-stone-400 text-sm mb-2">No messages yet.</p>
                  <p className="text-stone-400 text-xs max-w-sm mx-auto">
                    Your AI research partner has read the problem statement and is ready.
                    Describe what you are seeing, share a record, or ask where to look next.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id + idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-prose rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-stone-800 text-white rounded-tr-none'
                          : 'bg-white border border-stone-200 text-stone-800 shadow-sm rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 150, 300].map(delay => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border border-stone-200 rounded-lg p-3 flex gap-3 items-end shadow-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you are seeing, share a record, or ask where to look next. Shift+Enter for a new line."
                rows={3}
                disabled={sending}
                className="flex-1 text-sm text-stone-800 resize-none focus:outline-none placeholder-stone-400"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="bg-stone-800 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors shrink-0"
              >
                {sending ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* === EVIDENCE === */}
        {tab === 'evidence' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-medium text-stone-800">Evidence Captured</h2>
                <p className="text-xs text-stone-400">Documents and records brought into this investigation.</p>
              </div>
              <button
                onClick={() => setShowEvidenceForm(f => !f)}
                className="text-sm text-stone-600 border border-stone-300 px-3 py-1.5 rounded hover:border-stone-500 transition-colors"
              >
                {showEvidenceForm ? 'Cancel' : '+ Add Evidence'}
              </button>
            </div>

            {showEvidenceForm && (
              <div className="bg-white border border-stone-200 rounded p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={evForm.title}
                      onChange={e => setEvForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. 1920 St. Louis City Directory, p. 142"
                      className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Record Type</label>
                    <input
                      type="text"
                      value={evForm.record_type}
                      onChange={e => setEvForm(f => ({ ...f, record_type: e.target.value }))}
                      placeholder="city directory, census, obituary..."
                      className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Record Date</label>
                    <input
                      type="text"
                      value={evForm.record_date}
                      onChange={e => setEvForm(f => ({ ...f, record_date: e.target.value }))}
                      placeholder="1920"
                      className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Notes</label>
                    <textarea
                      value={evForm.notes}
                      onChange={e => setEvForm(f => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      placeholder="What this record shows, why it matters, what it conflicts with..."
                      className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={saveEvidence}
                  disabled={savingEv || !evForm.title.trim()}
                  className="bg-stone-800 text-white px-3 py-1.5 rounded text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  {savingEv ? 'Saving...' : 'Add Evidence'}
                </button>
              </div>
            )}

            {evidence.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded p-10 text-center">
                <p className="text-stone-400 text-sm">No evidence captured yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      {['Title', 'Type', 'Date', 'Notes'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-medium text-stone-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {evidence.map(ev => (
                      <tr key={ev.id} className="hover:bg-stone-50">
                        <td className="px-4 py-2 text-stone-800">{ev.title}</td>
                        <td className="px-4 py-2 text-stone-500 text-xs">{ev.record_type ?? ''}</td>
                        <td className="px-4 py-2 text-stone-500 text-xs">{ev.record_date ?? ''}</td>
                        <td className="px-4 py-2 text-stone-500 text-xs">{ev.notes ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === PEOPLE & MATRIX === */}
        {tab === 'people' && (
          <div className="space-y-8">

            {/* Candidates */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-base font-medium text-stone-800">Candidate Persons</h2>
                  <p className="text-xs text-stone-400">Individuals identified during the investigation. Click status to update.</p>
                </div>
                <button
                  onClick={() => setShowCandForm(f => !f)}
                  className="text-sm text-stone-600 border border-stone-300 px-3 py-1.5 rounded hover:border-stone-500 transition-colors"
                >
                  {showCandForm ? 'Cancel' : '+ Add Candidate'}
                </button>
              </div>

              {showCandForm && (
                <div className="bg-white border border-stone-200 rounded p-3 mb-3 flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Candidate Name</label>
                    <input
                      type="text"
                      value={newCandName}
                      onChange={e => setNewCandName(e.target.value)}
                      placeholder="e.g. Abraham Barnholtz (butcher, north side)"
                      className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <button
                    onClick={saveCandidate}
                    disabled={savingCand || !newCandName.trim()}
                    className="bg-stone-800 text-white px-3 py-1.5 rounded text-sm hover:bg-stone-700 disabled:opacity-50 shrink-0"
                  >
                    {savingCand ? 'Adding...' : 'Add'}
                  </button>
                </div>
              )}

              {candidates.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded p-8 text-center">
                  <p className="text-stone-400 text-sm">No candidates yet. Add individuals as the investigation identifies them.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {candidates.map(c => (
                    <div key={c.id} className="bg-white border border-stone-200 rounded p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CANDIDATE_COLORS[c.status]}`}>
                          {c.status}
                        </span>
                        <span className="text-sm text-stone-800 truncate">{c.candidate_name}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(['unresolved', 'confirmed', 'eliminated'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => updateCandidateStatus(c.id, s)}
                            disabled={c.status === s}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              c.status === s
                                ? 'border-stone-400 bg-stone-100 text-stone-600 cursor-default'
                                : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matrix */}
            {candidates.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-base font-medium text-stone-800">Disambiguation Matrix</h2>
                    <p className="text-xs text-stone-400">Candidates as rows, record types as columns. Click any cell to add a finding.</p>
                  </div>
                  <button
                    onClick={() => setShowAddCol(f => !f)}
                    className="text-sm text-stone-600 border border-stone-300 px-3 py-1.5 rounded hover:border-stone-500 transition-colors"
                  >
                    {showAddCol ? 'Cancel' : '+ Add Column'}
                  </button>
                </div>

                {showAddCol && (
                  <div className="bg-white border border-stone-200 rounded p-3 mb-3 flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Column (Record Type)</label>
                      <input
                        type="text"
                        value={newColName}
                        onChange={e => setNewColName(e.target.value)}
                        placeholder="e.g. 1920 census, 1925 city directory, death record"
                        className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                    <button
                      onClick={addColumn}
                      disabled={!newColName.trim()}
                      className="bg-stone-800 text-white px-3 py-1.5 rounded text-sm hover:bg-stone-700 disabled:opacity-50 shrink-0"
                    >
                      Add Column
                    </button>
                  </div>
                )}

                {recordTypes.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded p-8 text-center">
                    <p className="text-stone-400 text-sm">No columns yet. Add a record type to start building the matrix.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-stone-200 rounded overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50">
                          <th className="text-left px-4 py-2 text-xs font-medium text-stone-600 whitespace-nowrap">Candidate</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-stone-600 whitespace-nowrap">Status</th>
                          {recordTypes.map(rt => (
                            <th key={rt} className="text-left px-3 py-2 text-xs font-medium text-stone-600 whitespace-nowrap">{rt}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {candidates.map(c => (
                          <tr key={c.id} className="hover:bg-stone-50">
                            <td className="px-4 py-2 text-stone-800 font-medium text-sm whitespace-nowrap">{c.candidate_name}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${CANDIDATE_COLORS[c.status]}`}>
                                {c.status}
                              </span>
                            </td>
                            {recordTypes.map(rt => {
                              const cell = (c.matrix_cells ?? []).find(mc => mc.record_type === rt)
                              const isEditing = editingCell?.candidateId === c.id && editingCell?.recordType === rt
                              return (
                                <td key={rt} className="px-3 py-2">
                                  {isEditing ? (
                                    <div className="flex gap-1 items-center">
                                      <input
                                        autoFocus
                                        type="text"
                                        value={cellValue}
                                        onChange={e => setCellValue(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') saveCell(c.id, rt)
                                          if (e.key === 'Escape') setEditingCell(null)
                                        }}
                                        className="w-28 border border-stone-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                                      />
                                      <button onClick={() => saveCell(c.id, rt)} className="text-xs text-green-600 hover:text-green-800">Save</button>
                                      <button onClick={() => setEditingCell(null)} className="text-xs text-stone-400 hover:text-stone-600">x</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingCell({ candidateId: c.id, recordType: rt })
                                        setCellValue(cell?.value ?? '')
                                      }}
                                      className="text-left w-full group min-w-[80px]"
                                    >
                                      {cell?.value != null ? (
                                        cell.value === '' ? (
                                          <span className="text-xs italic text-stone-400">not found</span>
                                        ) : (
                                          <span className="text-xs text-stone-700">{cell.value}</span>
                                        )
                                      ) : (
                                        <span className="text-xs text-stone-300 group-hover:text-stone-500">click to add</span>
                                      )}
                                    </button>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* === CONCLUSIONS === */}
        {tab === 'conclusions' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-base font-medium text-stone-800 mb-1">Investigation Status</h2>
              <p className="text-xs text-stone-400 mb-3">Update when the investigation resolves, stalls, or hands off to Case Study Builder.</p>
              <div className="flex gap-2 flex-wrap">
                {(['in_progress', 'resolved', 'stalled', 'handed_off'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                      inv.status === s
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'border-stone-300 text-stone-600 hover:border-stone-600'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-base font-medium text-stone-800 mb-1">Conclusion Notes</h2>
              <p className="text-xs text-stone-400 mb-3">
                What was determined. What evidence supports it. What remains open.
                What was handed off to Case Study Builder. This is the permanent record of the investigation outcome.
              </p>
              <textarea
                value={conclusionNotes}
                onChange={e => setConclusionNotes(e.target.value)}
                rows={14}
                placeholder="Write the conclusion in your own words..."
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={saveConclusions}
                  disabled={savingConclusions}
                  className="bg-stone-800 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  {savingConclusions ? 'Saving...' : 'Save Conclusions'}
                </button>
                {saved && <span className="text-xs text-green-600">Saved.</span>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
