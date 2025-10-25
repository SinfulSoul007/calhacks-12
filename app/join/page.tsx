"use client"
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { signInAnonymouslyIfNeeded } from '@/lib/firebase.client'
import { normalizeRoomCode } from '@/lib/room-code'
import { useLocalStorageState } from '@/lib/hooks/useLocalStorage'

export default function JoinPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [displayName, setDisplayName] = useLocalStorageState('mimic-display-name', '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function join(event: FormEvent) {
    event.preventDefault()
    if (!roomCode.trim() || !displayName.trim()) {
      setError('Enter both room code and display name')
      return
    }
    setError(null)
    setSubmitting(true)
    const normalized = normalizeRoomCode(roomCode)
    try {
      const user = await signInAnonymouslyIfNeeded(displayName.trim())
      const res = await fetch('/api/rooms.join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: normalized, uid: user.uid, displayName: displayName.trim() })
      })
      if (!res.ok) throw new Error('Failed to join room')
      router.push(`/r/${normalized}/setup`)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="centered-card">
      <Card className="w-full max-w-md">
        <CardHeader className="text-lg font-semibold">Join a Room</CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={join}>
            <Input
              placeholder="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              disabled={submitting}
            />
            <Input
              placeholder="Room code e.g. GHOST-4829"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              disabled={submitting}
              className="uppercase"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Joining…' : 'Join'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
