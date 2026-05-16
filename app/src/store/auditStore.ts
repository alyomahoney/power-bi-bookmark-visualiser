import { create } from 'zustand'
import type { AuditReport } from '@/types/audit'

interface AuditState {
  auditReport: AuditReport | null
  setAuditReport: (report: AuditReport) => void
  clearAudit: () => void
}

export const useAuditStore = create<AuditState>((set) => ({
  auditReport: null,
  setAuditReport: (report) => set({ auditReport: report }),
  clearAudit: () => set({ auditReport: null }),
}))
