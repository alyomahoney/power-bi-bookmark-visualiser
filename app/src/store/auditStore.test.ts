import { useAuditStore } from './auditStore'
import type { AuditReport } from '@/types/audit'

describe('auditStore', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: null })
  })

  it('has null auditReport as initial state', () => {
    expect(useAuditStore.getState().auditReport).toBeNull()
  })

  it('setAuditReport stores the report', () => {
    const report: AuditReport = { bookmarks: [] }
    useAuditStore.getState().setAuditReport(report)
    expect(useAuditStore.getState().auditReport).toBe(report)
  })

  it('clearAudit resets auditReport to null', () => {
    useAuditStore.getState().setAuditReport({ bookmarks: [] })
    useAuditStore.getState().clearAudit()
    expect(useAuditStore.getState().auditReport).toBeNull()
  })
})
