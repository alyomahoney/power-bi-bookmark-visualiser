import { forwardRef, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ZeroTrustBadge } from './ZeroTrustBadge'
import { TelemetryDisclosure } from './TelemetryDisclosure'
import { SINGLE_FILE_DROP_ERROR, UNSUPPORTED_DROP_ERROR } from '@/constants/errorMessages'

interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void
}

export const UploadZone = forwardRef<HTMLDivElement, UploadZoneProps>(function UploadZone({ onFilesSelected }, ref) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragCounterRef = useRef(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // webkitdirectory is not in React's InputHTMLAttributes — set imperatively via callback ref
  const setInputRef = (el: HTMLInputElement | null) => {
    inputRef.current = el
    if (el) el.setAttribute('webkitdirectory', '')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragOver(true)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
    if (dragCounterRef.current === 0) setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragOver(false)

    const firstEntry = e.dataTransfer.items[0]?.webkitGetAsEntry()

    // null / undefined: browser couldn't read the entry (API unsupported or security restriction)
    if (firstEntry == null) {
      setError(UNSUPPORTED_DROP_ERROR)
      return
    }

    // File entry: single file dropped instead of a folder
    if (!firstEntry.isDirectory) {
      setError(SINGLE_FILE_DROP_ERROR)
      return
    }

    // Valid directory: clear any prior error and forward files
    setError(null)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelected?.(files)
    }
  }

  const handleDragEnd = () => {
    dragCounterRef.current = 0
    setIsDragOver(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) {
      onFilesSelected?.(files)
    }
    setError(null)
    e.target.value = ''
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={cn(
        'border-2 rounded-lg p-12 flex flex-col items-center gap-4 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        'transition-colors select-none',
        isDragOver
          ? 'border-solid border-indigo-500 bg-indigo-500/5'
          : 'border-dashed border-border-subtle hover:border-border-strong',
      )}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      <input
        ref={setInputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
      {isDragOver ? (
        <span className="text-text-primary font-medium text-lg">Drop to upload</span>
      ) : (
        <>
          <Upload className="h-12 w-12 text-text-muted" />
          <span className="text-text-primary font-medium">Drop your report here</span>
          <span className="text-sm text-text-secondary">
            Upload your `.Report` folder or PBIP project folder
          </span>
          {error && (
            <span role="alert" className="text-sm text-red-500">
              {error}
            </span>
          )}
          <ZeroTrustBadge />
          <TelemetryDisclosure />
        </>
      )}
    </div>
  )
})
