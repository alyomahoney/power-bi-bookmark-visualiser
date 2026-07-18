import { useUiStore } from './uiStore'
import type { WorkerError } from '@/types/worker'

describe('uiStore — theme', () => {
  it('has a valid initial theme (dark or light)', () => {
    const { theme } = useUiStore.getState()
    expect(['dark', 'light']).toContain(theme)
  })

  it('toggleTheme switches from dark to light', () => {
    useUiStore.setState({ theme: 'dark' })
    useUiStore.getState().toggleTheme()
    expect(useUiStore.getState().theme).toBe('light')
  })

  it('toggleTheme switches from light to dark', () => {
    useUiStore.setState({ theme: 'light' })
    useUiStore.getState().toggleTheme()
    expect(useUiStore.getState().theme).toBe('dark')
  })
})

describe('uiStore — showVisualLabels', () => {
  it('defaults to true (labels shown by default)', () => {
    expect(useUiStore.getState().showVisualLabels).toBe(true)
  })

  it('toggleVisualLabels flips true to false', () => {
    useUiStore.setState({ showVisualLabels: true })
    useUiStore.getState().toggleVisualLabels()
    expect(useUiStore.getState().showVisualLabels).toBe(false)
  })

  it('toggleVisualLabels flips false back to true', () => {
    useUiStore.setState({ showVisualLabels: false })
    useUiStore.getState().toggleVisualLabels()
    expect(useUiStore.getState().showVisualLabels).toBe(true)
  })
})

describe('uiStore — isParsing / parseProgressStep', () => {
  beforeEach(() => {
    useUiStore.setState({ isParsing: false, parseProgressStep: null })
  })

  it('isParsing is false by initial state', () => {
    expect(useUiStore.getState().isParsing).toBe(false)
  })

  it('parseProgressStep is null by initial state', () => {
    expect(useUiStore.getState().parseProgressStep).toBeNull()
  })

  it('setIsParsing(true) sets isParsing to true', () => {
    useUiStore.getState().setIsParsing(true)
    expect(useUiStore.getState().isParsing).toBe(true)
  })

  it('setIsParsing(false) sets isParsing to false', () => {
    useUiStore.setState({ isParsing: true })
    useUiStore.getState().setIsParsing(false)
    expect(useUiStore.getState().isParsing).toBe(false)
  })

  it('setParseProgressStep sets step correctly', () => {
    useUiStore.getState().setParseProgressStep('reading')
    expect(useUiStore.getState().parseProgressStep).toBe('reading')
  })

  it('clearParseProgress resets both isParsing and parseProgressStep', () => {
    useUiStore.setState({ isParsing: true, parseProgressStep: 'parsing' })
    useUiStore.getState().clearParseProgress()
    expect(useUiStore.getState().isParsing).toBe(false)
    expect(useUiStore.getState().parseProgressStep).toBeNull()
  })
})

describe('uiStore — parseError', () => {
  beforeEach(() => {
    useUiStore.setState({ parseError: null })
  })

  it('has null parseError as initial state', () => {
    expect(useUiStore.getState().parseError).toBeNull()
  })

  it('setParseError stores the error', () => {
    const error: WorkerError = { code: 'MALFORMED_FILE', message: 'bad file' }
    useUiStore.getState().setParseError(error)
    expect(useUiStore.getState().parseError).toEqual(error)
  })

  it('setParseError accepts null to clear the error', () => {
    useUiStore.getState().setParseError({ code: 'MALFORMED_FILE', message: 'x' })
    useUiStore.getState().setParseError(null)
    expect(useUiStore.getState().parseError).toBeNull()
  })

  it('clearParseError resets parseError to null', () => {
    useUiStore.getState().setParseError({ code: 'MALFORMED_FILE', message: 'x' })
    useUiStore.getState().clearParseError()
    expect(useUiStore.getState().parseError).toBeNull()
  })
})

describe('uiStore — bookmark selection', () => {
  beforeEach(() => {
    useUiStore.setState({ selectedBookmarkId: null })
  })

  it('selectBookmark sets selectedBookmarkId', () => {
    useUiStore.getState().selectBookmark('bk-42')
    expect(useUiStore.getState().selectedBookmarkId).toBe('bk-42')
  })

  it('selectBookmark(null) clears selectedBookmarkId', () => {
    useUiStore.setState({ selectedBookmarkId: 'bk-42' })
    useUiStore.getState().selectBookmark(null)
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })
})
