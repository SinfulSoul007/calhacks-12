import { AccessToken } from 'livekit-server-sdk'

const LIVEKIT_URL = process.env.LIVEKIT_URL
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET

export type LiveKitRole = 'target' | 'detector' | 'unknown'

export interface LiveKitIdentityMetadata {
  roomId: string
  displayName: string
  role?: LiveKitRole
}

export function mintLiveKitToken(params: { roomId: string; identity: string; name: string; role?: LiveKitRole }) {
  assertLiveKitEnv()

  const token = new AccessToken(LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!, {
    identity: params.identity,
    name: params.name,
    metadata: JSON.stringify({
      roomId: params.roomId,
      displayName: params.name,
      role: params.role ?? 'unknown'
    } satisfies LiveKitIdentityMetadata)
  })

  token.addGrant({
    roomJoin: true,
    room: params.roomId,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  })

  return {
    token: token.toJwt(),
    serverUrl: LIVEKIT_URL!
  }
}

function assertLiveKitEnv() {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('Missing LiveKit environment variables')
  }
}
