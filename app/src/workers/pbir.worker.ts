/// <reference lib="webworker" />

import type { WorkerInboundMessage, WorkerOutboundMessage, FileEntry } from '../types/worker'
import { assertNever } from '../types/worker'
import type { AuditReport } from '../types/audit'
import { extractIfArchive } from './parsing/zipExtractor'
import { detectSchemaVersion, SchemaDetectionError } from './parsing/schemaDetector'
import { parseBookmarks } from './parsing/bookmarkParser'
import { detectTogglePairs } from './parsing/togglePairDetector'
import { parsePageLayout } from './parsing/wireframeLayoutParser'

const send = (msg: WorkerOutboundMessage) => self.postMessage(msg)

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data
  switch (msg.type) {
    case 'PARSE_FILE': {
      const entries: FileEntry[] = msg.payload.files.map((file, i) => ({
        file,
        path: msg.payload.relativePaths[i] ?? file.name,
      }))
      void parseFilePipeline(entries)
      break
    }
    case 'CANCEL':
      break
    default:
      assertNever(msg)
  }
}

export async function parseFilePipeline(entries: FileEntry[]): Promise<void> {
  try {
    send({ type: 'PROGRESS', step: 'reading' })
    const extractedEntries = await extractIfArchive(entries)
    await detectSchemaVersion(extractedEntries)

    send({ type: 'PROGRESS', step: 'parsing' })
    const { bookmarks, parseWarnings } = await parseBookmarks(extractedEntries)
    const toggleGroups = detectTogglePairs(bookmarks)

    send({ type: 'PROGRESS', step: 'building' })
    const pageLayout = await parsePageLayout(extractedEntries)
    const report: AuditReport = {
      bookmarks,
      ...(toggleGroups.length > 0 && { toggleGroups }),
      ...(parseWarnings.length > 0 && { parseWarnings }),
      ...(pageLayout && { pageLayout }),
    }

    send({ type: 'PROGRESS', step: 'complete' })
    send({ type: 'SUCCESS', payload: report })
  } catch (err) {
    if (err instanceof SchemaDetectionError) {
      send({
        type: 'ERROR',
        error: {
          code: 'UNSUPPORTED_SCHEMA_VERSION',
          message: err.message,
          detectedVersion: err.detectedVersion,
        },
      })
    } else {
      send({
        type: 'ERROR',
        error: { code: 'MALFORMED_FILE', message: String(err) },
      })
    }
  }
}
