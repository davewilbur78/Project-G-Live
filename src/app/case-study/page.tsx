// Case Study Builder -- list page
// Lists all case studies. Entry point to the 5-stage builder.
// Phase 3: wire to Supabase once case_studies table exists.

export default function CaseStudyList() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="border-b-2 border-[var(--ink)] pb-6 mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-2">
          Project-G &mdash; Module 10
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-2">
          Case Study Builder
        </h1>
        <p className="text-[var(--ink-soft)] italic">
          GPS-compliant proof argument builder
        </p>
      </div>

      {/* Placeholder -- replace with live Supabase query */}
      <div
        className="border border-[var(--rule)] rounded p-8 text-center"
        style={{ background: 'var(--parchment)' }}
      >
        <p className="font-mono text-xs text-[var(--ink-faint)] uppercase tracking-widest mb-4">
          No case studies yet
        </p>
        <p className="text-sm text-[var(--ink-soft)] mb-6">
          Case studies will appear here once the Supabase tables are created
          and seeded. See the Singer/Springer prototype for the full UX.
        </p>
        <a
          href="/prototypes/case_study_builder_v2.html"
          className="font-mono text-xs text-[var(--gold)] underline"
        >
          View prototype (Singer/Springer)
        </a>
      </div>
    </div>
  )
}
