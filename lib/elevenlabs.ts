import { ElevenLabsClient } from 'elevenlabs'
import type { Readable } from 'stream'

const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2'

let client: ElevenLabsClient | null = null

function getClient() {
  if (!client) {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      throw new Error('Missing ELEVENLABS_API_KEY')
    }
    client = new ElevenLabsClient({
      apiKey
    })
  }
  return client
}

export async function cloneVoiceSample(params: { roomId: string; uid: string; displayName?: string; audioBuffer: Buffer }) {
  const eleven = getClient()
  const blob = new Blob([params.audioBuffer], { type: 'audio/webm' })
  const response = await eleven.voices.add({
    name: buildVoiceName(params.roomId, params.uid, params.displayName),
    files: [blob],
    description: 'Mimic Game instant voice clone'
  })
  return response.voice_id
}

export async function deleteVoice(voiceId: string) {
  const eleven = getClient()
  await eleven.voices.delete(voiceId)
}

export async function synthesizeSpeech(params: { voiceId: string; text: string; modelId?: string }) {
  const eleven = getClient()
  const stream = await eleven.textToSpeech.convert(params.voiceId, {
    model_id: params.modelId ?? DEFAULT_MODEL_ID,
    text: params.text,
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.85
    }
  })
  return streamToBuffer(stream)
}

function buildVoiceName(roomId: string, uid: string, displayName?: string) {
  const suffix = uid.slice(-4).toUpperCase()
  return displayName ? `${displayName} (${roomId}-${suffix})` : `Mimic-${roomId}-${suffix}`
}

async function streamToBuffer(readable: Readable) {
  const chunks: Buffer[] = []
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}
