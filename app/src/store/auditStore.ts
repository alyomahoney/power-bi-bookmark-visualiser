import { create } from 'zustand'
import type { AuditReport } from '@/types/audit'

interface AuditState {
  auditReport: AuditReport | null
  setAuditReport: (report: AuditReport) => void
  clearAudit: () => void
  selectedPageId: string | null
  setSelectedPageId: (id: string | null) => void
}

export const useAuditStore = create<AuditState>((set) => ({
  auditReport: null,
  setAuditReport: (report) => set({ auditReport: report, selectedPageId: report.activePageId }),
  clearAudit: () => set({ auditReport: null, selectedPageId: null }),
  selectedPageId: null,
  setSelectedPageId: (id) => set({ selectedPageId: id }),
}))
