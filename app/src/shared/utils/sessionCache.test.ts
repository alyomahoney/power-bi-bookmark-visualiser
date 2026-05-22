import { sessionCache } from './sessionCache'
import type { AuditReport } from '@/types/audit'

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

beforeEach(() => {
  vi.stubGlobal('sessionStorage', mockSessionStorage)
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('sessionCache.write', () => {
  it('serialises and stores the report', () => {
    const report: AuditReport = { bookmarks: [], pages: [], activePageId: '' }
    sessionCache.write(report)
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'pbi-bookmark-audit',
      JSON.stringify(report),
    )
  })

  it('never throws even when sessionStorage.setItem throws', () => {
    mockSessionStorage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => sessionCache.write({ bookmarks: [], pages: [], activePageId: '' })).not.toThrow()
  })
})

describe('sessionCache.read', () => {
  it('returns null when nothing is stored', () => {
    mockSessionStorage.getItem.mockReturnValue(null)
    expect(sessionCache.read()).toBeNull()
  })

  it('deserialises and returns stored report', () => {
    const report: AuditReport = { bookmarks: [], pages: [], activePageId: '' }
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(report))
    expect(sessionCache.read()).toEqual(report)
  })

  it('returns null when stored value is invalid JSON', () => {
    mockSessionStorage.getItem.mockReturnValue('{invalid json}')
    expect(sessionCache.read()).toBeNull()
  })

  it('returns null and clears cache when stored report is missing the pages field', () => {
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ bookmarks: [] }))
    expect(sessionCache.read()).toBeNull()
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('pbi-bookmark-audit')
  })
})

describe('sessionCache.clear', () => {
  it('removes the cache entry', () => {
    sessionCache.clear()
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('pbi-bookmark-audit')
  })

  it('never throws even when sessionStorage.removeItem throws', () => {
    mockSessionStorage.removeItem.mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => sessionCache.clear()).not.toThrow()
  })
})
