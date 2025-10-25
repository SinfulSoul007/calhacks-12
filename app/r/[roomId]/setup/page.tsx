"use client"
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VoiceRecorder } from '@/components/elevenlabs/VoiceRecorder'
import { VoiceCloneStatus } from '@/components/elevenlabs/VoiceCloneStatus'
import { useRoomSubscription } from '@/lib/hooks/useRoomSubscription'
import { useLocalStorageState } from '@/lib/hooks/useLocalStorage'
import { usePlayerIdentity } from '@/lib/hooks/usePlayerIdentity'

interface Props {
  params: { roomId: string }
}

export default function SetupPage({ params }: Props) {
  const { roomId } = params
  const router = useRouter()
  const { room } = useRoomSubscription(roomId)
  const [displayName] = useLocalStorageState('mimic-display-name', '')
  const userId = usePlayerIdentity()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  const players = useMemo(() => {
    return Object.entries(room?.players ?? {}).map(([id, info]) => ({
      id,
      name: info?.name ?? 'Unknown',
      voiceReady: !!info?.voiceReady
    }))
  }, [room])

  const ready = players.length === 2 && players.every((player) => player.voiceReady)

  async function handleRecording(blob: Blob) {
    if (!userId) return
    setUploading(true)
    setError(null)
    try {
      const base64 = await blobToBase64(blob)
      const res = await fetch('/api/voice.clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, uid: userId, audio: base64 })
      })
      if (!res.ok) throw new Error('Failed to upload voice sample')
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function startGame() {
    if (!userId) return
    setStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/game.start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, uid: userId })
      })
      if (!res.ok) throw new Error('Failed to start game')
      const data = await res.json()
      window.sessionStorage.setItem(`mimic-role-${roomId}`, data.canActivateAI ? 'target' : 'detector')
      router.push(`/r/${roomId}/talk`)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">🎙️ Voice setup</div>
          <div className="text-sm text-muted-foreground">Room {roomId}</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <VoiceRecorder onRecorded={handleRecording} disabled={uploading || !userId} />
          <VoiceCloneStatus players={players} />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex gap-3">
            <Button onClick={startGame} disabled={!ready || starting}>
              {starting ? 'Starting…' : 'Start Game'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard?.writeText(`${window.location.origin}/r/${roomId}`)
                }
              }}
            >
              Copy invite link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}
