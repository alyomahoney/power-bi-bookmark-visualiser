import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { UploadZone } from './UploadZone'
import { FileSizeWarning } from './FileSizeWarning'
import { ParseProgressState } from './ParseProgressState'
import { SchemaErrorMessage } from './SchemaErrorMessage'
import { MalformedFileError } from './MalformedFileError'
import { MAX_FILE_SIZE_MB } from '@/constants/config'
import { useParserWorker } from '@/workers/useParserWorker'
import { useIsParsing, useParseProgressStep, useParseError, useClearParseError } from '@/store/hooks'

export default function UploadPage() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [showSizeWarning, setShowSizeWarning] = useState(false)
  const { startParsing, cancelParsing } = useParserWorker()
  const isParsing = useIsParsing()
  const parseProgressStep = useParseProgressStep()
  const parseError = useParseError()
  const clearParseError = useClearParseError()
  const uploadZoneRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => () => { cancelParsing() }, [cancelParsing])

  useEffect(() => {
    if ((location.state as { focusUpload?: boolean } | null)?.focusUpload) {
      uploadZoneRef.current?.focus()
      window.history.replaceState({ ...window.history.state, usr: null }, '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount — location.state is read once per navigation

  const handleTryAnother = () => {
    clearParseError()
    setPendingFiles([])
  }

  const handleFilesSelected = (files: File[]) => {
    setPendingFiles(files)
    if (files[0] && files[0].size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setShowSizeWarning(true)
    } else {
      startParsing(files)
    }
  }

  const handleProceed = () => {
    setShowSizeWarning(false)
    startParsing(pendingFiles)
  }

  const handleCancel = () => {
    setShowSizeWarning(false)
    setPendingFiles([])
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-semibold text-text-primary">Power BI Bookmark Visualiser</h1>
        <ThemeToggle />
      </header>
      <main>
        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
          {parseError?.code === 'UNSUPPORTED_SCHEMA_VERSION' ? (
            <SchemaErrorMessage error={parseError} onTryAnother={handleTryAnother} />
          ) : parseError?.code === 'MALFORMED_FILE' ? (
            <MalformedFileError error={parseError} onTryAnother={handleTryAnother} />
          ) : isParsing ? (
            <ParseProgressState
              step={parseProgressStep}
              fileName={pendingFiles[0]?.name}
              fileSize={pendingFiles[0]?.size}
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <UploadZone ref={uploadZoneRef} onFilesSelected={handleFilesSelected} />
              {!showSizeWarning && (
                <p className="text-sm text-text-muted">
                  Want to explore first?{' '}
                  <Link
                    to="/demo"
                    className="text-text-secondary underline-offset-2 hover:text-text-primary hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
                  >
                    Try the demo
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
        {showSizeWarning && pendingFiles[0] && (
          <FileSizeWarning
            file={pendingFiles[0]}
            onProceed={handleProceed}
            onCancel={handleCancel}
          />
        )}
      </main>
    </>
  )
}
