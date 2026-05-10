import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { callClaude } from '@/lib/ai'

// POST /api/research-plans/[id]/generate
// Calls Claude (Research Agent Assignment v2.1 pattern) to generate a
// prioritized source strategy. Replaces existing items and populates
// strategy_summary. Idempotent -- safe to call multiple times.
export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch the plan with person
    const { data: plan, error: planError } = await supabase
      .from('research_plans')
      .select('*, person:persons(id, display_name)')
      .eq('id', params.id)
      .single()
    if (planError) throw planError

    const personName = (plan.person as { display_name: string } | null)?.display_name ?? 'Unknown subject'

    const prompt = `You are a GPS-compliant genealogical research strategist applying Research Agent Assignment v2.1 methodology.

Given the research context below, generate a structured research plan with prioritized action items.

Research subject: ${personName}
Research question: ${plan.research_question}
Time period: ${plan.time_period ?? 'Not specified'}
Geography: ${plan.geography ?? 'Not specified'}
Community / ethnic or religious background: ${plan.community ?? 'Not specified'}

Return ONLY valid JSON (no markdown fences, no preamble, no explanation) in this exact structure:
{
  "strategy_summary": "2-3 sentence overview of the research approach and rationale for this specific subject",
  "items": [
    {
      "source_category": "Category name (e.g. Vital Records, Census, Immigration Records, City Directories)",
      "repository": "Specific archive, database, or institution (e.g. Ancestry.com, FamilySearch, NARA, JRI-Poland, YIVO Institute)",
      "strategy_note": "What to look for, why this source matters for this subject, and any specific search strategies or caveats",
      "priority": "High"
    }
  ]
}

Generate 8-12 items. Order High priority items first, then Medium, then Low.
Base all recommendations on the subject's specific time period, geography, and community context.

For Ashkenazi Jewish subjects: include synagogue records, landsmanshaft society records, Jewish newspapers (Der Forverts / Jewish Daily Forward, Morgen Zhurnal), YIVO Institute collections, JRI-Poland, JewishGen databases, and Eastern European civil registration (metrical books for births/marriages/deaths where applicable to the geography).
For immigrants to the United States: include ship passenger manifests (NARA, Ancestry, FamilySearch), Declaration of Intent, Petition for Naturalization, Certificate of Arrival, and chain-migration passenger manifest searches.
For Russian Empire subjects (pre-1917): specify the relevant gubernia-level archive, revision lists (revizskie skazki), metrical books (metriki), and Pale of Settlement context.
For 19th to early 20th century US research: include decennial census (1880-1940), vital records by state, city directories, draft registration cards (WWI and WWII), cemetery records, and newspaper obituaries.

Never fabricate record collections or archives that do not exist. Base all recommendations on real, accessible record collections.`

    const raw = await callClaude(
      [{ role: 'user', content: prompt }],
      { maxTokens: 3000 }
    )

    // Parse JSON -- strip any accidental markdown fences
    let parsed: {
      strategy_summary: string
      items: Array<{
        source_category: string
        repository: string
        strategy_note: string
        priority: string
      }>
    }
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      throw new Error('AI returned invalid JSON. Preview: ' + raw.slice(0, 300))
    }

    // Update plan with strategy_summary
    const { error: updateError } = await supabase
      .from('research_plans')
      .update({ strategy_summary: parsed.strategy_summary })
      .eq('id', params.id)
    if (updateError) throw updateError

    // Delete existing items (regeneration is idempotent)
    const { error: deleteError } = await supabase
      .from('research_plan_items')
      .delete()
      .eq('plan_id', params.id)
    if (deleteError) throw deleteError

    // Insert new items
    const VALID_PRIORITIES = ['High', 'Medium', 'Low']
    const itemsToInsert = parsed.items.map((item, idx) => ({
      plan_id:         params.id,
      source_category: item.source_category ?? 'Uncategorized',
      repository:      item.repository?.trim()    ?? null,
      strategy_note:   item.strategy_note?.trim() ?? null,
      priority:        VALID_PRIORITIES.includes(item.priority) ? item.priority : 'Medium',
      status:          'pending',
      display_order:   idx,
    }))

    const { error: insertError } = await supabase
      .from('research_plan_items')
      .insert(itemsToInsert)
    if (insertError) throw insertError

    // Return the full refreshed plan
    const { data: updated, error: fetchError } = await supabase
      .from('research_plans')
      .select('*, person:persons(id, display_name)')
      .eq('id', params.id)
      .single()
    if (fetchError) throw fetchError

    const { data: updatedItems, error: itemsFetchError } = await supabase
      .from('research_plan_items')
      .select('*')
      .eq('plan_id', params.id)
      .order('display_order', { ascending: true })
    if (itemsFetchError) throw itemsFetchError

    return NextResponse.json({ plan: { ...updated, items: updatedItems ?? [] } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
