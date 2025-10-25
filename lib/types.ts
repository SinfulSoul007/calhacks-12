import { z } from 'zod'

export const RoomStatusSchema = z.enum(['lobby', 'setup', 'live', 'ended'])
export type RoomStatus = z.infer<typeof RoomStatusSchema>

export const GuessOutcomeSchema = z.enum(['DETECTOR_WINS', 'TARGET_WINS'])
export type GuessOutcome = z.infer<typeof GuessOutcomeSchema>

export interface RoomRecord {
  room_id: string
  status: RoomStatus
  topic: string | null
  created_at: string
  expire_at: string
  ai_active: boolean
  ai_active_at: string | null
  ai_off_at: string | null
  guess_by: string | null
  guess_at: string | null
  outcome: GuessOutcome | null
}

export interface PlayerRecord {
  room_id: string
  player_id: string
  name: string
  joined_at: string
  voice_ready: boolean
}

export interface PlayerDoc {
  name: string
  joinedAt?: string
  voiceReady: boolean
}

export type PlayersMap = Record<string, PlayerDoc>

export interface TranscriptRecord {
  id: number
  room_id: string
  speaker_id: string
  text: string
  ts: string
}

export interface TranscriptEntry {
  id?: string | number
  speakerId: string
  text: string
  ts: string
}

export interface RoomDoc {
  roomId: string
  status: RoomStatus
  topic?: string | null
  createdAt?: string
  expireAt?: string
  ai: {
    active: boolean
    aiActiveAt?: string | null
    aiOffAt?: string | null
  }
  guess?: {
    by?: string | null
    at?: string | null
    outcome?: GuessOutcome | null
  }
  players: PlayersMap
}

export interface LlmTurn {
  speakerId: string
  text: string
}

export interface LlmContext {
  topic: string
  turns: LlmTurn[]
}

export const CreateRoomRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(64)
})

export const CreateRoomResponseSchema = z.object({
  roomId: z.string(),
  inviteUrl: z.string()
})

export const JoinRoomRequestSchema = z.object({
  roomId: z.string().trim().min(6),
  uid: z.string().trim().min(6),
  displayName: z.string().trim().min(1).max(64)
})

export const JoinRoomResponseSchema = z.object({
  ok: z.literal(true),
  playerId: z.string(),
  name: z.string()
})

export const RtcTokenRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string(),
  name: z.string()
})

export const RtcTokenResponseSchema = z.object({
  token: z.string(),
  serverUrl: z.string()
})

export const VoiceCloneRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string(),
  audio: z.string()
})

export const VoiceCloneResponseSchema = z.object({
  ok: z.literal(true)
})

export const LlmContinueRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string(),
  context: z.object({
    topic: z.string(),
    turns: z
      .array(
        z.object({
          speakerId: z.string(),
          text: z.string()
        })
      )
      .default([])
  }),
  styleHints: z.array(z.string()).optional()
})

export const LlmContinueResponseSchema = z.object({
  reply: z.string(),
  suggestions: z.array(z.string())
})

export const GameStartRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string()
})

export const GameStartResponseSchema = z.object({
  ok: z.literal(true),
  topic: z.string(),
  canActivateAI: z.boolean()
})

export const AiToggleRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string()
})

export const AiToggleResponseSchema = z.object({
  ok: z.literal(true),
  timestamp: z.string()
})

export const GuessRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string()
})

export const GuessResponseSchema = z.object({
  outcome: GuessOutcomeSchema,
  timeline: z.object({
    aiActiveAt: z.string().nullable(),
    aiOffAt: z.string().nullable(),
    guessAt: z.string()
  })
})

export const SttRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string(),
  audio: z.string()
})

export const SttResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1)
})

export const AnalysisRequestSchema = z.object({
  roomId: z.string()
})

export const AnalysisResponseSchema = z.object({
  timeline: z.object({
    aiActiveAt: z.string().nullable(),
    aiOffAt: z.string().nullable(),
    guessAt: z.string().nullable()
  }),
  metrics: z.object({
    aiDurationSec: z.number().nonnegative(),
    detectionDelaySec: z.number().nonnegative(),
    responseDelayHumanMs: z.number().nonnegative(),
    responseDelayAiMs: z.number().nonnegative(),
    wordTells: z.array(z.string())
  })
})

export const TtsRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string(),
  text: z.string().trim().min(1).max(400)
})

export const TtsResponseSchema = z.object({
  audio: z.string()
})

export const RoleRequestSchema = z.object({
  roomId: z.string(),
  uid: z.string()
})

export const RoleResponseSchema = z.object({
  isTarget: z.boolean()
})

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>
export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>
export type RtcTokenRequest = z.infer<typeof RtcTokenRequestSchema>
export type VoiceCloneRequest = z.infer<typeof VoiceCloneRequestSchema>
export type LlmContinueRequest = z.infer<typeof LlmContinueRequestSchema>
export type GameStartRequest = z.infer<typeof GameStartRequestSchema>
export type AiToggleRequest = z.infer<typeof AiToggleRequestSchema>
export type GuessRequest = z.infer<typeof GuessRequestSchema>
export type SttRequest = z.infer<typeof SttRequestSchema>
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>
export type TtsRequest = z.infer<typeof TtsRequestSchema>
export type RoleRequest = z.infer<typeof RoleRequestSchema>
export type RoleResponse = z.infer<typeof RoleResponseSchema>
