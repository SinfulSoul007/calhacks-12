import { ProgressBar } from '@/components/ProgressBar'

export function VoiceCloneStatus({ progress = 100 }: { progress?: number }) {
  return (
    <div className="space-y-3">
      <div>Creating voice clones...</div>
      <ProgressBar value={progress} />
    </div>
  )
}

