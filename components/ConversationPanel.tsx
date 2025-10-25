"use client"
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ConversationEntry {
  id?: string
  speakerId: string
  text: string
}

interface ConversationPanelProps {
  topic?: string
  transcript: ConversationEntry[]
  speakingId?: string | null
  timer?: ReactNode
}

export function ConversationPanel({ topic, transcript, speakingId, timer }: ConversationPanelProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Topic</span>
          <span>{timer}</span>
        </div>
        <div className="text-lg font-semibold">{topic || 'Waiting for host…'}</div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
        {transcript.length === 0 && <div className="text-sm text-muted-foreground">Transcript will appear here.</div>}
        {transcript.map((entry, index) => (
          <div key={entry.id ?? `${entry.speakerId}-${index}`} className="rounded border px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{entry.speakerId}</span>
              {speakingId === entry.speakerId && <span className="text-xs text-green-500">speaking…</span>}
            </div>
            <p className="text-muted-foreground">{entry.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
