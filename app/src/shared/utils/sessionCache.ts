import type { AuditReport } from '@/types/audit'

const CACHE_KEY = 'pbi-bookmark-audit'

export const sessionCache = {
  write(report: AuditReport): void {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(report))
    } catch {
      // fail silently on quota errors
    }
  },

  read(): AuditReport | null {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw === null) return null
      const parsed = JSON.parse(raw) as AuditReport
      if (!('pages' in parsed)) {
        sessionStorage.removeItem(CACHE_KEY)
        return null
      }
      return parsed
    } catch {
      return null
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(CACHE_KEY)
    } catch {
      // fail silently
    }
  },
}
