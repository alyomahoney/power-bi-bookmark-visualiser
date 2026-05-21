import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadPage from './UploadPage'
import { MAX_FILE_SIZE_MB } from '@/constants/config'
import { useUiStore } from '@/store/uiStore'
import { useLocation } from 'react-router'

const mockStartParsing = vi.fn()
const mockCancelParsing = vi.fn()

vi.mock('@/workers/useParserWorker', () => ({
  useParserWorker: () => ({
    startParsing: mockStartParsing,
    cancelParsing: mockCancelParsing,
  }),
}))

vi.mock('react-router', () => ({
  useLocation: vi.fn(() => ({ state: null, pathname: '/', search: '', hash: '', key: 'default' })),
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}))

const LARGE_SIZE = (MAX_FILE_SIZE_MB + 1) * 1024 * 1024
const SMALL_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

function makeFile(sizeBytes: number, name = 'report.pbip') {
  const file = new File([''], name, { type: 'application/json' })
  Object.defineProperty(file, 'size', { value: sizeBytes, configurable: true })
  return file
}

function selectFile(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  Object.defineProperty(input, 'files', {
    value: {
      0: file,
      length: 1,
      item: (i: number) => (i === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file
      },
    },
    configurable: true,
  })
  fireEvent.change(input)
}

describe('UploadPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    useUiStore.setState({ isParsing: false, parseProgressStep: null, parseError: null })
  })

  describe('file size warning — large file (AC1)', () => {
    it('shows size warning dialog when file exceeds MAX_FILE_SIZE_MB', () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('shows the file size in the dialog', () => {
      render(<UploadPage />)
      const sizeMB = ((MAX_FILE_SIZE_MB + 1) * 1024 * 1024 / (1024 * 1024)).toFixed(1)
      selectFile(makeFile(LARGE_SIZE))
      expect(screen.getByText(new RegExp(`${sizeMB}MB`))).toBeInTheDocument()
    })
  })

  describe('no dialog for small file (AC4)', () => {
    it('does NOT show dialog when file is exactly MAX_FILE_SIZE_MB', () => {
      render(<UploadPage />)
      selectFile(makeFile(SMALL_SIZE))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('does NOT show dialog when file is below MAX_FILE_SIZE_MB', () => {
      render(<UploadPage />)
      selectFile(makeFile(1 * 1024 * 1024))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Cancel flow (AC3)', () => {
    it('closes dialog when Cancel is clicked', async () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('upload zone is visible after Cancel (idle state restored)', async () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.getByRole('button', { name: /drop your report here/i })).toBeInTheDocument()
    })

    it('re-triggers dialog after Cancel when same file is selected again (no file retention)', async () => {
      render(<UploadPage />)
      const file = makeFile(LARGE_SIZE)
      selectFile(file)
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      // Select again — state was fully reset
      selectFile(file)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Proceed flow (AC2)', () => {
    it('closes dialog when Proceed is clicked', async () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      await userEvent.click(screen.getByRole('button', { name: 'Proceed' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('parse progress state (Story 2.5)', () => {
    it('shows ParseProgressState when isParsing is true in the store', () => {
      useUiStore.setState({ isParsing: true })
      render(<UploadPage />)
      expect(screen.getByTestId('parse-progress-state')).toBeInTheDocument()
    })

    it('shows UploadZone when isParsing is false in the store', () => {
      useUiStore.setState({ isParsing: false })
      render(<UploadPage />)
      expect(screen.getByRole('button', { name: /drop your report here/i })).toBeInTheDocument()
      expect(screen.queryByTestId('parse-progress-state')).not.toBeInTheDocument()
    })

    it('shows file name in ParseProgressState when pendingFiles has a file', () => {
      render(<UploadPage />)
      const file = makeFile(SMALL_SIZE, 'my-report.pbip')
      selectFile(file)
      act(() => {
        useUiStore.setState({ isParsing: true })
      })
      expect(screen.getByText(/my-report\.pbip/)).toBeInTheDocument()
    })
  })

  describe('schema error state (Story 2.6)', () => {
    it('shows SchemaErrorMessage when parseError.code is UNSUPPORTED_SCHEMA_VERSION', () => {
      useUiStore.setState({
        parseError: { code: 'UNSUPPORTED_SCHEMA_VERSION', message: 'unsupported', detectedVersion: '3.0.0' },
      })
      render(<UploadPage />)
      expect(screen.getByTestId('schema-error-message')).toBeInTheDocument()
    })

    it('shows MalformedFileError (not SchemaErrorMessage) when parseError.code is MALFORMED_FILE', () => {
      useUiStore.setState({
        parseError: { code: 'MALFORMED_FILE', message: 'malformed' },
      })
      render(<UploadPage />)
      expect(screen.queryByTestId('schema-error-message')).not.toBeInTheDocument()
      expect(screen.getByTestId('malformed-file-error')).toBeInTheDocument()
    })

    it('shows UploadZone after handleTryAnother clears the error', async () => {
      useUiStore.setState({
        parseError: { code: 'UNSUPPORTED_SCHEMA_VERSION', message: 'unsupported' },
      })
      render(<UploadPage />)
      expect(screen.getByTestId('schema-error-message')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /try another file/i }))
      expect(screen.queryByTestId('schema-error-message')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /drop your report here/i })).toBeInTheDocument()
    })
  })

  describe('malformed file error state (Story 2.7)', () => {
    it('shows MalformedFileError when parseError.code is MALFORMED_FILE', () => {
      useUiStore.setState({ parseError: { code: 'MALFORMED_FILE', message: 'bad file' } })
      render(<UploadPage />)
      expect(screen.getByTestId('malformed-file-error')).toBeInTheDocument()
    })

    it('shows UploadZone (not MalformedFileError) when there is no parseError', () => {
      useUiStore.setState({ parseError: null })
      render(<UploadPage />)
      expect(screen.queryByTestId('malformed-file-error')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /drop your report here/i })).toBeInTheDocument()
    })

    it('shows UploadZone after handleTryAnother clears a MALFORMED_FILE error', async () => {
      useUiStore.setState({ parseError: { code: 'MALFORMED_FILE', message: 'bad file' } })
      render(<UploadPage />)
      expect(screen.getByTestId('malformed-file-error')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /try another file/i }))
      expect(screen.queryByTestId('malformed-file-error')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /drop your report here/i })).toBeInTheDocument()
    })
  })

  describe('demo entry point (Story 7.1)', () => {
    it('renders a "Try the demo" link in idle state', () => {
      render(<UploadPage />)
      expect(screen.getByRole('link', { name: /try the demo/i })).toBeInTheDocument()
    })

    it('demo link points to /demo', () => {
      render(<UploadPage />)
      expect(screen.getByRole('link', { name: /try the demo/i })).toHaveAttribute('href', '/demo')
    })

    it('demo link is NOT shown while isParsing', () => {
      useUiStore.setState({ isParsing: true })
      render(<UploadPage />)
      expect(screen.queryByRole('link', { name: /try the demo/i })).not.toBeInTheDocument()
    })

    it('demo link is NOT shown when parseError is set', () => {
      useUiStore.setState({ parseError: { code: 'MALFORMED_FILE', message: 'bad file' } })
      render(<UploadPage />)
      expect(screen.queryByRole('link', { name: /try the demo/i })).not.toBeInTheDocument()
    })

    it('demo link is NOT shown when parseError is UNSUPPORTED_SCHEMA_VERSION', () => {
      useUiStore.setState({ parseError: { code: 'UNSUPPORTED_SCHEMA_VERSION', message: 'unsupported', detectedVersion: '3.0.0' } })
      render(<UploadPage />)
      expect(screen.queryByRole('link', { name: /try the demo/i })).not.toBeInTheDocument()
    })

    it('demo link is NOT shown when showSizeWarning is active', () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      expect(screen.queryByRole('link', { name: /try the demo/i })).not.toBeInTheDocument()
    })
  })

  describe('Worker integration (Story 2.4)', () => {
    it('calls startParsing with the file when a ≤5MB file is selected', () => {
      render(<UploadPage />)
      const file = makeFile(SMALL_SIZE)
      selectFile(file)
      expect(mockStartParsing).toHaveBeenCalledWith([file])
    })

    it('does NOT call startParsing when a >5MB file is selected (shows dialog instead)', () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      expect(mockStartParsing).not.toHaveBeenCalled()
    })

    it('calls startParsing with pendingFiles when Proceed is clicked in size warning dialog', async () => {
      render(<UploadPage />)
      const file = makeFile(LARGE_SIZE)
      selectFile(file)
      await userEvent.click(screen.getByRole('button', { name: 'Proceed' }))
      expect(mockStartParsing).toHaveBeenCalledWith([file])
    })

    it('does NOT call startParsing when Cancel is clicked in size warning dialog', async () => {
      render(<UploadPage />)
      selectFile(makeFile(LARGE_SIZE))
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(mockStartParsing).not.toHaveBeenCalled()
    })
  })
})

describe('UploadPage — focus on navigation with focusUpload state', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    useUiStore.setState({ isParsing: false, parseProgressStep: null, parseError: null })
  })

  it('focuses the UploadZone when location.state.focusUpload is true', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLocation).mockReturnValueOnce({ state: { focusUpload: true }, pathname: '/', search: '', hash: '', key: 'default' } as any)
    render(<UploadPage />)
    await act(async () => {})
    const zone = screen.getByRole('button', { name: /drop your report here/i })
    expect(zone).toHaveFocus()
  })

  it('does not focus UploadZone when location.state is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLocation).mockReturnValueOnce({ state: null, pathname: '/', search: '', hash: '', key: 'default' } as any)
    render(<UploadPage />)
    await act(async () => {})
    const zone = screen.getByRole('button', { name: /drop your report here/i })
    expect(zone).not.toHaveFocus()
  })
})

describe('UploadPage — demo link focus indicator', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    useUiStore.setState({ isParsing: false, parseProgressStep: null, parseError: null })
  })

  it('demo link has focus-visible ring classes', () => {
    render(<UploadPage />)
    const demoLink = screen.getByRole('link', { name: /try the demo/i })
    expect(demoLink.className).toContain('focus-visible:ring-2')
    expect(demoLink.className).toContain('focus-visible:ring-indigo-500')
    expect(demoLink.className).toContain('focus-visible:ring-offset-2')
  })
})

describe('UploadPage — demo entry point prominence (Story 9.5)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    useUiStore.setState({ isParsing: false, parseProgressStep: null, parseError: null })
  })

  it("renders 'or' divider separating upload zone and demo entry in idle state", () => {
    render(<UploadPage />)
    expect(screen.getByText('or')).toBeInTheDocument()
  })

  it('demo entry is styled as a card — not small inline fine print', () => {
    render(<UploadPage />)
    const demoLink = screen.getByRole('link', { name: /try the demo/i })
    expect(demoLink.className).toMatch(/\bborder\b/)
    expect(demoLink.className).toContain('rounded-lg')
  })

  it("'or' divider is NOT shown when showSizeWarning is active", () => {
    render(<UploadPage />)
    selectFile(makeFile(LARGE_SIZE))
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })

  it("'or' divider is NOT shown when isParsing", () => {
    useUiStore.setState({ isParsing: true })
    render(<UploadPage />)
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })

  it("'or' divider is NOT shown when parseError is set", () => {
    useUiStore.setState({ parseError: { code: 'MALFORMED_FILE', message: 'bad file' } })
    render(<UploadPage />)
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })
})
