import { useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import PBIRWorker from './pbir.worker?worker'
import type { WorkerInboundMessage, WorkerOutboundMessage } from '@/types/worker'
import { assertNever } from '@/types/worker'
import type { AuditReport } from '@/types/audit'
import { sessionCache } from '@/shared/utils/sessionCache'
import { trackFileUploaded } from '@/shared/utils/telemetry'
import { useAuditStore } from '@/store/auditStore'
import { useUiStore } from '@/store/uiStore'

export function useParserWorker() {
  const workerRef = useRef<Worker | null>(null)
  const setAuditReport = useAuditStore((state) => state.setAuditReport)
  const setParseError = useUiStore((state) => state.setParseError)
  const setIsParsing = useUiStore((state) => state.setIsParsing)
  const setParseProgressStep = useUiStore((state) => state.setParseProgressStep)
  const clearParseProgress = useUiStore((state) => state.clearParseProgress)
  const clearParseError = useUiStore((state) => state.clearParseError)
  const navigate = useNavigate()

  const startParsing = useCallback(function startParsing(files: File[]): void {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }

    setIsParsing(true)
    setParseProgressStep(null)

    const worker = new PBIRWorker()
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      if (workerRef.current !== worker) return
      const msg = event.data
      switch (msg.type) {
        case 'PROGRESS':
          setParseProgressStep(msg.step)
          break
        case 'SUCCESS': {
          trackFileUploaded()
          clearParseError()
          const filename =
            files[0]?.webkitRelativePath?.split('/')[0] ||
            files[0]?.name ||
            'Unknown Report'
          const report: AuditReport = { ...msg.payload, filename }
          sessionCache.write(report)
          setAuditReport(report)
          clearParseProgress()
          worker.terminate()
          workerRef.current = null
          navigate('/audit')
          break
        }
        case 'ERROR':
          clearParseProgress()
          setParseError(msg.error)
          worker.terminate()
          workerRef.current = null
          break
        default:
          assertNever(msg)
      }
    }

    worker.onerror = (event: ErrorEvent) => {
      if (workerRef.current !== worker) return
      clearParseProgress()
      setParseError({ code: 'MALFORMED_FILE', message: event.message })
      worker.terminate()
      workerRef.current = null
    }

    const relativePaths = files.map(f => f.webkitRelativePath || f.name)
    worker.postMessage({ type: 'PARSE_FILE', payload: { files, relativePaths } } satisfies WorkerInboundMessage)
  }, [setAuditReport, setParseError, setIsParsing, setParseProgressStep, clearParseProgress, clearParseError, navigate])

  const cancelParsing = useCallback(function cancelParsing(): void {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CANCEL' } satisfies WorkerInboundMessage)
      workerRef.current.terminate()
      workerRef.current = null
      clearParseProgress()
    }
  }, [clearParseProgress])

  return { startParsing, cancelParsing }
}
