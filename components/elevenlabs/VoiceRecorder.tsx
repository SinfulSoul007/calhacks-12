"use client"
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface VoiceRecorderProps {
  seconds?: number
  label?: string
  disabled?: boolean
  onRecorded: (blob: Blob) => Promise<void> | void
}

export function VoiceRecorder({ seconds = 10, label = 'Record sample', disabled, onRecorded }: VoiceRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'uploading' | 'error'>('idle')
  const [timeLeft, setTimeLeft] = useState(seconds)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number>()
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      cleanupRecorder()
    }
  }, [])

  async function startRecording() {
    if (disabled || status === 'recording') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = handleRecordingStop
      recorder.start()
      setStatus('recording')
      setTimeLeft(seconds)
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          const next = Math.max(0, prev - 1)
          if (next === 0) {
            stopRecording()
          }
          return next
        })
      }, 1000)
    } catch (error) {
      console.error('VoiceRecorder error', error)
      setStatus('error')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
  }

  async function handleRecordingStop() {
    cleanupRecorder()
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    setStatus('uploading')
    try {
      await onRecorded(blob)
      setStatus('idle')
    } catch (error) {
      console.error('Upload failed', error)
      setStatus('error')
    } finally {
      setTimeLeft(seconds)
    }
  }

  function cleanupRecorder() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
    streamRef.current?.getTracks().forEach((track) => track.stop())
    recorderRef.current = null
    streamRef.current = null
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={startRecording} disabled={disabled || status === 'recording'}>
        {status === 'recording' ? 'Recording…' : label}
      </Button>
      <div className="text-sm text-muted-foreground">⏱️ {timeLeft}s</div>
    </div>
  )
}
