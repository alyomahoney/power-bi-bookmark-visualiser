import { useRef, useEffect } from 'react'
import type { WorkerError } from '@/types/worker'
import {
  MALFORMED_FILE_HEADING,
  MALFORMED_FILE_RATIONALE,
  MALFORMED_FILE_ACTION,
} from '@/constants/errorMessages'

interface MalformedFileErrorProps {
  error: WorkerError
  onTryAnother: () => void
}

export function MalformedFileError({ error, onTryAnother }: MalformedFileErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  return (
    <div
      ref={containerRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={-1}
      className="w-full max-w-md flex flex-col gap-4 outline-none"
      data-testid="malformed-file-error"
    >
      <h2 className="text-lg font-semibold text-text-primary">{MALFORMED_FILE_HEADING}</h2>
      {error.message && (
        <p className="text-sm font-mono text-text-secondary break-words">{error.message}</p>
      )}
      <p className="text-sm text-text-secondary">{MALFORMED_FILE_RATIONALE}</p>
      <button
        onClick={onTryAnother}
        className="self-start rounded-md border border-border-subtle px-4 py-2 text-sm text-text-primary hover:bg-bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {MALFORMED_FILE_ACTION}
      </button>
    </div>
  )
}
