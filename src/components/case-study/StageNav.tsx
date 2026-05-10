// StageNav -- 6-stage navigator for Case Study Builder
interface StageNavProps {
  currentStage: number
  maxReached:   number
  onSelect:     (stage: number) => void
}

const STAGES = [
  { n: 1, label: 'Research Question' },
  { n: 2, label: 'Source Inventory'  },
  { n: 3, label: 'Evidence Chain'    },
  { n: 4, label: 'Search Checklist'  },
  { n: 5, label: 'Conflict Analysis' },
  { n: 6, label: 'Proof Argument'    },
]

export function StageNav({ currentStage, maxReached, onSelect }: StageNavProps) {
  return (
    <nav aria-label="Case study stages" className="mb-10">
      <div className="flex items-start justify-between overflow-x-auto">
        {STAGES.map((stage, idx) => {
          const isActive    = stage.n === currentStage
          const isReached   = stage.n <= maxReached
          const isClickable = stage.n <= maxReached
          return (
            <div key={stage.n} className="flex items-start flex-1 min-w-0">
              {idx > 0 && (
                <div className={`h-px flex-1 mt-3.5 ${
                  isReached ? 'bg-[var(--color-gold)]/50' : 'bg-[var(--color-border)]'
                }`} />
              )}
              <button
                onClick={() => isClickable && onSelect(stage.n)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1.5 px-1.5 shrink-0 transition-colors ${
                  isActive    ? 'text-[var(--color-gold)]'
                  : isReached ? 'text-[var(--color-text-muted)] hover:text-[var(--color-gold)] cursor-pointer'
                              : 'text-[var(--color-border)] cursor-not-allowed'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  isActive
                    ? 'bg-[var(--color-gold)] text-[var(--color-bg)] border-[var(--color-gold)]'
                    : isReached
                    ? 'border-[var(--color-gold)]/50 text-[var(--color-gold)]/70'
                    : 'border-[var(--color-border)] text-[var(--color-border)]'
                }`}>
                  {stage.n}
                </div>
                <span className="text-xs font-mono text-center leading-tight hidden sm:block">
                  {stage.label}
                </span>
              </button>
              {idx < STAGES.length - 1 && (
                <div className={`h-px flex-1 mt-3.5 ${
                  stage.n < maxReached ? 'bg-[var(--color-gold)]/50' : 'bg-[var(--color-border)]'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
