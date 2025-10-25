"use client"
import { ProgressBar } from '@/components/ProgressBar'

interface PlayerStatus {
  id: string
  name: string
  voiceReady: boolean
}

interface VoiceCloneStatusProps {
  players: PlayerStatus[]
}

export function VoiceCloneStatus({ players }: VoiceCloneStatusProps) {
  const readyCount = players.filter((player) => player.voiceReady).length
  const progress = players.length ? Math.round((readyCount / players.length) * 100) : 0
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span>Voice cloning progress</span>
        <span>{readyCount}/{players.length}</span>
      </div>
      <ProgressBar value={progress} />
      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{player.name}</span>
            <span className={player.voiceReady ? 'text-green-500' : 'text-muted-foreground'}>
              {player.voiceReady ? 'Ready' : 'Recording…'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
