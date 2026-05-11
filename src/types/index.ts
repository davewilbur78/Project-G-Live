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
  repository_id?: string | null   // FK to repositories table (added migration 011)
  collection?: string | null
  ark_identifier?: string | null
  nara_series?: string | null
  ancestry_url?: string | null
  created_at: string
  updated_at: string
  // Joined
  repository_record?: Repository | null
}

export interface Person {
  id: string
  display_name: string
  given_name?: string | null
  surname?: string | null
  alt_names?: string[] | null
  // Name components (added migration 009)
  lnprefix?: string | null      // last name prefix: van, de, von
  suffix?: string | null        // Jr., Sr., III
  title?: string | null         // Dr., Rev., Capt.
  name_prefix?: string | null   // Mr., Mrs. as part of recorded name (GEDCOM NPFX)
  nickname?: string | null
  // Demographic (added migration 009)
  sex?: 'M' | 'F' | 'U' | null
  living?: boolean
  private?: boolean
  // Date display strings (original columns -- keep as-is)
  birth_date?: string | null
  birth_place?: string | null
  death_date?: string | null
  death_place?: string | null
  // Date sort fields (added migration 009)
  birth_date_sort?: string | null   // ISO date for range queries
  death_date_sort?: string | null
  // Audit
  changedby?: string | null
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

// Source Conflict Resolver (Module 6)

export type SourceConflictStatus = 'open' | 'in_progress' | 'resolved'

export type FactInDispute =
  | 'birth_date' | 'birth_place' | 'name' | 'age'
  | 'death_date' | 'death_place' | 'residence'
  | 'immigration' | 'marriage' | 'occupation' | 'other'

export type ResolutionBasis =
  | 'source_quality' | 'preponderance' | 'corroboration' | 'inconclusive'

export interface SourceConflict {
  id: string
  person_id?: string | null
  title: string
  fact_in_dispute: FactInDispute
  description: string
  source_a_id?: string | null
  source_a_value?: string | null
  source_b_id?: string | null
  source_b_value?: string | null
  analysis_text?: string | null
  resolution?: string | null
  resolution_basis?: ResolutionBasis | null
  status: SourceConflictStatus
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  source_a?: Source | null
  source_b?: Source | null
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

// -----------------------------------------------------------------------
// Repositories (Module -- lookup table, migration 011)
// TIMESTAMP added: 2026-05-11 17:00 UTC
// -----------------------------------------------------------------------

export type RepositoryType =
  | 'archive'
  | 'library'
  | 'online'
  | 'courthouse'
  | 'church'
  | 'other'

export interface Repository {
  id: string
  name: string
  type: RepositoryType
  url?: string | null
  address_line?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

// -----------------------------------------------------------------------
// Families and Family Members (migration 010)
// TIMESTAMP added: 2026-05-11 17:00 UTC
// -----------------------------------------------------------------------

export type MarriageType =
  | 'MARR'   // Marriage (formal)
  | 'MARB'   // Marriage Banns
  | 'MARL'   // Marriage License
  | 'MARS'   // Marriage Settlement
  | 'COHA'   // Cohabitation / common law
  | 'other'

export interface Family {
  id: string
  partner1_id?: string | null
  partner2_id?: string | null
  marriage_date_display?: string | null
  marriage_date_sort?: string | null   // ISO date
  marriage_place?: string | null
  marriage_type?: MarriageType | null
  div_date_display?: string | null
  div_date_sort?: string | null        // ISO date
  div_place?: string | null
  living?: boolean
  private?: boolean
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined
  partner1?: Person | null
  partner2?: Person | null
  members?: FamilyMember[]
}

export type FamilyMemberRole = 'child' | 'partner'

export type RelationshipType =
  | 'natural'
  | 'adopted'
  | 'step'
  | 'foster'
  | 'unknown'

export interface FamilyMember {
  id: string
  person_id: string
  family_id: string
  role: FamilyMemberRole
  relationship_to_partner1?: RelationshipType | null
  relationship_to_partner2?: RelationshipType | null
  birth_order?: number | null
  has_descendants: boolean
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  family?: Family | null
}

// -----------------------------------------------------------------------
// Associations / FAN Club (migration 012)
// TIMESTAMP added: 2026-05-11 17:00 UTC
// -----------------------------------------------------------------------

export type AssociationType =
  | 'witness'
  | 'godparent'
  | 'employer'
  | 'employee'
  | 'neighbor'
  | 'colleague'
  | 'boarder'
  | 'landlord'
  | 'attorney'
  | 'physician'
  | 'other'

export interface Association {
  id: string
  person_id: string
  associated_person_id: string
  association_type: AssociationType
  description?: string | null
  source_id?: string | null
  date_display?: string | null
  date_sort?: string | null   // ISO date
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  associated_person?: Person | null
  source?: Source | null
}

// -----------------------------------------------------------------------
// Event Types lookup (migration 013)
// TIMESTAMP added: 2026-05-11 17:00 UTC
// -----------------------------------------------------------------------

export type EventTypeScope = 'individual' | 'family'

export interface EventType {
  id: string
  tag: string           // GEDCOM-style tag: BIRT, DEAT, MARR, etc.
  display_name: string
  scope: EventTypeScope
  is_built_in: boolean
  sort_order: number
  created_at: string
}

// -----------------------------------------------------------------------
// Timeline Builder (Module 7)
// TIMESTAMP added: 2026-05-11 00:25 UTC
// Updated: 2026-05-11 17:00 UTC -- added event_type_id from migration 013
// -----------------------------------------------------------------------

export type AddressRole =
  | 'residence'
  | 'employer'
  | 'next_of_kin'
  | 'witness'
  | 'informant'
  | 'decedent'
  | 'applicant'
  | 'beneficiary'
  | 'other'

export type TimelineEventType =
  | 'birth'
  | 'death'
  | 'marriage'
  | 'divorce'
  | 'residence'
  | 'immigration'
  | 'emigration'
  | 'naturalization'
  | 'military_service'
  | 'occupation'
  | 'land_record'
  | 'census'
  | 'baptism'
  | 'burial'
  | 'education'
  | 'other'

export interface Address {
  id: string
  person_id?: string | null
  source_id?: string | null
  address_role: AddressRole
  raw_text?: string | null
  street_address?: string | null
  city?: string | null
  county?: string | null
  state_province?: string | null
  country?: string | null
  lat?: number | null
  lng?: number | null
  address_date?: string | null
  date_qualifier: string
  date_display?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  source?: Source | null
}

export interface TimelineEvent {
  id: string
  person_id?: string | null
  event_type: TimelineEventType
  event_type_id?: string | null   // FK to event_types lookup (added migration 013)
  event_date?: string | null
  event_date_end?: string | null
  date_qualifier: string
  date_display?: string | null
  place_name?: string | null
  city?: string | null
  county?: string | null
  state_province?: string | null
  country?: string | null
  address_id?: string | null
  residence_date_from?: string | null
  residence_date_to?: string | null
  residence_from_qualifier?: string | null
  residence_to_qualifier?: string | null
  residence_current?: boolean | null
  source_id?: string | null
  evidence_type?: 'Direct' | 'Indirect' | 'Negative' | null
  description?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined
  person?: Person | null
  source?: Source | null
  address?: Address | null
  event_type_record?: EventType | null
}
