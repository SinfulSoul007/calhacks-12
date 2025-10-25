export function ProgressBar({ value = 0 }: { value?: number }) {
  return (
    <div className="w-full h-3 rounded bg-muted border border-border">
      <div className="h-3 rounded bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

