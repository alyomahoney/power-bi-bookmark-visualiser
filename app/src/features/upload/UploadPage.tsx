import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { AppLogo } from '@/shared/components/AppLogo'
import { UploadZone } from './UploadZone'
import { FileSizeWarning } from './FileSizeWarning'
import { ParseProgressState } from './ParseProgressState'
import { SchemaErrorMessage } from './SchemaErrorMessage'
import { MalformedFileError } from './MalformedFileError'
import { MAX_FILE_SIZE_MB } from '@/constants/config'
import { useParserWorker } from '@/workers/useParserWorker'
import { useIsParsing, useParseProgressStep, useParseError, useClearParseError } from '@/store/hooks'
import { AppFooter } from '@/shared/components/AppFooter'

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
        <h1><AppLogo /></h1>
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
            <div className="flex flex-col items-center gap-6">
              <UploadZone ref={uploadZoneRef} onFilesSelected={handleFilesSelected} />
              {!showSizeWarning && (
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 h-px bg-border-subtle" aria-hidden="true" />
                    <span className="text-xs text-text-muted">or</span>
                    <div className="flex-1 h-px bg-border-subtle" aria-hidden="true" />
                  </div>
                  <Link
                    to="/demo"
                    className="inline-flex items-center justify-center w-full rounded-lg border border-border-subtle bg-bg-surface px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
                  >
                    Try the demo
                  </Link>
                </div>
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
      <AppFooter />
    </>
  )
}
