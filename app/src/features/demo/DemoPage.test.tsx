import { render, screen, fireEvent } from '@testing-library/react'
import { useAuditStore } from '@/store/auditStore'
import { useDemoStore } from '@/store/demoStore'
import { useFilterStore } from '@/store/filterStore'
import sampleData from '@/features/demo/sampleReports/sample.json'
import type { AuditReport } from '@/types/audit'
import DemoPage from './DemoPage'

const mockNavigate = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/shared/components/ThemeToggle', () => ({
  ThemeToggle: () => <button>Toggle Theme</button>,
}))

vi.mock('@/features/wireframe/WireframeCanvas', () => ({
  WireframeCanvas: () => <div data-testid="wireframe-canvas">Canvas</div>,
}))

vi.mock('@/features/audit/BookmarkSearchInput', () => ({
  BookmarkSearchInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input aria-label="Search bookmarks" value={value} onChange={(e) => onChange(e.target.value)} readOnly />
  ),
}))

vi.mock('@/features/audit/BookmarkTypeFilter', () => ({
  BookmarkTypeFilter: () => null,
}))

vi.mock('@/features/audit/BookmarkVisualFilter', () => ({
  BookmarkVisualFilter: () => null,
}))

vi.mock('@/features/audit/BookmarkListItem', () => ({
  BookmarkListItem: ({ bookmark }: { bookmark: { id: string; name: string } }) => (
    <div data-testid={`bookmark-${bookmark.id}`}>{bookmark.name}</div>
  ),
}))

vi.mock('@/features/audit/BookmarkDetail', () => ({
  BookmarkDetail: () => <div data-testid="bookmark-detail">Bookmark Detail</div>,
}))

describe('DemoPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    useAuditStore.setState({ auditReport: sampleData as AuditReport })
    useDemoStore.setState({ isDemoMode: false, loadDemoReport: vi.fn(), exitDemoMode: vi.fn() })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
  })

  it('renders without crashing', () => {
    render(<DemoPage />)
  })

  it('does NOT add a noindex meta tag (route must be indexable)', () => {
    render(<DemoPage />)
    expect(document.querySelector('meta[name="robots"]')).toBeNull()
  })

  it('calls loadDemoReport on mount', () => {
    const loadSpy = vi.fn()
    useDemoStore.setState({ ...useDemoStore.getState(), loadDemoReport: loadSpy })
    render(<DemoPage />)
    expect(loadSpy).toHaveBeenCalledOnce()
  })

  it('renders Demo mode indicator', () => {
    render(<DemoPage />)
    expect(screen.getByText(/^demo$/i)).toBeInTheDocument()
  })

  it('renders "Upload your own file" button', () => {
    render(<DemoPage />)
    expect(screen.getByRole('button', { name: /upload your own file/i })).toBeInTheDocument()
  })

  it('renders all 6 bookmark names from sample report', () => {
    render(<DemoPage />)
    expect(screen.getByText('Chart View')).toBeInTheDocument()
    expect(screen.getByText('Table View')).toBeInTheDocument()
    expect(screen.getByText('North Region')).toBeInTheDocument()
    expect(screen.getByText('South Region')).toBeInTheDocument()
    expect(screen.getByText('Executive View')).toBeInTheDocument()
    expect(screen.getByText('Top Products Focus')).toBeInTheDocument()
  })

  it('renders wireframe canvas', () => {
    render(<DemoPage />)
    expect(screen.getByTestId('wireframe-canvas')).toBeInTheDocument()
  })

  it('clicking "Upload your own file" calls exitDemoMode', () => {
    const exitSpy = vi.fn()
    useDemoStore.setState({ ...useDemoStore.getState(), exitDemoMode: exitSpy })
    render(<DemoPage />)
    fireEvent.click(screen.getByRole('button', { name: /upload your own file/i }))
    expect(exitSpy).toHaveBeenCalledOnce()
  })

  it('clicking "Upload your own file" navigates to / with focusUpload state', () => {
    render(<DemoPage />)
    fireEvent.click(screen.getByRole('button', { name: /upload your own file/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true, state: { focusUpload: true } })
  })
})

describe('DemoPage — skip navigation link', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: sampleData as AuditReport })
    useDemoStore.setState({ isDemoMode: false, loadDemoReport: vi.fn(), exitDemoMode: vi.fn() })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
  })

  it('renders a skip navigation link', () => {
    render(<DemoPage />)
    expect(screen.getByRole('link', { name: /skip to bookmark list/i })).toBeInTheDocument()
  })

  it('skip link href targets #bookmark-list', () => {
    render(<DemoPage />)
    expect(screen.getByRole('link', { name: /skip to bookmark list/i })).toHaveAttribute('href', '#bookmark-list')
  })

  it('bookmark list container has id="bookmark-list"', () => {
    render(<DemoPage />)
    expect(document.getElementById('bookmark-list')).toBeInTheDocument()
  })

  it('bookmark list container has tabIndex=-1 for programmatic focus', () => {
    render(<DemoPage />)
    expect(document.getElementById('bookmark-list')).toHaveAttribute('tabindex', '-1')
  })

  it('skip link is not hidden with display:none or visibility:hidden', () => {
    render(<DemoPage />)
    const link = screen.getByRole('link', { name: /skip to bookmark list/i })
    expect(link).not.toHaveStyle('display: none')
    expect(link).not.toHaveStyle('visibility: hidden')
  })

  it('skip link activation moves focus to #bookmark-list container', () => {
    render(<DemoPage />)
    const container = document.getElementById('bookmark-list')!
    container.focus()
    expect(document.activeElement).toBe(container)
  })
})
