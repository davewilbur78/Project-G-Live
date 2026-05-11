// Research Investigation -- Messages API Route
// GET: returns all messages for an investigation in chronological order
// POST: saves user message, assembles investigation context, calls GRA via callWithEngineAndHistory,
//       saves AI response, updates last_worked_at, returns AI response
//
// This is the AI context pre-loading pattern:
// Every conversation turn loads the full investigation state (problem statement,
// evidence, candidates, orientation) into the system prompt so the AI partner
// is fully oriented without the researcher repeating anything.

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { callWithEngineAndHistory } from '@/lib/ai'
import type { AIMessage } from '@/lib/ai'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('investigation_messages')
    .select('id, role, content, created_at')
    .eq('investigation_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()
  const body = await req.json()
  const userContent: string = body.content?.trim()

  if (!userContent) {
    return NextResponse.json({ error: 'Message content is required.' }, { status: 400 })
  }

  // Save user message first
  await supabase.from('investigation_messages').insert({
    investigation_id: id,
    role: 'user',
    content: userContent,
  })

  // Load full investigation state for context pre-loading
  // All four queries run concurrently
  const [invResult, messagesResult, evidenceResult, candidatesResult] = await Promise.all([
    supabase
      .from('investigations')
      .select('*, persons:primary_person_id(id, name_given, name_surname)')
      .eq('id', id)
      .single(),
    supabase
      .from('investigation_messages')
      .select('role, content')
      .eq('investigation_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('investigation_evidence')
      .select('title, record_type, record_date, notes')
      .eq('investigation_id', id),
    supabase
      .from('investigation_candidates')
      .select('candidate_name, status, notes')
      .eq('investigation_id', id),
  ])

  const investigation = invResult.data
  const allMessages = messagesResult.data ?? []
  const evidence = evidenceResult.data ?? []
  const candidates = candidatesResult.data ?? []

  // Build the investigation context block injected into the system prompt.
  // This is what makes the AI "context-aware" -- it knows everything about
  // this investigation before the researcher types a word.
  const investigationContext = {
    investigation_name: investigation?.name,
    problem_statement: investigation?.problem_statement,
    status: investigation?.status,
    primary_subject: investigation?.persons
      ? `${investigation.persons.name_given} ${investigation.persons.name_surname}`
      : 'Not specified',
    orientation: investigation?.orientation ?? null,
    evidence_captured: evidence.length > 0 ? evidence : 'None captured yet',
    candidate_persons: candidates.length > 0 ? candidates : 'None identified yet',
    researcher_instructions:
      'You are the AI research partner for this investigation. You have full context of everything captured. ' +
      'Help the researcher think through the problem using GPS methodology. ' +
      'Ask clarifying questions when needed. ' +
      'When discrete facts emerge, note them explicitly. ' +
      'When candidate persons are confirmed or eliminated, say so clearly. ' +
      'Never fabricate names, dates, places, sources, or relationships. ' +
      'If a record is discussed, help extract discrete LABEL: Value claims for the researcher to confirm.',
  }

  // Build message history for the AI call.
  // allMessages includes the user message just saved above, so history is complete.
  const history: AIMessage[] = allMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Call GRA engine with full history and investigation context
  let aiResponse: string
  try {
    aiResponse = await callWithEngineAndHistory('gra', history, investigationContext, {
      maxTokens: 2000,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `AI call failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    )
  }

  // Save AI response
  await supabase.from('investigation_messages').insert({
    investigation_id: id,
    role: 'assistant',
    content: aiResponse,
  })

  // Update last_worked_at
  await supabase
    .from('investigations')
    .update({ last_worked_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ content: aiResponse })
}
