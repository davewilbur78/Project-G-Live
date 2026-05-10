'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { StageNav } from '@/components/case-study/StageNav'
import { Stage1ResearchQuestion } from '@/components/case-study/Stage1ResearchQuestion'
import { Stage2SourceInventory } from '@/components/case-study/Stage2SourceInventory'
import { Stage3EvidenceChain } from '@/components/case-study/Stage3EvidenceChain'
import { Stage4SearchChecklist } from '@/components/case-study/Stage4SearchChecklist'
import { Stage5ConflictAnalysis } from '@/components/case-study/Stage5ConflictAnalysis'
import { Stage6ProofArgument } from '@/components/case-study/Stage6ProofArgument'
import type { CaseStudy } from '@/types'

interface Props { params: Promise<{ id: string }> }

export default function CaseStudyDetailPage({ params }: Props) {
  const { id } = use(params)
  const [caseStudy,    setCaseStudy]    = useState<CaseStudy | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [activeStage,  setActiveStage]  = useState(1)

  const load = useCallback(async () => {
    const res = await fetch(`/api/case-study/${id}`)
    const d   = await res.json()
    if (!res.ok || d.error) { setError(d.error ?? 'Not found'); setLoading(false); return }
    setCaseStudy(d.case_study)
    setActiveStage(d.case_study.gps_stage_reached)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function advanceStage() {
    if (!caseStudy) return
    const next = activeStage + 1
    if (next > 6) return
    // Only patch if this is a new max
    if (next > caseStudy.gps_stage_reached) {
      const res = await fetch(`/api/case-study/${caseStudy.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gps_stage_reached: next }),
      })
      if (res.ok) { const d = await res.json(); setCaseStudy(d.case_study) }
    }
    setActiveStage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <p className="text-sm text-[var(--color-text-muted)]">Loading case study...</p>
    </div>
  )

  if (error || !caseStudy) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/case-study" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">\u2190 Case Studies</Link>
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error ?? 'Case study not found.'}</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link href="/case-study" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">\u2190 Case Studies</Link>
          <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">{caseStudy.subject_display}</h1>
          {caseStudy.subject_vitals && <p className="text-sm text-[var(--color-text-muted)]">{caseStudy.subject_vitals}</p>}
        </div>

        {/* Stage nav */}
        <StageNav
          currentStage={activeStage}
          maxReached={caseStudy.gps_stage_reached}
          onSelect={setActiveStage}
        />

        {/* Active stage */}
        {activeStage === 1 && <Stage1ResearchQuestion caseStudy={caseStudy} onUpdate={setCaseStudy} onAdvance={advanceStage} />}
        {activeStage === 2 && <Stage2SourceInventory  caseStudyId={caseStudy.id} onAdvance={advanceStage} />}
        {activeStage === 3 && <Stage3EvidenceChain    caseStudyId={caseStudy.id} onAdvance={advanceStage} />}
        {activeStage === 4 && <Stage4SearchChecklist  caseStudyId={caseStudy.id} onAdvance={advanceStage} />}
        {activeStage === 5 && <Stage5ConflictAnalysis caseStudyId={caseStudy.id} onAdvance={advanceStage} />}
        {activeStage === 6 && <Stage6ProofArgument    caseStudyId={caseStudy.id} />}

      </div>
    </div>
  )
}
