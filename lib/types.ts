import { z } from 'zod'

export const RoomStatusSchema = z.enum(['lobby', 'setup', 'live', 'ended'])
export type RoomStatus = z.infer<typeof RoomStatusSchema>

export const GuessOutcomeSchema = z.enum(['DETECTOR_WINS', 'TARGET_WINS'])
export type GuessOutcome = z.infer<typeof GuessOutcomeSchema>

export interface PlayerDoc {
  name: string
  joinedAt?: TimestampLike
  voiceReady: boolean
}

export type PlayersMap = Record<string, PlayerDoc>

export interface GuessDoc {
  by?: string
  at?: TimestampLike
  outcome?: GuessOutcome
}

export interface AiState {
  active: boolean
  aiActiveAt?: TimestampLike
  aiOffAt?: TimestampLike
}

export interface RoomDoc {
  status: RoomStatus
  createdAt?: TimestampLike
  expireAt?: TimestampLike
  topic?: string
  players: PlayersMap
  targetPlayerId?: string
  ai: AiState
  guess?: GuessDoc
}

export type TimestampLike =
  | {
      seconds: number
      nanoseconds: number
      toMillis?: () => number
    }
  | Date
  | null
  | undefined

export interface TranscriptEntry {
  id?: string
  ts?: TimestampLike
  speakerId: string
  text: string
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
  token: z.string()
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
