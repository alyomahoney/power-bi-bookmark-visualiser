import { useRef, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import type { ProgressStep } from '@/types/worker'

interface ParseProgressStateProps {
  step: ProgressStep | null
  fileName?: string
  fileSize?: number
}

const STEP_PROGRESS: Record<ProgressStep, number> = {
  reading: 25,
  parsing: 50,
  building: 75,
  complete: 100,
}

const STEP_LABELS: Record<ProgressStep, string> = {
  reading: 'Reading file',
  parsing: 'Parsing structure',
  building: 'Building audit',
  complete: 'Complete',
}

export function ParseProgressState({ step, fileName, fileSize }: ParseProgressStateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => { containerRef.current?.focus() }, [])

  const progressValue = step ? STEP_PROGRESS[step] : 5
  const label = step ? STEP_LABELS[step] : 'Starting...'

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-live="polite"
      aria-atomic="false"
      className="w-full max-w-md flex flex-col gap-4 outline-none"
      data-testid="parse-progress-state"
    >
      <p className="text-text-primary font-medium">{label}</p>
      {fileName && (
        <p className="text-sm text-text-secondary">
          {fileName}{fileSize ? ` · ${(fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
        </p>
      )}
      <Progress value={progressValue} />
    </div>
  )
}
