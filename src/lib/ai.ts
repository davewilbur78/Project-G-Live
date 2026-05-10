// Claude API wrapper for Project-G-Live
// All AI calls go through this module.
// The GRA v8.5c GPS enforcement prompt is injected on every call.
// Anti-fabrication rules are enforced: never invent genealogical data.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

// GPS enforcement system prompt (GRA v8.5c layer)
// Applied to all AI calls across all modules.
const GPS_SYSTEM_PROMPT = `You are a GPS-compliant genealogical research assistant operating within Project-G, a personal research platform for serious genealogical work and BCG certification preparation.

CRITICAL RULES -- NEVER VIOLATE:
- Never fabricate genealogical data: names, dates, places, sources, citations, relationships, or any factual claim.
- If you do not know something, say so explicitly. Do not fill gaps with plausible-sounding information.
- Every factual claim in output must have a source citation attached or must be explicitly marked as unverified.
- GPS terminology is strictly enforced:
  - Source types: Original, Derivative, or Authored (never "primary source")
  - Evidence types: Direct, Indirect, or Negative (never "primary evidence")
  - Information types: Primary or Secondary (applies to informant's knowledge only)
  - GEDCOM IDs are internal plumbing -- never surface them in output
  - Ancestry tree links are not sources -- flag and replace with original source
  - FamilySearch ark: identifiers are valuable -- preserve in all citations

CITATION STANDARD: Evidence Explained (EE) format required for all citations.
Every source carries both a full citation and a short footnote form.

ANTI-FABRICATION: If asked to generate a citation, proof argument, narrative, or analysis,
you may only work with facts explicitly provided to you. Do not invent corroborating details.`

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIOptions {
  systemPrompt?: string       // Additional system context (appended after GPS prompt)
  maxTokens?: number
  temperature?: number
}

// Core call -- all other functions build on this.
export async function callClaude(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY environment variable.')
  }

  const systemPrompt = options.systemPrompt
    ? `${GPS_SYSTEM_PROMPT}\n\n${options.systemPrompt}`
    : GPS_SYSTEM_PROMPT

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: options.maxTokens ?? 2000,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock) {
    throw new Error('No text content in Anthropic API response')
  }
  return textBlock.text
}

// Prompt engine router -- routes to the appropriate Steve Little engine
// based on the calling module. Add engines as modules are built.
export type PromptEngine =
  | 'fact_narrator_v4'
  | 'fact_extractor_v4'
  | 'ocr_htr_v08'
  | 'image_citation_builder_v2'
  | 'chat_abstractor_v2'
  | 'research_agent_v2_1'
  | 'gra_v8_5c'

// Placeholder -- load engine-specific prompts from /prompts/ as they are integrated.
export async function callWithEngine(
  engine: PromptEngine,
  userMessage: string,
  context?: Record<string, unknown>
): Promise<string> {
  // TODO: load engine prompts from /prompts/ directory
  // For now, route with a descriptive note so we know what engine was requested
  const engineNote = `Active engine: ${engine}. Context: ${JSON.stringify(context ?? {})}`
  return callClaude(
    [{ role: 'user', content: userMessage }],
    { systemPrompt: engineNote }
  )
}
