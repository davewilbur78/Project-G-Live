import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/research-plans/[id]/items -- list items for a plan
export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_plan_items')
      .select('*')
      .eq('plan_id', params.id)
      .order('display_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/research-plans/[id]/items -- add a manual item
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { source_category, repository, strategy_note, priority } = body

    if (!source_category?.trim())
      return NextResponse.json({ error: 'source_category is required' }, { status: 400 })

    const supabase = createServerSupabaseClient()

    // Get next display_order
    const { count } = await supabase
      .from('research_plan_items')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', params.id)

    const { data, error } = await supabase
      .from('research_plan_items')
      .insert({
        plan_id:         params.id,
        source_category: source_category.trim(),
        repository:      repository?.trim()    ?? null,
        strategy_note:   strategy_note?.trim() ?? null,
        priority:        ['High','Medium','Low'].includes(priority) ? priority : 'Medium',
        status:          'pending',
        display_order:   count ?? 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ item: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
