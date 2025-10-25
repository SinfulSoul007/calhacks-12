"use client"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Room, LocalAudioTrack, createLocalAudioTrack } from 'livekit-client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MicrophoneIndicator } from '@/components/MicrophoneIndicator'
import { SecretOptionCard } from '@/components/SecretOptionCard'
import { DetectorGuessCard } from '@/components/DetectorGuessCard'
import { ConversationPanel } from '@/components/ConversationPanel'
import { Timer } from '@/components/Timer'
import { useRoomSubscription } from '@/lib/hooks/useRoomSubscription'
import { useTranscripts } from '@/lib/hooks/useTranscripts'
import { useLocalStorageState } from '@/lib/hooks/useLocalStorage'
import { usePlayerIdentity } from '@/lib/hooks/usePlayerIdentity'

interface Props {
  params: { roomId: string }
}

export default function TalkPage({ params }: Props) {
  const { roomId } = params
  const router = useRouter()
  const { room } = useRoomSubscription(roomId)
  const transcripts = useTranscripts(roomId, 20)
  const [displayName] = useLocalStorageState('mimic-display-name', '')
  const userId = usePlayerIdentity()
  const [role, setRole] = useState<'target' | 'detector'>('detector')
  const [rtc, setRtc] = useState<{ token: string; serverUrl: string } | null>(null)
  const [lkRoom, setLkRoom] = useState<Room | null>(null)
  const [micTrack, setMicTrack] = useState<LocalAudioTrack | null>(null)
  const [micMuted, setMicMuted] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [aiActive, setAiActive] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const aiTrackRef = useRef<LocalAudioTrack | null>(null)
  const aiContextRef = useRef<AudioContext | null>(null)
  const aiDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const analyserRafRef = useRef<number>()
  const aiActiveRef = useRef(false)

  useEffect(() => {
    if (!room) return
    aiActiveRef.current = !!room.ai?.active
    setAiActive(!!room.ai?.active)
    if (room.status === 'ended') {
      router.push(`/r/${roomId}/results`)
    }
  }, [room, roomId, router])

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return
    const storageKey = `mimic-role-${roomId}`
    const stored = window.sessionStorage.getItem(storageKey)
    if (stored === 'target' || stored === 'detector') {
      setRole(stored)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, uid: userId })
        })
        if (!res.ok) throw new Error('Failed to fetch role')
        const data = await res.json()
        if (cancelled) return
        const nextRole = data.isTarget ? 'target' : 'detector'
        window.sessionStorage.setItem(storageKey, nextRole)
        setRole(nextRole)
      } catch (error) {
        console.error('role lookup failed', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [roomId, userId])

  useEffect(() => {
    if (!userId || !displayName) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/rtc-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, uid: userId, name: displayName || 'Player' })
        })
        if (!res.ok) throw new Error('Unable to fetch voice token')
        const data = await res.json()
        if (!cancelled) setRtc(data)
      } catch (err) {
        console.error(err)
        setError((err as Error).message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [displayName, roomId, userId])

  useEffect(() => {
    if (!rtc || lkRoom || !userId) return
    const roomInstance = new Room({})
    let active = true
    ;(async () => {
      try {
        const track = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        })
        await roomInstance.connect(rtc.serverUrl, rtc.token, { autoSubscribe: true })
        await roomInstance.localParticipant.publishTrack(track)
        if (!active) return
        setMicTrack(track)
        setLkRoom(roomInstance)
      } catch (err) {
        console.error(err)
        setError('Failed to join voice room')
      }
    })()
    return () => {
      active = false
      roomInstance.disconnect()
    }
  }, [rtc, lkRoom, userId])

  useEffect(() => {
    if (!micTrack) return
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    const source = ctx.createMediaStreamSource(new MediaStream([micTrack.mediaStreamTrack.clone()]))
    source.connect(analyser)
    analyserRef.current = analyser
    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteTimeDomainData(data)
      let sumSquares = 0
      for (let i = 0; i < data.length; i++) {
        const value = (data[i] - 128) / 128
        sumSquares += value * value
      }
      setMicLevel(Math.min(1, Math.sqrt(sumSquares / data.length) * 4))
      analyserRafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      if (analyserRafRef.current) cancelAnimationFrame(analyserRafRef.current)
      analyser.disconnect()
      ctx.close()
    }
  }, [micTrack])

  async function toggleMute() {
    if (!micTrack) return
    if (micMuted) {
      await micTrack.unmute()
      setMicMuted(false)
    } else {
      await micTrack.mute()
      setMicMuted(true)
    }
  }

  async function handleGuess() {
    if (!userId) return
    setError(null)
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, uid: userId })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Guess failed')
      return
    }
    router.push(`/r/${roomId}/results`)
  }

  async function handleActivateAi() {
    if (!userId) return
    setAiBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/ai.on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, uid: userId })
      })
      if (!res.ok) throw new Error('Failed to activate AI')
      setAiActive(true)
      aiActiveRef.current = true
      await triggerAiTurn()
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setAiBusy(false)
    }
  }

  async function handleDeactivateAi() {
    if (!userId) return
    setAiBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/ai.off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, uid: userId })
      })
      if (!res.ok) throw new Error('Failed to deactivate AI')
      aiActiveRef.current = false
      setAiActive(false)
      if (micTrack) {
        await replacePublishedTrack(micTrack)
      }
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setAiBusy(false)
    }
  }

  async function triggerAiTurn(hint?: string) {
    if (!userId) return
    setAiBusy(true)
    try {
      const context = {
        topic: room?.topic ?? 'Small talk',
        turns: transcripts.slice(-6).map((entry) => ({ speakerId: entry.speakerId, text: entry.text }))
      }
      const res = await fetch('/api/llm.continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, uid: userId, context, styleHints: hint ? [hint] : undefined })
      })
      if (!res.ok) throw new Error('LLM request failed')
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      await speakText(data.reply)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setAiBusy(false)
    }
  }

  async function speakText(text: string) {
    if (!userId) return
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, uid: userId, text })
    })
    if (!res.ok) throw new Error('TTS failed')
    const { audio } = await res.json()
    await playAiAudio(audio)
  }

  async function playAiAudio(base64: string) {
    if (!lkRoom) throw new Error('Voice room not ready')
    const ctx = aiContextRef.current ?? new AudioContext()
    aiContextRef.current = ctx
    const destination = aiDestinationRef.current ?? ctx.createMediaStreamDestination()
    aiDestinationRef.current = destination
    if (!aiTrackRef.current) {
      aiTrackRef.current = new LocalAudioTrack(destination.stream.getAudioTracks()[0], undefined, true, ctx)
    }
    await replacePublishedTrack(aiTrackRef.current)
    const buffer = await ctx.decodeAudioData(base64ToArrayBuffer(base64))
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(destination)
    source.connect(ctx.destination)
    source.start()
    source.onended = async () => {
      if (!aiActiveRef.current && micTrack) {
        await replacePublishedTrack(micTrack)
      }
    }
  }

  async function replacePublishedTrack(track: LocalAudioTrack) {
    if (!lkRoom) return
    const participant = lkRoom.localParticipant
    const publications = Array.from(participant.audioTracks.values())
    await Promise.all(
      publications.map((pub) => (pub.track && pub.track !== track ? participant.unpublishTrack(pub.track, false) : Promise.resolve()))
    )
    const alreadyPublished = publications.some((pub) => pub.track === track)
    if (!alreadyPublished) {
      await participant.publishTrack(track)
    }
  }

  function base64ToArrayBuffer(base64: string) {
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  const timerNode = <Timer durationSec={300} isRunning={room?.status === 'live'} />
  const isTarget = role === 'target'
  const guessDisabled = isTarget || room?.status !== 'live' || !!room?.guess?.by

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Conversation</div>
          <div className="text-sm text-muted-foreground">Room {roomId}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConversationPanel
            topic={room?.topic}
            transcript={transcripts}
            speakingId={null}
            timer={timerNode}
          />
          <MicrophoneIndicator muted={micMuted} level={micLevel} />
          <div className="flex flex-wrap gap-4">
            {isTarget && (
              <SecretOptionCard
                enabled={isTarget}
                aiActive={aiActive}
                busy={aiBusy}
                suggestions={suggestions}
                onActivate={handleActivateAi}
                onDeactivate={handleDeactivateAi}
                onSuggestClick={(hint) => triggerAiTurn(hint)}
                onFreeTextSubmit={(text) => triggerAiTurn(text)}
              />
            )}
            {!isTarget && <DetectorGuessCard disabled={guessDisabled} onGuess={handleGuess} />}
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleMute}>{micMuted ? 'Unmute' : 'Mute'}</Button>
            <Button variant="outline" onClick={() => router.push('/')}>Leave</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
