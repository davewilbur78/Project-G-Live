// Case Study Builder -- detail / 5-stage builder
// This page will render the 5-stage GPS workflow for a single case study.
// Phase 3: replace stub with live Supabase reads and stage components.

interface Props {
  params: { id: string }
}

export default function CaseStudyDetail({ params }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="border-b-2 border-[var(--ink)] pb-6 mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-2">
          Case Study &mdash; {params.id}
        </p>
        <h1 className="font-display text-3xl font-bold text-[var(--ink)]">
          Loading case study...
        </h1>
      </div>

      {/*
        Five stage components go here:
        <Stage1ResearchQuestion />
        <Stage2SourceInventory />
        <Stage3EvidenceChain />
        <Stage4ConflictAnalysis />
        <Stage5ProofArgument />

        Stage nav and progress dots match prototype design.
        Refer to prototypes/case_study_builder_v2.html as the design spec.
      */}

      <div
        className="border border-[var(--rule)] rounded p-8"
        style={{ background: 'var(--parchment)' }}
      >
        <p className="font-mono text-xs text-[var(--ink-faint)] uppercase tracking-widest">
          Stage components not yet built -- see prototype for design spec
        </p>
      </div>
    </div>
  )
}
