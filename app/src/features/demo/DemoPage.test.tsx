import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuditStore } from '@/store/auditStore'
import { useDemoStore } from '@/store/demoStore'
import { useFilterStore } from '@/store/filterStore'
import { useUiStore } from '@/store/uiStore'
import sampleData from '@/features/demo/sampleReports/sample.json'
import type { AuditReport } from '@/types/audit'
import { buildBookmark } from '@/__fixtures__/builders/bookmarkBuilder'
import { makeReport } from '@/__fixtures__/builders/reportBuilder'
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
  BookmarkListItem: ({ bookmark, onClick }: { bookmark: { id: string; name: string }; onClick?: () => void }) => (
    <div data-testid={`bookmark-${bookmark.id}`} onClick={onClick}>{bookmark.name}</div>
  ),
}))

vi.mock('@/features/audit/BookmarkDetail', () => ({
  BookmarkDetail: () => <div data-testid="bookmark-detail">Bookmark Detail</div>,
}))

describe('DemoPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    useAuditStore.setState({ auditReport: sampleData as AuditReport, selectedPageId: null })
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

  it('renders app title "Power BI Bookmark Visualiser" in the header', () => {
    render(<DemoPage />)
    expect(screen.getByText('Power BI Bookmark Visualiser')).toBeInTheDocument()
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

describe('DemoPage — bookmark type filter', () => {
  beforeEach(() => {
    useDemoStore.setState({ isDemoMode: false, loadDemoReport: vi.fn(), exitDemoMode: vi.fn() })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
  })

  it('uses OR logic when multiple axes selected', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Display BM').withType('display').build()
    const b2 = buildBookmark().withId('bk-2').withName('Data BM').withType('data').build()
    const b3 = buildBookmark().withId('bk-3').withName('Page BM').withType('page').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2, b3] }) })
    useFilterStore.setState({ selectedTypes: ['display', 'data'] })
    render(<DemoPage />)
    expect(screen.getByText('Display BM')).toBeInTheDocument()
    expect(screen.getByText('Data BM')).toBeInTheDocument()
    expect(screen.queryByText('Page BM')).not.toBeInTheDocument()
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

  it('filename span does not truncate — full report name is always visible', () => {
    render(<DemoPage />)
    const filenameEl = screen.getByText('Sales Dashboard Demo')
    expect(filenameEl.classList.contains('truncate')).toBe(false)
    expect(filenameEl.classList.contains('max-w-[240px]')).toBe(false)
  })
})

describe('DemoPage — bookmark grouping sections', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: sampleData as AuditReport })
    useDemoStore.setState({ isDemoMode: false, loadDemoReport: vi.fn(), exitDemoMode: vi.fn() })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
  })

  it('renders "All Visuals" section header for sample data (bm-north-region, bm-south-region)', () => {
    render(<DemoPage />)
    expect(screen.getByText('All Visuals')).toBeInTheDocument()
  })

  it('renders "Selected Visuals" section header for sample data (bm-chart-view, bm-table-view, bm-executive-view, bm-top-products-focus)', () => {
    render(<DemoPage />)
    expect(screen.getByText('Selected Visuals')).toBeInTheDocument()
  })
})

describe('DemoPage — reset to default button', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: sampleData as AuditReport })
    useDemoStore.setState({ isDemoMode: false, loadDemoReport: vi.fn(), exitDemoMode: vi.fn() })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
    useUiStore.setState({ selectedBookmarkId: null })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
    useUiStore.setState({ selectedBookmarkId: null })
  })

  it('renders "Reset to Default" button', () => {
    render(<DemoPage />)
    expect(screen.getByRole('button', { name: /reset to default/i })).toBeInTheDocument()
  })

  it('button is disabled when no bookmark is selected', () => {
    render(<DemoPage />)
    expect(screen.getByRole('button', { name: /reset to default/i })).toBeDisabled()
  })

  it('button is enabled when a bookmark is selected', () => {
    useUiStore.setState({ selectedBookmarkId: 'bm-chart-view' })
    render(<DemoPage />)
    expect(screen.getByRole('button', { name: /reset to default/i })).not.toBeDisabled()
  })

  it('clicking Reset to Default clears selectedBookmarkId', () => {
    useUiStore.setState({ selectedBookmarkId: 'bm-chart-view' })
    render(<DemoPage />)
    fireEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })
})

describe('DemoPage — bookmark auto-navigation', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    useDemoStore.setState({ isDemoMode: false, loadDemoReport: vi.fn(), exitDemoMode: vi.fn() })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
    useUiStore.setState({ selectedBookmarkId: null })
    useAuditStore.setState({ auditReport: null, selectedPageId: null })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
    useUiStore.setState({ selectedBookmarkId: null })
  })

  it('clicking a bookmark with targetPageId updates selectedPageId', async () => {
    const bk = buildBookmark().withId('bk-nav').withName('Nav BM').withTargetPageId('page-2').build()
    const report = makeReport({
      bookmarks: [bk],
      pages: [
        { pageId: 'page-1', pageDisplayName: 'Overview', canvasWidth: 1280, canvasHeight: 720, visuals: [] },
        { pageId: 'page-2', pageDisplayName: 'Detail', canvasWidth: 1280, canvasHeight: 720, visuals: [] },
      ],
      activePageId: 'page-1',
    })
    useAuditStore.setState({ auditReport: report, selectedPageId: 'page-1' })
    render(<DemoPage />)
    await userEvent.click(screen.getByTestId('bookmark-bk-nav'))
    expect(useAuditStore.getState().selectedPageId).toBe('page-2')
  })

  it('clicking a bookmark without targetPageId does not change selectedPageId', async () => {
    const bk = buildBookmark().withId('bk-no-nav').withName('No Nav').build()
    const report = makeReport({
      bookmarks: [bk],
      pages: [
        { pageId: 'page-1', pageDisplayName: 'Overview', canvasWidth: 1280, canvasHeight: 720, visuals: [] },
      ],
      activePageId: 'page-1',
    })
    useAuditStore.setState({ auditReport: report, selectedPageId: 'page-1' })
    render(<DemoPage />)
    await userEvent.click(screen.getByTestId('bookmark-bk-no-nav'))
    expect(useAuditStore.getState().selectedPageId).toBe('page-1')
  })

  it('clicking Reset to Default resets selectedPageId to activePageId', async () => {
    const bk = buildBookmark().withId('bk-1').build()
    const report = makeReport({
      bookmarks: [bk],
      pages: [
        { pageId: 'page-1', pageDisplayName: 'Overview', canvasWidth: 1280, canvasHeight: 720, visuals: [
          { id: 'v-1', visualType: 'tableEx', position: { x: 0, y: 0, width: 100, height: 100 } },
        ]},
        { pageId: 'page-2', pageDisplayName: 'Detail', canvasWidth: 1280, canvasHeight: 720, visuals: [] },
      ],
      activePageId: 'page-1',
    })
    useAuditStore.setState({ auditReport: report, selectedPageId: 'page-2' })
    useUiStore.setState({ selectedBookmarkId: 'bk-1' })
    render(<DemoPage />)
    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(useAuditStore.getState().selectedPageId).toBe('page-1')
  })
})
