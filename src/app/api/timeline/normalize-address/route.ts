import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

// POST /api/timeline/normalize-address
// Accepts raw address text, returns normalized address fields.
// Raw text is never altered -- this only populates the normalized fields.
export async function POST(req: Request) {
  try {
    const { raw_text } = await req.json()
    if (!raw_text?.trim()) {
      return NextResponse.json({ error: 'raw_text is required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: [
        'You are an address normalization assistant for a genealogical research platform.',
        'The user will provide a raw address string copied from a historical record.',
        'Parse it into its components and respond ONLY with a JSON object.',
        'No preamble, no explanation, no markdown fences.',
        'JSON keys: street_address, city, county, state_province, country.',
        'All values are strings or null.',
        'Expand standard abbreviations (e.g. "St" to "Street", "Ave" to "Avenue",',
        '"NY" to "New York", "US" to "United States").',
        'For historical records, interpret context: "Brooklyn, N.Y." means city=Brooklyn, state_province=New York, country=United States.',
        'Do not invent data not present in the raw text. Use null for missing fields.',
      ].join(' '),
      messages: [
        { role: 'user', content: raw_text.trim() },
      ],
    })

    const text  = message.content.find(b => b.type === 'text')?.text ?? '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
