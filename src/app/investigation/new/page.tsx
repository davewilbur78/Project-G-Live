'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewInvestigationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    problem_statement: '',
    entry_point: 'known_problem',
  })

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.problem_statement.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/investigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to open investigation.')
        setSaving(false)
        return
      }
      const data = await res.json()
      router.push(`/investigation/${data.id}`)
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  const ENTRY_OPTIONS = [
    {
      value: 'known_problem',
      label: 'Known problem from the start',
      desc: 'You have a situation requiring open-ended investigation before a hypothesis can form. Example: a DNA match you cannot identify, a name cluster with conflicting records.',
    },
    {
      value: 'mid_research',
      label: 'Problem crystallized mid-research',
      desc: 'You were building a record or case study and realized you need to stop and investigate before continuing. Example: discovering multiple individuals share a name in the same place and time.',
    },
    {
      value: 'conflict_detection',
      label: 'Conflict detection triggered this',
      desc: 'The data signaled something is wrong -- a conflict too tangled to resolve in the Source Conflict Resolver or Case Study Builder.',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/investigation" className="hover:text-stone-700">Research Investigation</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Open Investigation</span>
        </div>

        <h1 className="text-2xl font-serif text-stone-900 mb-2">Open an Investigation</h1>
        <p className="text-stone-500 text-sm mb-8">
          Describe the research problem. The workbench grows from the conversation.
        </p>

        <div className="bg-white border border-stone-200 rounded p-6 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Investigation Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Barnholtz Disambiguation -- St. Louis 1920s-1930s"
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <p className="text-xs text-stone-400 mt-1">
              Plain English. This is how you find it later.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Problem Statement
            </label>
            <textarea
              value={form.problem_statement}
              onChange={e => setForm(f => ({ ...f, problem_statement: e.target.value }))}
              rows={6}
              placeholder="Describe the research problem in your own words. What are you trying to resolve? What is uncertain or conflicting? What have you tried so far? The AI partner will read this before you type the first message."
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              How did this investigation begin?
            </label>
            <div className="space-y-2">
              {ENTRY_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    form.entry_point === opt.value
                      ? 'border-stone-600 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="entry_point"
                    value={opt.value}
                    checked={form.entry_point === opt.value}
                    onChange={e => setForm(f => ({ ...f, entry_point: e.target.value }))}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="text-sm font-medium text-stone-800">{opt.label}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving || !form.name.trim() || !form.problem_statement.trim()}
              className="bg-stone-800 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Opening...' : 'Open Investigation'}
            </button>
            <Link
              href="/investigation"
              className="border border-stone-300 text-stone-600 px-4 py-2 rounded text-sm hover:border-stone-500 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
