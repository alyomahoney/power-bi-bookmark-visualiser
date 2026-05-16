import { create } from 'zustand'
import { useAuditStore } from './auditStore'
import type { AuditReport } from '@/types/audit'
import sampleData from '@/features/demo/sampleReports/sample.json'

interface DemoState {
  isDemoMode: boolean
  loadDemoReport: () => void
  exitDemoMode: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemoMode: false,
  loadDemoReport: () => {
    useAuditStore.getState().setAuditReport(sampleData as AuditReport)
    set({ isDemoMode: true })
  },
  exitDemoMode: () => {
    set({ isDemoMode: false })
  },
}))
