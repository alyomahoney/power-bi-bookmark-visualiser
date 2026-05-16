import { parseFilePipeline } from './pbir.worker'

const postMessageMock = vi.fn()

vi.mock('./parsing/schemaDetector', () => {
  class SchemaDetectionError extends Error {
    detectedVersion: string
    constructor(detectedVersion: string, message: string) {
      super(message)
      this.name = 'SchemaDetectionError'
      this.detectedVersion = detectedVersion
    }
  }
  return {
    SchemaDetectionError,
    detectSchemaVersion: vi.fn(),
  }
})

vi.mock('./parsing/zipExtractor', () => ({
  extractIfArchive: vi.fn((entries: unknown[]) => Promise.resolve(entries)),
}))

vi.mock('./parsing/bookmarkParser', () => ({
  parseBookmarks: vi.fn().mockResolvedValue({ bookmarks: [], parseWarnings: [] }),
}))

vi.mock('./parsing/togglePairDetector', () => ({
  detectTogglePairs: vi.fn().mockReturnValue([]),
}))

import { detectSchemaVersion, SchemaDetectionError } from './parsing/schemaDetector'
import { detectTogglePairs } from './parsing/togglePairDetector'
import type { ToggleGroup } from '@/types/audit'

beforeEach(() => {
  vi.stubGlobal('self', { postMessage: postMessageMock })
  vi.clearAllMocks()
  vi.mocked(detectSchemaVersion).mockResolvedValue(undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function makeEntry() {
  return { file: new File(['content'], 'report.pbip', { type: 'application/json' }), path: 'report.pbip' }
}

describe('parseFilePipeline', () => {
  it('sends PROGRESS reading, parsing, building, complete in order', async () => {
    await parseFilePipeline([makeEntry()])

    const calls = postMessageMock.mock.calls.map((c) => c[0])
    expect(calls[0]).toEqual({ type: 'PROGRESS', step: 'reading' })
    expect(calls[1]).toEqual({ type: 'PROGRESS', step: 'parsing' })
    expect(calls[2]).toEqual({ type: 'PROGRESS', step: 'building' })
    expect(calls[3]).toEqual({ type: 'PROGRESS', step: 'complete' })
  })

  it('sends SUCCESS after PROGRESS complete', async () => {
    await parseFilePipeline([makeEntry()])

    const calls = postMessageMock.mock.calls.map((c) => c[0])
    expect(calls[4]).toMatchObject({ type: 'SUCCESS', payload: { bookmarks: [] } })
  })

  it('omits toggleGroups from SUCCESS payload when no groups detected', async () => {
    await parseFilePipeline([makeEntry()])
    const calls = postMessageMock.mock.calls.map((c) => c[0])
    expect(calls[4].payload.toggleGroups).toBeUndefined()
  })

  it('includes toggleGroups in SUCCESS payload when groups are detected', async () => {
    const mockGroups: ToggleGroup[] = [
      { id: 'toggle-bk-1-bk-2', kind: 'pair', bookmarkIds: ['bk-1', 'bk-2'] },
    ]
    vi.mocked(detectTogglePairs).mockReturnValueOnce(mockGroups)
    await parseFilePipeline([makeEntry()])
    const calls = postMessageMock.mock.calls.map((c) => c[0])
    expect(calls[4]).toMatchObject({ type: 'SUCCESS', payload: { toggleGroups: mockGroups } })
  })

  it('sends ERROR when an exception is thrown inside the pipeline', async () => {
    vi.mocked(detectSchemaVersion).mockRejectedValueOnce(new Error('simulated failure'))

    await parseFilePipeline([makeEntry()])

    const lastCall = postMessageMock.mock.calls.at(-1)![0]
    expect(lastCall.type).toBe('ERROR')
    expect(lastCall.error.code).toBe('MALFORMED_FILE')
  })
})

describe('parseFilePipeline — schema detection', () => {
  it('sends PROGRESS reading before schema detection runs', async () => {
    vi.mocked(detectSchemaVersion).mockRejectedValueOnce(
      new SchemaDetectionError('3.0.0', 'unsupported'),
    )

    await parseFilePipeline([makeEntry()])

    const calls = postMessageMock.mock.calls.map((c) => c[0])
    expect(calls[0]).toEqual({ type: 'PROGRESS', step: 'reading' })
  })

  it('sends ERROR with code UNSUPPORTED_SCHEMA_VERSION when version is unsupported', async () => {
    vi.mocked(detectSchemaVersion).mockRejectedValueOnce(
      new SchemaDetectionError('3.0.0', 'Schema version "3.0.0" is not supported. Supported: 2.0.0'),
    )

    await parseFilePipeline([makeEntry()])

    const lastCall = postMessageMock.mock.calls.at(-1)![0]
    expect(lastCall.type).toBe('ERROR')
    expect(lastCall.error.code).toBe('UNSUPPORTED_SCHEMA_VERSION')
  })

  it('includes detectedVersion in the ERROR payload', async () => {
    vi.mocked(detectSchemaVersion).mockRejectedValueOnce(
      new SchemaDetectionError('3.0.0', 'Schema version "3.0.0" is not supported. Supported: 2.0.0'),
    )

    await parseFilePipeline([makeEntry()])

    const lastCall = postMessageMock.mock.calls.at(-1)![0]
    expect(lastCall.error.detectedVersion).toBe('3.0.0')
  })

  it('sends ERROR with code MALFORMED_FILE when version.json is missing', async () => {
    vi.mocked(detectSchemaVersion).mockRejectedValueOnce(
      new Error('definition/version.json not found'),
    )

    await parseFilePipeline([makeEntry()])

    const lastCall = postMessageMock.mock.calls.at(-1)![0]
    expect(lastCall.type).toBe('ERROR')
    expect(lastCall.error.code).toBe('MALFORMED_FILE')
  })
})
