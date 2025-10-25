"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useLocalStorageState } from '@/lib/hooks/useLocalStorage'
import { usePlayerIdentity } from '@/lib/hooks/usePlayerIdentity'

export default function HomePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useLocalStorageState('mimic-display-name', '')
  const playerId = usePlayerIdentity()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!displayName.trim()) {
      setError('Enter a display name first')
      return
    }
    if (!playerId) {
      setError('Initializing identity, try again in a moment.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const createRes = await fetch('/api/rooms.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() })
      })
      if (!createRes.ok) throw new Error('Failed to create room')
      const { roomId } = await createRes.json()
      const joinRes = await fetch('/api/rooms.join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, uid: playerId, displayName: displayName.trim() })
      })
      if (!joinRes.ok) throw new Error('Failed to join room')
      router.push(`/r/${roomId}/setup`)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="centered-card">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">🎭 THE MIMIC GAME</h1>
            <p className="text-muted-foreground">1v1 AI Detection Challenge</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              disabled={loading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating…' : 'Create Room'}
            </Button>
            <Link href="/join" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full" disabled={loading}>
                Join Room
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
