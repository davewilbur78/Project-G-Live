'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Todo } from '@/types'

const PRIORITY_STYLE = {
  high:   { label: 'High',   className: 'text-red-700 bg-red-50 border-red-200' },
  medium: { label: 'Medium', className: 'text-amber-700 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    className: 'text-[var(--color-text-muted)] bg-[var(--color-surface)] border-[var(--color-border)]' },
}

const STATUS_CYCLE: Record<string, string> = {
  open:        'in_progress',
  in_progress: 'complete',
  complete:    'open',
  dropped:     'open',
}

const STATUS_LABEL: Record<string, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  complete:    'Complete',
  dropped:     'Dropped',
}

const STATUS_DOT: Record<string, string> = {
  open:        'border-[var(--color-border)] bg-transparent',
  in_progress: 'border-[var(--color-gold)] bg-[var(--color-gold-subtle)]',
  complete:    'border-green-500 bg-green-500',
  dropped:     'border-red-400 bg-red-100',
}

export default function TodoListPage() {
  const [todos,        setTodos]        = useState<Todo[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('active') // 'active' | 'complete' | 'all'
  const [toggling,     setToggling]     = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/todos')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTodos(data.todos ?? [])
    } catch {
      setError('Could not load to-dos. Check Supabase connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function cycleStatus(todo: Todo) {
    setToggling(todo.id)
    const next = STATUS_CYCLE[todo.status] ?? 'open'
    try {
      const res  = await fetch(`/api/todos/${todo.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTodos(prev => prev.map(t => t.id === todo.id ? data.todo : t))
    } catch {
      // silent fail -- reload on next visit
    } finally {
      setToggling(null)
    }
  }

  const visible = todos.filter(t => {
    if (filterStatus === 'active')   return t.status === 'open' || t.status === 'in_progress'
    if (filterStatus === 'complete') return t.status === 'complete' || t.status === 'dropped'
    return true
  })

  const openCount     = todos.filter(t => t.status === 'open').length
  const inProgCount   = todos.filter(t => t.status === 'in_progress').length
  const completeCount = todos.filter(t => t.status === 'complete').length

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
              &larr; Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Research To-Do Tracker</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Running research agenda. Every open lead, every unanswered question, every source to check.
            </p>
          </div>
          <Link
            href="/todos/new"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
          >
            + Add Item
          </Link>
        </div>

        {/* Stats bar */}
        {!loading && !error && todos.length > 0 && (
          <div className="flex gap-6 mb-6 font-mono text-xs text-[var(--color-text-muted)]">
            <span>{openCount} open</span>
            <span>{inProgCount} in progress</span>
            <span>{completeCount} complete</span>
          </div>
        )}

        {/* Filter tabs */}
        {!loading && !error && todos.length > 0 && (
          <div className="flex gap-1 mb-6">
            {(['active', 'complete', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                  filterStatus === f
                    ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]'
                }`}
              >
                {f === 'active' ? 'Active' : f === 'complete' ? 'Done' : 'All'}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-sm text-[var(--color-text-muted)] py-8">Loading to-dos...</p>}

        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
            <p className="text-xs mt-1 text-red-300/70">
              Run <code className="font-mono">sql/005-add-todos.sql</code> in Supabase.
            </p>
          </div>
        )}

        {!loading && !error && todos.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">No research items yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Add every open research lead, source to check, or question to answer.
              Nothing gets dropped if it is written down.
            </p>
            <Link
              href="/todos/new"
              className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Add First Item
            </Link>
          </div>
        )}

        {!loading && !error && todos.length > 0 && visible.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">
            No items in this view.
          </p>
        )}

        <div className="space-y-2">
          {visible.map(todo => {
            const p        = PRIORITY_STYLE[todo.priority as keyof typeof PRIORITY_STYLE] ?? PRIORITY_STYLE.medium
            const isDone   = todo.status === 'complete' || todo.status === 'dropped'
            const isToggling = toggling === todo.id

            return (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-opacity ${
                  isDone ? 'opacity-50' : ''
                }`}
              >
                {/* Status cycle button */}
                <button
                  onClick={() => cycleStatus(todo)}
                  disabled={isToggling}
                  title={`Status: ${STATUS_LABEL[todo.status]} -- click to advance`}
                  className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 transition-colors ${
                    STATUS_DOT[todo.status]
                  } ${isToggling ? 'opacity-50' : ''}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-1">
                    <Link
                      href={`/todos/${todo.id}`}
                      className={`flex-1 text-sm font-semibold hover:text-[var(--color-gold)] transition-colors ${
                        isDone ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                      }`}
                    >
                      {todo.title}
                    </Link>
                    <span className={`shrink-0 text-xs px-2 py-0.5 border rounded font-mono ${p.className}`}>
                      {p.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {todo.person && (
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {todo.person.display_name}
                      </span>
                    )}
                    {todo.source_type_hint && (
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">
                        {todo.source_type_hint}
                      </span>
                    )}
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">
                      {STATUS_LABEL[todo.status]}
                    </span>
                    {todo.due_date && (
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">
                        Due {new Date(todo.due_date + 'T00:00:00').toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {todo.notes && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 line-clamp-2">
                      {todo.notes}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
