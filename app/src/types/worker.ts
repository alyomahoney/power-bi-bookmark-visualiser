import type { AuditReport } from './audit'
import type { ParseErrorCode } from './errors'

export interface FileEntry {
  file: File
  path: string
}

export interface WorkerError {
  code: ParseErrorCode
  message: string
  detectedVersion?: string
}

export type WorkerInboundMessage =
  | { type: 'PARSE_FILE'; payload: { files: File[]; relativePaths: string[] } }
  | { type: 'CANCEL' }

export type ProgressStep = 'reading' | 'parsing' | 'building' | 'complete'

export type WorkerOutboundMessage =
  | { type: 'PROGRESS'; step: ProgressStep }
  | { type: 'SUCCESS'; payload: AuditReport }
  | { type: 'ERROR'; error: WorkerError }

/**
 * Exhaustiveness sentinel — use as the `default` branch of a switch over a
 * discriminated union. TypeScript raises a compile error if any variant is
 * unhandled, because the narrowed type can no longer be assigned to `never`.
 */
export function assertNever(x: never): never {
  throw new Error(`Unhandled discriminant: ${String(x)}`)
}
