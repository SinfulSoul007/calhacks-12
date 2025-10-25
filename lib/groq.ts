import Groq, { toFile, type ChatCompletionMessageParam } from 'groq-sdk'
import type { LlmContext } from './types'

const CHAT_MODEL = 'llama3-70b-8192'
const STT_MODEL = 'whisper-large-v3'

let client: Groq | null = null

function getGroqClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('Missing GROQ_API_KEY')
    }
    client = new Groq({ apiKey })
  }
  return client
}

export async function completeReply(context: LlmContext, styleHints: string[] = []) {
  const groq = getGroqClient()
  const systemPrompt = [
    'You are an improvisational conversationalist playing The Mimic Game.',
    'Respond as a concise human (1-2 sentences), stay casual, avoid lists.',
    styleHints.length ? `Incorporate these hints: ${styleHints.join(', ')}` : ''
  ]
    .filter(Boolean)
    .join(' ')

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: buildConversationPrompt(context)
    }
  ]

  const completion = await groq.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.6,
    max_tokens: 200,
    messages
  })

  return completion.choices[0]?.message?.content?.trim() ?? ''
}

export async function generateSuggestions(context: LlmContext) {
  const groq = getGroqClient()

  const completion = await groq.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.7,
    max_tokens: 240,
    messages: [
      {
        role: 'system',
        content:
          'Produce 3 short conversation suggestions separated by newlines. Each suggestion must be under 60 characters.'
      },
      {
        role: 'user',
        content: buildConversationPrompt(context)
      }
    ]
  })

  const raw = completion.choices[0]?.message?.content ?? ''
  return raw
    .split('\n')
    .map((line) => line.replace(/^[\d\-\*\.\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 3)
}

export async function transcribe(buffer: Buffer, filename = 'chunk.wav') {
  const groq = getGroqClient()
  const file = await toFile(buffer, filename)
  const result = await groq.audio.transcriptions.create({
    model: STT_MODEL,
    file
  })

  return {
    text: result.text?.trim() ?? '',
    confidence: 0.9
  }
}

function buildConversationPrompt(context: LlmContext) {
  const turns = context.turns
    .slice(-6)
    .map((turn) => `Speaker ${turn.speakerId.slice(0, 4)}: ${turn.text}`)
    .join('\n')

  return `Topic: ${context.topic}\nRecent turns:\n${turns || '(none yet)'}\nReply naturally as if you are still the same speaker.`
}
