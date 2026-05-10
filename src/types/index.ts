// Entity interfaces for Project-G-Live
// GPS classification types (SourceType, InfoType, EvidenceType, etc.)
// are defined in @/lib/supabase and re-exported here for convenience.

import type {
  SourceType,
  InfoType,
  EvidenceType,
  TriageStatus,
  CaseStudyStatus,
  EvidenceWeight,
} from '@/lib/supabase'

export type {
  SourceType,
  InfoType,
  EvidenceType,
  TriageStatus,
  CaseStudyStatus,
  EvidenceWeight,
}

export interface Source {
  id: string
  label: string
  source_type: SourceType
  info_type: InfoType
  evidence_type: EvidenceType
  ee_full_citation: string
  ee_short_citation: string
  repository?: string | null
  collection?: string | null
  ark_identifier?: string | null
  nara_series?: string | null
  ancestry_url?: string | null
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  display_name: string
  given_name?: string | null
  surname?: string | null
  alt_names?: string[] | null
  birth_date?: string | null
  birth_place?: string | null
  death_date?: string | null
  death_place?: string | null
  notes?: string | null
  ancestry_id?: string | null
  created_at: string
  updated_at: string
}

export interface CaseStudy {
  id: string
  person_id?: string | null
  research_question: string
  subject_display: string
  subject_vitals?: string | null
  researcher: string
  status: CaseStudyStatus
  gps_stage_reached: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CaseStudySource {
  id: string
  case_study_id: string
  source_id: string
  triage_status: TriageStatus
  name_recorded?: string | null
  notes?: string | null
  display_order: number
  created_at: string
  updated_at: string
  // Joined from sources
  source?: Source
}

export interface EvidenceChainLink {
  id: string
  case_study_id: string
  display_order: number
  claim: string
  weight: EvidenceWeight
  sources_narrative?: string | null
  footnote_numbers?: number[] | null
  created_at: string
  updated_at: string
}

export interface Conflict {
  id: string
  case_study_id: string
  title: string
  source_a_id?: string | null
  source_b_id?: string | null
  name_in_a?: string | null
  name_in_b?: string | null
  analysis_text?: string | null
  is_resolved: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProofParagraph {
  id: string
  case_study_id: string
  display_order: number
  content: string           // may contain [FN1] markers
  created_at: string
  updated_at: string
}

export interface FootnoteDefinition {
  id: string
  case_study_id: string
  footnote_number: number
  citation_text: string
  case_study_source_id?: string | null
  created_at: string
  updated_at: string
}

export interface Citation {
  id: string
  source_id?: string | null
  context_type?: string | null
  context_id?: string | null
  fact_claimed?: string | null
  ee_full_citation?: string | null
  ee_short_citation?: string | null
  created_at: string
}

// Document Analysis Worksheet (Module 5)

export type TranscriptionStatus = 'pending' | 'complete' | 'error'

export interface Document {
  id: string
  source_id?: string | null
  label: string
  transcription?: string | null
  transcription_status: TranscriptionStatus
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined from sources
  source?: Source | null
}

export interface DocumentFact {
  id: string
  document_id: string
  claim_text: string
  source_type: SourceType
  info_type: InfoType
  evidence_type: EvidenceType
  display_order: number
  ai_generated: boolean
  notes?: string | null
  created_at: string
  updated_at: string
}

// Research Log (Module 3)

export type ResearchSessionStatus = 'draft' | 'complete'

export interface ResearchSession {
  id: string
  session_date: string        // date string: YYYY-MM-DD
  title: string
  goal: string
  person_id?: string | null
  research_plan_id?: string | null   // added by Module 2 migration
  finds?: string | null
  negatives?: string | null
  follow_up?: string | null
  notes?: string | null
  status: ResearchSessionStatus
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  session_sources?: SessionSource[]
}

export interface SessionSource {
  id: string
  session_id: string
  source_id?: string | null
  source_label: string
  yielded_results: boolean
  result_summary?: string | null
  display_order: number
  created_at: string
  updated_at: string
  // Joined from sources
  source?: Source | null
}

// Research To-Do Tracker (Module 15)

export type TodoStatus   = 'open' | 'in_progress' | 'complete' | 'dropped'
export type TodoPriority = 'high' | 'medium' | 'low'

export interface Todo {
  id: string
  person_id?: string | null
  title: string
  notes?: string | null
  priority: TodoPriority
  source_type_hint?: string | null
  origin_module?: string | null   // 'manual' | module name
  origin_id?: string | null       // polymorphic FK to originating record
  status: TodoStatus
  due_date?: string | null        // YYYY-MM-DD
  completed_at?: string | null
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
}

// Research Plan Builder (Module 2)

export type ResearchPlanStatus     = 'draft' | 'active' | 'complete'
export type ResearchPlanItemStatus = 'pending' | 'in_progress' | 'complete' | 'negative'
export type ResearchPlanItemPriority = 'High' | 'Medium' | 'Low'

export interface ResearchPlan {
  id: string
  person_id?: string | null
  title: string
  research_question: string
  time_period?: string | null
  geography?: string | null
  community?: string | null
  status: ResearchPlanStatus
  strategy_summary?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  items?: ResearchPlanItem[]
}

export interface ResearchPlanItem {
  id: string
  plan_id: string
  source_category: string
  repository?: string | null
  strategy_note?: string | null
  priority: ResearchPlanItemPriority
  status: ResearchPlanItemStatus
  display_order: number
  created_at: string
  updated_at: string
}

// Source category for the structured interview UI.
// Drives which field set appears in Step 2 of the new-source form.
export type SourceCategory =
  | 'vital-record'
  | 'census'
  | 'passenger-manifest'
  | 'naturalization'
  | 'land-deed'
  | 'probate'
  | 'newspaper'
  | 'photograph'
  | 'database'
  | 'website'
  | 'other'
