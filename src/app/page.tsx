// Project-G Dashboard
// Phase 3 -- module list and navigation hub
// Modules are listed in build order per AGENT.md.

import Link from 'next/link'

type ModuleStatus = 'COMPLETE' | 'BUILD READY' | 'NOT STARTED'

const MODULES: { id: number; name: string; status: ModuleStatus; href: string }[] = [
  { id: 4,  name: 'Citation Builder',           status: 'COMPLETE',    href: '/citation-builder'   },
  { id: 10, name: 'Case Study Builder',          status: 'COMPLETE',    href: '/case-study'         },
  { id: 5,  name: 'Document Analysis Worksheet', status: 'COMPLETE',    href: '/document-analysis'  },
  { id: 3,  name: 'Research Log',                status: 'COMPLETE',    href: '/research-log'       },
  { id: 2,  name: 'Research Plan Builder',       status: 'COMPLETE',    href: '/research-plans'     },
  { id: 15, name: 'Research To-Do Tracker',      status: 'COMPLETE',    href: '/todos'              },
  { id: 6,  name: 'Source Conflict Resolver',    status: 'COMPLETE',    href: '/conflict-resolver'  },
  { id: 7,  name: 'Timeline Builder',            status: 'COMPLETE',    href: '/timeline'           },
  { id: 9,  name: 'Research Report Writer',      status: 'NOT STARTED', href: '/report-writer'      },
  { id: 1,  name: 'GEDCOM Bridge',               status: 'NOT STARTED', href: '/gedcom-bridge'      },
  { id: 11, name: 'Family Group Sheet Builder',  status: 'NOT STARTED', href: '/family-group-sheet' },
  { id: 8,  name: 'FAN Club Mapper',             status: 'NOT STARTED', href: '/fan-club'           },
  { id: 14, name: 'DNA Evidence Tracker',        status: 'NOT STARTED', href: '/dna-tracker'        },
  { id: 12, name: 'Correspondence Log',          status: 'NOT STARTED', href: '/correspondence'     },
  { id: 13, name: 'File Naming System',          status: 'NOT STARTED', href: '/file-naming'        },
]

const STATUS_STYLE: Record<ModuleStatus, { bg: string; color: string }> = {
  'COMPLETE':    { bg: 'var(--green-bg)',         color: 'var(--green-ink)' },
  'BUILD READY': { bg: 'var(--amber-bg)',         color: 'var(--amber-ink)' },
  'NOT STARTED': { bg: 'var(--parchment-darker)', color: 'var(--ink-faint)' },
}

export default function Dashboard() {
  const complete = MODULES.filter(m => m.status === 'COMPLETE').length

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="border-b-2 border-[var(--ink)] pb-6 mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-2">
          Project-G &mdash; Genealogy Research Platform
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-2">
          Research Operations
        </h1>
        <p className="text-[var(--ink-soft)] italic">
          GPS-compliant tools for serious genealogical research
        </p>
      </div>

      <div className="mb-4">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase">
          Modules &mdash; Build Order
        </p>
      </div>

      <div className="space-y-2">
        {MODULES.map((mod) => {
          const isLive = mod.status === 'COMPLETE'
          const style  = STATUS_STYLE[mod.status]

          const inner = (
            <>
              <span className="font-mono text-xs text-[var(--ink-faint)] w-6 text-right flex-shrink-0">
                {mod.id}
              </span>
              <span className="flex-1 text-sm font-semibold text-[var(--ink)]">
                {mod.name}
              </span>
              <span
                className="font-mono text-xs px-2 py-1 rounded"
                style={{ background: style.bg, color: style.color }}
              >
                {mod.status}
              </span>
            </>
          )

          if (isLive) {
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="flex items-center gap-4 p-4 rounded border border-[var(--rule)] bg-[var(--parchment)] hover:border-[var(--gold-mid)] hover:bg-[var(--gold-light)] transition-colors"
              >
                {inner}
              </Link>
            )
          }

          return (
            <div
              key={mod.id}
              className="flex items-center gap-4 p-4 rounded border border-[var(--rule)] bg-[var(--parchment)] opacity-60 cursor-default"
            >
              {inner}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[var(--ink-faint)] mt-8 font-mono">
        Phase 3 active &mdash; {complete} of {MODULES.length} modules complete
      </p>

      {/* Utility links */}
      <div className="mt-8 pt-6 border-t border-[var(--rule)] flex gap-6">
        <Link
          href="/persons"
          className="text-xs font-mono text-[var(--ink-faint)] hover:text-[var(--gold-mid)] transition-colors"
        >
          Manage Persons
        </Link>
      </div>
    </div>
  )
}
