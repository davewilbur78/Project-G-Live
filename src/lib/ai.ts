// Claude API wrapper for Project-G-Live
// callWithEngine() is the primary entry point for all module AI calls.
// No engine prompt is hardcoded inline in any API route.
// The GRA v8.5.2c GPS enforcement prompt is the base layer for all research-facing calls.
// All engines load from /prompts/ directory via filesystem read.

import fs from 'fs'
import path from 'path'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
export const MODEL = 'claude-sonnet-4-6'

// Engine file registry.
// Maps engine key to path relative to project root.
// All prompt files committed to /prompts/ directory.
// To add a new engine: commit the file to /prompts/ and add an entry here.
const ENGINE_FILES: Record<string, string> = {
  gra:                     'prompts/research/gra-v8.5.2c.md',
  research_agent:          'prompts/research/research-agent-assignment-v2.1.md',
  ocr_htr:                 'prompts/transcription/ocr-htr-v08.md',
  jewish_transcription:    'prompts/transcription/jewish-transcription-v2.md',
  deep_look:               'prompts/image-analysis/deep-look-v2.md',
  hebrew_headstone:        'prompts/image-analysis/hebrew-headstone-helper-v9.md',
  fact_extractor:          'prompts/writing/fact-extractor-v4.md',
  fact_narrator:           'prompts/writing/fact-narrator-v4.md',
  narrative_assistant:     'prompts/writing/narrative-assistant-v3.md',
  linguistic_profiler:     'prompts/writing/linguistic-profiler-v3.md',
  conversation_abstractor: 'prompts/writing/conversation-abstractor-v2.md',
  document_distiller:      'prompts/writing/document-distiller-v2.md',
  image_citation_builder:  'prompts/writing/image-citation-builder-v2.md',
  // Pending fetch from upstream Steve Little repo:
  // research_assistant:   'prompts/research/research-assistant-v8.md',
  // lingua_maven:         'prompts/writing/lingua-maven-v9.md',
}

export type EngineKey = keyof typeof ENGINE_FILES

// Research-facing engines that always compose GRA as the base GPS enforcement layer.
// The gra key itself is excluded -- it IS the base, not composed on top of itself.
const RESEARCH_ENGINES: Set<string> = new Set([
  'research_agent',
  'ocr_htr',
  'jewish_transcription',
  'deep_look',
  'hebrew_headstone',
  'fact_extractor',
  'fact_narrator',
  'narrative_assistant',
  'conversation_abstractor',
  'document_distiller',
  'image_citation_builder',
])

// In-process prompt cache.
// Avoids repeated disk reads within a single function invocation.
// Serverless functions are short-lived; this is a per-invocation optimization only.
const promptCache: Record<string, string> = {}

function loadPrompt(engine: string): string {
  if (promptCache[engine]) return promptCache[engine]

  const filePath = ENGINE_FILES[engine]
  if (!filePath) {
    throw new Error(
      `Unknown engine: "${engine}". Add it to ENGINE_FILES in src/lib/ai.ts and commit the prompt to /prompts/.`
    )
  }

  const fullPath = path.join(process.cwd(), filePath)
  try {
    const content = fs.readFileSync(fullPath, 'utf-8')
    promptCache[engine] = content
    return content
  } catch {
    throw new Error(
      `Failed to load engine prompt for "${engine}" at ${fullPath}. Is the file committed to /prompts/?`
    )
  }
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIOptions {
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

// Core call -- all other functions build on this.
// Calls the Anthropic API directly with provided messages and system prompt.
export async function callClaude(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY environment variable.')

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
      system: options.systemPrompt ?? '',
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock) throw new Error('No text content in Anthropic API response')
  return textBlock.text
}

// callWithEngine -- primary entry point for all single-turn module AI calls.
//
// Loads the named engine's prompt from /prompts/ via the filesystem.
// For research-facing engines, composes GRA v8.5.2c as the base GPS enforcement layer.
// Context is injected between the system prompt and the user message as structured XML.
//
// engine:      one of the EngineKey values registered in ENGINE_FILES
// userMessage: the researcher's input (record text, query, document content, etc.)
// context:     optional structured data injected as <context> block before user message
//              (person records, source lists, research state, etc.)
// options:     forwarded to callClaude (maxTokens, temperature)
//
export async function callWithEngine(
  engine: EngineKey,
  userMessage: string,
  context?: Record<string, unknown>,
  options?: Omit<AIOptions, 'systemPrompt'>
): Promise<string> {
  const enginePrompt = loadPrompt(engine)

  let systemPrompt: string
  if (engine === 'gra') {
    systemPrompt = enginePrompt
  } else if (RESEARCH_ENGINES.has(engine)) {
    const graPrompt = loadPrompt('gra')
    systemPrompt = `${graPrompt}\n\n---\n\n${enginePrompt}`
  } else {
    systemPrompt = enginePrompt
  }

  const content =
    context && Object.keys(context).length > 0
      ? `<context>\n${JSON.stringify(context, null, 2)}\n</context>\n\n${userMessage}`
      : userMessage

  return callClaude([{ role: 'user', content }], { ...options, systemPrompt })
}

// callWithEngineAndHistory -- for modules that maintain a persistent conversation thread.
// Used by Research Investigation (Module 16).
//
// Engine prompt + GRA (for research engines) are composed into the system prompt.
// Context is injected into the system prompt as <investigation_context> so it is
// available throughout the conversation, not just on the first turn.
//
// engine:  one of the EngineKey values
// history: the complete message history as role + content pairs
//          Must include the current user message as the final entry.
// context: optional structured investigation state (problem statement, evidence,
//          candidates, orientation) -- injected into the system prompt
// options: forwarded to callClaude (maxTokens, temperature)
//
export async function callWithEngineAndHistory(
  engine: EngineKey,
  history: AIMessage[],
  context?: Record<string, unknown>,
  options?: Omit<AIOptions, 'systemPrompt'>
): Promise<string> {
  const enginePrompt = loadPrompt(engine)

  let systemPrompt: string
  if (engine === 'gra') {
    systemPrompt = enginePrompt
  } else if (RESEARCH_ENGINES.has(engine)) {
    const graPrompt = loadPrompt('gra')
    systemPrompt = `${graPrompt}\n\n---\n\n${enginePrompt}`
  } else {
    systemPrompt = enginePrompt
  }

  if (context && Object.keys(context).length > 0) {
    systemPrompt = `${systemPrompt}\n\n<investigation_context>\n${JSON.stringify(context, null, 2)}\n</investigation_context>`
  }

  return callClaude(history, { ...options, systemPrompt })
}
