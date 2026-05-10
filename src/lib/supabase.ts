// Supabase client for Project-G-Live
// Single-user app -- no multi-tenancy.
// Browser client: use in Client Components.
// Server client: use in Server Components and API routes.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.local.example to .env.local and fill in your values.'
  )
}

// Browser client -- safe to use in Client Components.
// Re-uses a single instance across the app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client factory -- use in Server Components and route handlers.
// Accepts a service role key for elevated access when needed.
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    // Fall back to anon key for read operations
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Alias -- all API routes import this name.
// Both names refer to the same factory function.
export const createServerSupabaseClient = createServerClient

// Database type aliases -- expand as tables are built
// Full types will be generated from Supabase once tables exist in the project.
export type TriageStatus = 'GREEN' | 'YELLOW' | 'RED'
export type SourceType = 'Original' | 'Derivative' | 'Authored'
export type InfoType = 'Primary' | 'Secondary' | 'Undetermined' | 'N/A'
export type EvidenceType = 'Direct' | 'Indirect' | 'Negative'
export type EvidenceWeight = 'Very Strong' | 'Strong' | 'Moderate' | 'Corroborating'
export type CaseStudyStatus = 'draft' | 'in_progress' | 'complete'
