import { useRef, useEffect } from 'react'
import type { WorkerError } from '@/types/worker'
import {
  SCHEMA_UNSUPPORTED_HEADING,
  SCHEMA_UNSUPPORTED_RATIONALE,
  SCHEMA_UNSUPPORTED_ACTION,
} from '@/constants/errorMessages'
import { SCHEMA_SUPPORT_URL } from '@/shared/constants/links'
import { SUPPORTED_SCHEMA_VERSIONS } from '@/constants/schemas'

interface SchemaErrorMessageProps {
  error: WorkerError
  onTryAnother: () => void
}

export function SchemaErrorMessage({ error, onTryAnother }: SchemaErrorMessageProps) {
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
      data-testid="schema-error-message"
    >
      <h2 className="text-lg font-semibold text-text-primary">{SCHEMA_UNSUPPORTED_HEADING}</h2>
      {error.detectedVersion && (
        <p className="text-sm text-text-secondary">
          Detected version: <span className="font-mono">{error.detectedVersion}</span>
        </p>
      )}
      <p className="text-sm text-text-secondary">
        Supported: <span className="font-mono">{SUPPORTED_SCHEMA_VERSIONS.join(', ')}</span>
      </p>
      <p className="text-sm text-text-secondary">{SCHEMA_UNSUPPORTED_RATIONALE}</p>
      <p className="text-sm">
        <a
          href={SCHEMA_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 underline hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
        >
          Check schema support status
        </a>
      </p>
      <button
        onClick={onTryAnother}
        className="self-start rounded-md border border-border-subtle px-4 py-2 text-sm text-text-primary hover:bg-bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {SCHEMA_UNSUPPORTED_ACTION}
      </button>
    </div>
  )
}
