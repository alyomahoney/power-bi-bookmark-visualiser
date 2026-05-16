import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useParserWorker } from './useParserWorker'
import { useAuditStore } from '@/store/auditStore'
import { useUiStore } from '@/store/uiStore'
import { sessionCache } from '@/shared/utils/sessionCache'
import { trackFileUploaded } from '@/shared/utils/telemetry'

vi.mock('@/shared/utils/telemetry', () => ({
  trackFileUploaded: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockWorker = {
  postMessage: vi.fn(),
  terminate: vi.fn(),
  onmessage: null as ((event: MessageEvent) => void) | null,
  onerror: null as ((event: ErrorEvent) => void) | null,
}

vi.mock('./pbir.worker?worker', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  default: vi.fn(function MockPBIRWorker() {
    return mockWorker
  }),
}))

vi.mock('@/shared/utils/sessionCache', () => ({
  sessionCache: {
    write: vi.fn(),
    read: vi.fn(),
    clear: vi.fn(),
  },
}))

function makeFile() {
  return new File([''], 'report.pbip', { type: 'application/json' })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockWorker.onmessage = null
  mockWorker.onerror = null
  useAuditStore.setState({ auditReport: null })
  useUiStore.setState({ parseError: null, isParsing: false, parseProgressStep: null })
})

describe('useParserWorker — startParsing', () => {
  it('posts PARSE_FILE message to the worker', () => {
    const { result } = renderHook(() => useParserWorker())
    const file = makeFile()

    act(() => {
      result.current.startParsing([file])
    })

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'PARSE_FILE',
      payload: { files: [file], relativePaths: [file.name] },
    })
  })

  it('terminates existing worker before spawning a new one', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      result.current.startParsing([makeFile()])
    })

    expect(mockWorker.terminate).toHaveBeenCalledTimes(1)
  })

  it('SUCCESS message triggers sessionCache.write and setAuditReport', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })

    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(sessionCache.write).toHaveBeenCalledWith({ bookmarks: [], filename: 'report.pbip' })
    expect(useAuditStore.getState().auditReport).toEqual({ bookmarks: [], filename: 'report.pbip' })
  })

  it('SUCCESS message calls worker.terminate', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(mockWorker.terminate).toHaveBeenCalled()
  })

  it('clears parseError on SUCCESS message (prevents stale MALFORMED_FILE error from prior parse)', () => {
    useUiStore.setState({ parseError: { code: 'MALFORMED_FILE', message: 'prior error' } })

    const { result } = renderHook(() => useParserWorker())
    act(() => { result.current.startParsing([makeFile()]) })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(useUiStore.getState().parseError).toBeNull()
  })

  it('ERROR message triggers setParseError and calls worker.terminate', () => {
    const { result } = renderHook(() => useParserWorker())
    const error = { code: 'MALFORMED_FILE' as const, message: 'bad file' }

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'ERROR', error } } as MessageEvent)
    })

    expect(useUiStore.getState().parseError).toEqual(error)
    expect(mockWorker.terminate).toHaveBeenCalled()
    expect(sessionCache.write).not.toHaveBeenCalled()
  })

  it('worker.onerror triggers setParseError and calls worker.terminate', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onerror?.({ message: 'script error' } as ErrorEvent)
    })

    expect(useUiStore.getState().parseError).toEqual({ code: 'MALFORMED_FILE', message: 'script error' })
    expect(mockWorker.terminate).toHaveBeenCalled()
  })

  it('sets isParsing to true when startParsing is called', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })

    expect(useUiStore.getState().isParsing).toBe(true)
  })

  it('sets parseProgressStep to the step value on PROGRESS message', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'PROGRESS', step: 'reading' } } as MessageEvent)
    })

    expect(useUiStore.getState().parseProgressStep).toBe('reading')
  })

  it('sets isParsing to false on SUCCESS message', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(useUiStore.getState().isParsing).toBe(false)
  })

  it('sets parseProgressStep to null on SUCCESS message', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'PROGRESS', step: 'complete' } } as MessageEvent)
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(useUiStore.getState().parseProgressStep).toBeNull()
  })

  it('calls navigate("/audit") on SUCCESS message', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/audit')
  })

  it('sets isParsing to false on ERROR message', () => {
    const { result } = renderHook(() => useParserWorker())
    const error = { code: 'MALFORMED_FILE' as const, message: 'bad file' }

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'ERROR', error } } as MessageEvent)
    })

    expect(useUiStore.getState().isParsing).toBe(false)
  })

  it('sets parseProgressStep to null on ERROR message', () => {
    const { result } = renderHook(() => useParserWorker())
    const error = { code: 'MALFORMED_FILE' as const, message: 'bad file' }

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'PROGRESS', step: 'parsing' } } as MessageEvent)
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'ERROR', error } } as MessageEvent)
    })

    expect(useUiStore.getState().parseProgressStep).toBeNull()
  })

  it('SUCCESS message calls trackFileUploaded', () => {
    const { result } = renderHook(() => useParserWorker())
    act(() => { result.current.startParsing([makeFile()]) })

    act(() => {
      mockWorker.onmessage?.({ data: { type: 'SUCCESS', payload: { bookmarks: [] } } } as MessageEvent)
    })

    expect(vi.mocked(trackFileUploaded)).toHaveBeenCalledOnce()
  })

  it('ERROR message does not call trackFileUploaded', () => {
    const { result } = renderHook(() => useParserWorker())
    act(() => { result.current.startParsing([makeFile()]) })

    act(() => {
      mockWorker.onmessage?.({ data: { type: 'ERROR', error: { code: 'MALFORMED_FILE', message: 'bad' } } } as MessageEvent)
    })

    expect(vi.mocked(trackFileUploaded)).not.toHaveBeenCalled()
  })

  it('worker.onerror does not call trackFileUploaded', () => {
    const { result } = renderHook(() => useParserWorker())
    act(() => { result.current.startParsing([makeFile()]) })

    act(() => {
      mockWorker.onerror?.({ message: 'script error' } as ErrorEvent)
    })

    expect(vi.mocked(trackFileUploaded)).not.toHaveBeenCalled()
  })

  it('sets isParsing to false on worker.onerror', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onerror?.({ message: 'script error' } as ErrorEvent)
    })

    expect(useUiStore.getState().isParsing).toBe(false)
  })
})

describe('useParserWorker — cancelParsing', () => {
  it('posts CANCEL message and terminates the worker', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      result.current.cancelParsing()
    })

    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'CANCEL' })
    expect(mockWorker.terminate).toHaveBeenCalled()
  })

  it('sets isParsing to false when cancelParsing is called with an active worker', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      result.current.cancelParsing()
    })

    expect(useUiStore.getState().isParsing).toBe(false)
  })

  it('sets parseProgressStep to null when cancelParsing is called with an active worker', () => {
    const { result } = renderHook(() => useParserWorker())

    act(() => {
      result.current.startParsing([makeFile()])
    })
    act(() => {
      mockWorker.onmessage?.({ data: { type: 'PROGRESS', step: 'reading' } } as MessageEvent)
    })
    act(() => {
      result.current.cancelParsing()
    })

    expect(useUiStore.getState().parseProgressStep).toBeNull()
  })
})
