import { useDemoStore } from './demoStore'
import { useAuditStore } from './auditStore'

describe('demoStore', () => {
  beforeEach(() => {
    useDemoStore.setState({ isDemoMode: false })
    useAuditStore.setState({ auditReport: null, selectedPageId: null })
  })

  it('has isDemoMode false as initial state', () => {
    expect(useDemoStore.getState().isDemoMode).toBe(false)
  })

  it('loadDemoReport sets isDemoMode to true', () => {
    useDemoStore.getState().loadDemoReport()
    expect(useDemoStore.getState().isDemoMode).toBe(true)
  })

  it('loadDemoReport populates auditStore.auditReport', () => {
    useDemoStore.getState().loadDemoReport()
    expect(useAuditStore.getState().auditReport).not.toBeNull()
  })

  it('loadDemoReport loads 6 bookmarks', () => {
    useDemoStore.getState().loadDemoReport()
    expect(useAuditStore.getState().auditReport?.bookmarks).toHaveLength(6)
  })

  it('loadDemoReport loads 1 toggle group', () => {
    useDemoStore.getState().loadDemoReport()
    expect(useAuditStore.getState().auditReport?.toggleGroups).toHaveLength(1)
  })

  it('loadDemoReport loads 9 visuals in the first page', () => {
    useDemoStore.getState().loadDemoReport()
    expect(useAuditStore.getState().auditReport?.pages[0]?.visuals).toHaveLength(9)
  })

  it('loadDemoReport sets filename to "Sales Dashboard Demo"', () => {
    useDemoStore.getState().loadDemoReport()
    expect(useAuditStore.getState().auditReport?.filename).toBe('Sales Dashboard Demo')
  })

  it('loadDemoReport does not write to sessionStorage', () => {
    useDemoStore.getState().loadDemoReport()
    expect(sessionStorage.getItem('pbi-bookmark-audit')).toBeNull()
  })

  it('exitDemoMode resets isDemoMode to false', () => {
    useDemoStore.setState({ isDemoMode: true })
    useDemoStore.getState().exitDemoMode()
    expect(useDemoStore.getState().isDemoMode).toBe(false)
  })
})
