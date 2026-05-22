import type { AuditReport } from '@/types/audit'

export function makeReport(partial: Partial<AuditReport> = {}): AuditReport {
  return { bookmarks: [], pages: [], activePageId: '', ...partial }
}
