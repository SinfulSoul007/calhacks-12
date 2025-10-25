"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AnalysisData {
  timeline: { aiActiveAt: string | null; aiOffAt: string | null; guessAt: string | null }
  metrics: {
    aiDurationSec: number
    detectionDelaySec: number
    responseDelayHumanMs: number
    responseDelayAiMs: number
    wordTells: string[]
  }
}

export default function AnalysisPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/analysis?roomId=${roomId}`)
        if (!res.ok) throw new Error('Unable to load analysis')
        const data = await res.json()
        if (active) setAnalysis(data)
      } catch (error) {
        console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [roomId])

  return (
    <div className="centered-card">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-lg font-semibold">Match analysis</CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {analysis && (
            <>
              <div className="rounded border border-border p-4 space-y-2">
                <div className="font-medium">Timeline</div>
                <div className="text-sm text-muted-foreground">AI on: {formatTime(analysis.timeline.aiActiveAt)}</div>
                <div className="text-sm text-muted-foreground">AI off: {formatTime(analysis.timeline.aiOffAt)}</div>
                <div className="text-sm text-muted-foreground">Guess: {formatTime(analysis.timeline.guessAt)}</div>
              </div>
              <div className="rounded border border-border p-4 space-y-2">
                <div className="font-medium">Metrics</div>
                <div className="text-sm">AI duration: {analysis.metrics.aiDurationSec.toFixed(1)}s</div>
                <div className="text-sm">Detection delay: {analysis.metrics.detectionDelaySec.toFixed(1)}s</div>
                <div className="text-sm">Human response avg: {analysis.metrics.responseDelayHumanMs}ms</div>
                <div className="text-sm">AI response avg: {analysis.metrics.responseDelayAiMs}ms</div>
              </div>
              <div className="rounded border border-border p-4 space-y-2">
                <div className="font-medium">Word tells</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {analysis.metrics.wordTells.map((word) => (
                    <span key={word} className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {word}
                    </span>
                  ))}
                  {!analysis.metrics.wordTells.length && <span className="text-muted-foreground">No obvious tells logged.</span>}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleTimeString()
}
