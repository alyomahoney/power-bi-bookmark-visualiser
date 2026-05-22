import { useAuditStore } from './auditStore'
import type { AuditReport } from '@/types/audit'

describe('auditStore', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: null, selectedPageId: null })
  })

  it('has null auditReport as initial state', () => {
    expect(useAuditStore.getState().auditReport).toBeNull()
  })

  it('has null selectedPageId as initial state', () => {
    expect(useAuditStore.getState().selectedPageId).toBeNull()
  })

  it('setAuditReport stores the report', () => {
    const report: AuditReport = { bookmarks: [], pages: [], activePageId: '' }
    useAuditStore.getState().setAuditReport(report)
    expect(useAuditStore.getState().auditReport).toBe(report)
  })

  it('setAuditReport sets selectedPageId to report.activePageId', () => {
    const report: AuditReport = { bookmarks: [], pages: [], activePageId: 'pg-abc' }
    useAuditStore.getState().setAuditReport(report)
    expect(useAuditStore.getState().selectedPageId).toBe('pg-abc')
  })

  it('clearAudit resets auditReport to null', () => {
    useAuditStore.getState().setAuditReport({ bookmarks: [], pages: [], activePageId: '' })
    useAuditStore.getState().clearAudit()
    expect(useAuditStore.getState().auditReport).toBeNull()
  })

  it('clearAudit resets selectedPageId to null', () => {
    useAuditStore.getState().setAuditReport({ bookmarks: [], pages: [], activePageId: 'pg-abc' })
    useAuditStore.getState().clearAudit()
    expect(useAuditStore.getState().selectedPageId).toBeNull()
  })

  it('setSelectedPageId updates selectedPageId', () => {
    useAuditStore.getState().setSelectedPageId('pg-xyz')
    expect(useAuditStore.getState().selectedPageId).toBe('pg-xyz')
  })
})
