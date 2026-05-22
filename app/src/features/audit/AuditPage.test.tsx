import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuditPage from './AuditPage'
import { useAuditStore } from '@/store/auditStore'
import { useUiStore } from '@/store/uiStore'
import { useFilterStore } from '@/store/filterStore'
import { sessionCache } from '@/shared/utils/sessionCache'
import { buildBookmark } from '@/__fixtures__/builders/bookmarkBuilder'
import { makeReport } from '@/__fixtures__/builders/reportBuilder'
import type { PageLayout } from '@/types/audit'

const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/shared/utils/sessionCache', () => ({
  sessionCache: {
    read: vi.fn(),
    write: vi.fn(),
    clear: vi.fn(),
  },
}))

function makePageLayout(visualIds: string[]): PageLayout {
  return {
    pageId: 'page-1',
    pageDisplayName: 'Page 1',
    canvasWidth: 1280,
    canvasHeight: 720,
    visuals: visualIds.map((id, i) => ({
      id,
      visualType: 'tableEx',
      position: { x: 0, y: i * 100, width: 200, height: 90, tabOrder: i + 1 },
    })),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuditStore.setState({ auditReport: null, selectedPageId: null })
  useUiStore.setState({ selectedBookmarkId: null })
  useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
})

describe('AuditPage — session hydration', () => {
  it('redirects to / with replace when auditReport is null and sessionCache.read() returns null', async () => {
    vi.mocked(sessionCache.read).mockReturnValue(null)
    await act(async () => { render(<AuditPage />) })
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('populates auditStore and renders when auditReport is null and sessionCache has a report', async () => {
    const report = makeReport({
      bookmarks: [buildBookmark().withName('Sales View').build()],
      pages: [makePageLayout(['v-1'])],
      activePageId: 'page-1',
    })
    vi.mocked(sessionCache.read).mockReturnValue(report)
    await act(async () => { render(<AuditPage />) })
    expect(useAuditStore.getState().auditReport).toEqual(report)
    expect(screen.getByText('Sales View')).toBeInTheDocument()
  })

  it('does NOT reject a cached report that has pages: [] (valid new-schema report with no layout)', async () => {
    const report = makeReport({ bookmarks: [] })
    vi.mocked(sessionCache.read).mockReturnValue(report)
    await act(async () => { render(<AuditPage />) })
    expect(sessionCache.clear).not.toHaveBeenCalled()
    expect(useAuditStore.getState().auditReport).toEqual(report)
  })

  it('does NOT call sessionCache.read() when auditReport is already in store', () => {
    const report = makeReport()
    useAuditStore.setState({ auditReport: report })
    render(<AuditPage />)
    expect(sessionCache.read).not.toHaveBeenCalled()
  })

  it('renders without redirect when auditReport is already in store', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('AuditPage — rendering', () => {
  it('renders all bookmarks from auditReport.bookmarks', () => {
    const report = makeReport({
      bookmarks: [
        buildBookmark().withName('Bk One').build(),
        buildBookmark().withName('Bk Two').build(),
      ],
    })
    useAuditStore.setState({ auditReport: report })
    render(<AuditPage />)
    expect(screen.getByText('Bk One')).toBeInTheDocument()
    expect(screen.getByText('Bk Two')).toBeInTheDocument()
  })

  it('renders filename from auditReport.filename in the topbar', () => {
    useAuditStore.setState({ auditReport: makeReport({ filename: 'MyReport.pbip' }) })
    render(<AuditPage />)
    expect(screen.getByText('MyReport.pbip')).toBeInTheDocument()
  })

  it('renders "Unknown Report" when auditReport.filename is absent', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(screen.getByText('Unknown Report')).toBeInTheDocument()
  })

  it('renders total bookmark count in the topbar', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().build(), buildBookmark().build()] }),
    })
    render(<AuditPage />)
    expect(screen.getByText('2 bookmarks')).toBeInTheDocument()
  })

  it('renders bookmark list container with role="listbox" and aria-label="Bookmark navigation"', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(screen.getByRole('listbox', { name: 'Bookmark navigation' })).toBeInTheDocument()
  })

  it('renders "Upload New File" button', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /upload new file/i })).toBeInTheDocument()
  })

  it('renders app title "Power BI Bookmark Visualiser" in the header', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(screen.getByText('Power BI Bookmark Visualiser')).toBeInTheDocument()
  })

  it('filename span does not truncate — full report name is always visible', () => {
    useAuditStore.setState({
      auditReport: makeReport({ filename: 'Sales Dashboard For Regional Bookmarks Q4 2025.Report' }),
    })
    render(<AuditPage />)
    const filenameEl = screen.getByText('Sales Dashboard For Regional Bookmarks Q4 2025.Report')
    expect(filenameEl.classList.contains('truncate')).toBe(false)
    expect(filenameEl.classList.contains('max-w-[240px]')).toBe(false)
  })
})

describe('AuditPage — parse warnings banner', () => {
  it('shows the warnings banner when parseWarnings is non-empty', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        parseWarnings: [{ structureName: 'bad-bk', location: 'bookmarks/bk1' }],
      }),
    })
    render(<AuditPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('does NOT show the warnings banner when parseWarnings is absent', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does NOT show the warnings banner when parseWarnings is an empty array', () => {
    useAuditStore.setState({ auditReport: makeReport({ parseWarnings: [] }) })
    render(<AuditPage />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('warnings banner has role="status"', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        parseWarnings: [{ structureName: 'x', location: 'y' }],
      }),
    })
    render(<AuditPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('AuditPage — upload new file', () => {
  it('clicking Upload New File clears the audit store', async () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /upload new file/i }))
    expect(useAuditStore.getState().auditReport).toBeNull()
  })

  it('clicking Upload New File calls sessionCache.clear()', async () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /upload new file/i }))
    expect(sessionCache.clear).toHaveBeenCalled()
  })

  it('clicking Upload New File navigates to / with replace and focusUpload state', async () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /upload new file/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true, state: { focusUpload: true } })
  })

  it('renders "Upload New File" as a primary button with bg-indigo-500 class', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    const btn = screen.getByRole('button', { name: /upload new file/i })
    expect(btn.className).toContain('bg-indigo-500')
  })
})

describe('AuditPage — toggle kind wiring', () => {
  it('passes toggleKind="pair" to BookmarkListItem for a bookmark in a toggle pair', () => {
    const bk = buildBookmark().withId('bk-1').withName('Toggle A').build()
    const report = makeReport({
      bookmarks: [bk],
      toggleGroups: [{ id: 'tg-1', kind: 'pair', bookmarkIds: ['bk-1', 'bk-2'] }],
    })
    useAuditStore.setState({ auditReport: report })
    render(<AuditPage />)
    expect(screen.getByRole('option', { name: /toggle pair/i })).toBeInTheDocument()
  })

  it('passes toggleKind="set" to BookmarkListItem for a bookmark in a toggle set', () => {
    const bk = buildBookmark().withId('bk-1').withName('Toggle B').build()
    const report = makeReport({
      bookmarks: [bk],
      toggleGroups: [{ id: 'tg-1', kind: 'set', bookmarkIds: ['bk-1', 'bk-2'] }],
    })
    useAuditStore.setState({ auditReport: report })
    render(<AuditPage />)
    expect(screen.getByRole('option', { name: /toggle set/i })).toBeInTheDocument()
  })

  it('does not pass toggleKind to BookmarkListItem for a bookmark not in any group', () => {
    const bk = buildBookmark().withId('bk-99').withName('Standalone').withType('display').build()
    const report = makeReport({
      bookmarks: [bk],
      toggleGroups: [{ id: 'tg-1', kind: 'pair', bookmarkIds: ['bk-1', 'bk-2'] }],
    })
    useAuditStore.setState({ auditReport: report })
    render(<AuditPage />)
    expect(screen.getByRole('option', { name: 'Standalone, display type' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/toggle/)).not.toBeInTheDocument()
  })
})

describe('AuditPage — layout compliance', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: makeReport() })
  })

  it('sidebar nav has w-[220px] class', () => {
    render(<AuditPage />)
    const nav = screen.getByRole('navigation', { name: 'Bookmark navigation' })
    expect(nav.className).toContain('w-[220px]')
  })

  it('canvas section has flex-1 class', () => {
    render(<AuditPage />)
    const section = screen.getByRole('region', { name: 'Report wireframe' })
    expect(section.className).toContain('flex-1')
  })

  it('main container has flex and overflow-hidden classes', () => {
    render(<AuditPage />)
    const main = screen.getByRole('main')
    expect(main.className).toContain('flex')
    expect(main.className).toContain('overflow-hidden')
  })
})

describe('AuditPage — keyboard navigation', () => {
  function renderWithBookmarks(count = 3) {
    const bookmarks = Array.from({ length: count }, (_, i) =>
      buildBookmark().withId(`bk-${i}`).withName(`Bookmark ${i}`).build()
    )
    useAuditStore.setState({ auditReport: makeReport({ bookmarks }) })
    render(<AuditPage />)
    return bookmarks
  }

  it('ArrowDown moves focus to the next bookmark item', async () => {
    renderWithBookmarks(3)
    const options = screen.getAllByRole('option')
    options[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(options[1]).toHaveFocus()
  })

  it('ArrowUp moves focus to the previous bookmark item', async () => {
    renderWithBookmarks(3)
    const options = screen.getAllByRole('option')
    options[1].focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(options[0]).toHaveFocus()
  })

  it('ArrowDown does not move focus past the last bookmark', async () => {
    renderWithBookmarks(2)
    const options = screen.getAllByRole('option')
    options[1].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(options[1]).toHaveFocus()
  })

  it('ArrowUp does not move focus before the first bookmark', async () => {
    renderWithBookmarks(2)
    const options = screen.getAllByRole('option')
    options[0].focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(options[0]).toHaveFocus()
  })

  it('Enter selects the currently focused bookmark', async () => {
    const bookmarks = renderWithBookmarks(3)
    const options = screen.getAllByRole('option')
    options[1].focus()
    await userEvent.keyboard('{Enter}')
    expect(useUiStore.getState().selectedBookmarkId).toBe(bookmarks[1].id)
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    expect(options[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('pressing Space selects the currently focused bookmark', async () => {
    const bookmarks = renderWithBookmarks(3)
    const options = screen.getAllByRole('option')
    options[0].focus()
    await userEvent.keyboard(' ')
    expect(useUiStore.getState().selectedBookmarkId).toBe(bookmarks[0].id)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('Escape clears selectedBookmarkId', async () => {
    const bookmarks = renderWithBookmarks(2)
    useUiStore.setState({ selectedBookmarkId: bookmarks[0].id })
    const options = screen.getAllByRole('option')
    options[0].focus()
    await userEvent.keyboard('{Escape}')
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })

  it('Enter on already-selected bookmark deselects it', async () => {
    const bookmarks = renderWithBookmarks(2)
    useUiStore.setState({ selectedBookmarkId: bookmarks[0].id })
    const options = screen.getAllByRole('option')
    options[0].focus()
    await userEvent.keyboard('{Enter}')
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })
})

describe('AuditPage — bookmark detail panel', () => {
  it('shows empty state when no bookmark is selected', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    useUiStore.setState({ selectedBookmarkId: null })
    render(<AuditPage />)
    expect(screen.getByText('Select a bookmark to see details')).toBeInTheDocument()
  })

  it('renders BookmarkDetail when a bookmark is selected', () => {
    const bookmark = buildBookmark()
      .withId('bk-detail')
      .withType('display')
      .withAffectedVisualIds(['v-001'])
      .build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [bookmark] }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-detail' })
    render(<AuditPage />)
    expect(screen.getByRole('region', { name: /affected visuals/i })).toBeInTheDocument()
    expect(screen.queryByText('Select a bookmark to see details')).not.toBeInTheDocument()
  })

  it('shows empty state when selectedBookmarkId does not match any bookmark', () => {
    const bookmark = buildBookmark().withId('bk-real').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [bookmark] }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-nonexistent' })
    render(<AuditPage />)
    expect(screen.getByText('Select a bookmark to see details')).toBeInTheDocument()
  })
})

describe('AuditPage — bookmark selection', () => {
  it('clicking a bookmark sets selectedBookmarkId in uiStore', async () => {
    const bookmarks = [
      buildBookmark().withId('bk-0').withName('First').build(),
      buildBookmark().withId('bk-1').withName('Second').build(),
    ]
    useAuditStore.setState({ auditReport: makeReport({ bookmarks }) })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('option', { name: /Second/i }))
    expect(useUiStore.getState().selectedBookmarkId).toBe('bk-1')
  })

  it('selected bookmark has aria-selected="true"', async () => {
    const bookmarks = [
      buildBookmark().withId('bk-0').withName('First').build(),
    ]
    useAuditStore.setState({ auditReport: makeReport({ bookmarks }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-0' })
    render(<AuditPage />)
    expect(screen.getByRole('option', { name: /First/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('unselected bookmarks have aria-selected="false"', async () => {
    const bookmarks = [
      buildBookmark().withId('bk-0').withName('First').build(),
      buildBookmark().withId('bk-1').withName('Second').build(),
    ]
    useAuditStore.setState({ auditReport: makeReport({ bookmarks }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-0' })
    render(<AuditPage />)
    expect(screen.getByRole('option', { name: /Second/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('Upload New File clears selectedBookmarkId', async () => {
    useAuditStore.setState({ auditReport: makeReport() })
    useUiStore.setState({ selectedBookmarkId: 'bk-99' })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /upload new file/i }))
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })

  it('clicking an already-selected bookmark deselects it', async () => {
    const bookmarks = [buildBookmark().withId('bk-0').withName('First').build()]
    useAuditStore.setState({ auditReport: makeReport({ bookmarks }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-0' })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('option', { name: /First/i }))
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })
})

describe('AuditPage — wireframe canvas', () => {
  function makeWireframeLayout(overrides: Partial<PageLayout> = {}): PageLayout {
    return {
      pageId: 'pg-1',
      pageDisplayName: 'Overview',
      canvasWidth: 1280,
      canvasHeight: 720,
      visuals: [
        { id: 'v-1', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 150 } },
      ],
      ...overrides,
    }
  }

  it('renders WireframeCanvas visual elements when auditReport has pages', () => {
    useAuditStore.setState({ auditReport: makeReport({ pages: [makeWireframeLayout()], activePageId: 'pg-1' }) })
    const { container } = render(<AuditPage />)
    expect(container.querySelector('rect')).toBeInTheDocument()
  })

  it('does not render WireframeCanvas when auditReport.pages is empty', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    const { container } = render(<AuditPage />)
    expect(container.querySelector('rect')).not.toBeInTheDocument()
  })

  it('shows BookmarkDetail below canvas when pages is set and a bookmark is selected', () => {
    const bookmark = buildBookmark()
      .withId('bk-detail')
      .withType('display')
      .withAffectedVisualIds(['v-001'])
      .build()
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [bookmark], pages: [makeWireframeLayout()], activePageId: 'pg-1' }),
    })
    useUiStore.setState({ selectedBookmarkId: 'bk-detail' })
    const { container: c } = render(<AuditPage />)
    expect(screen.getByRole('region', { name: /affected visuals/i })).toBeInTheDocument()
    expect(c.querySelector('rect')).toBeInTheDocument()
  })
})

describe('AuditPage — bookmark search', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  it('renders the search input in the sidebar', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withName('Sales View').build()] }),
    })
    render(<AuditPage />)
    expect(screen.getByRole('textbox', { name: /search bookmarks/i })).toBeInTheDocument()
  })

  it('filters bookmark list by name on keystroke', async () => {
    const b1 = buildBookmark().withId('bk-1').withName('Sales View').build()
    const b2 = buildBookmark().withId('bk-2').withName('Cost Summary').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2] }) })
    render(<AuditPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /search bookmarks/i }), 'Sales')
    expect(screen.getByText('Sales View')).toBeInTheDocument()
    expect(screen.queryByText('Cost Summary')).not.toBeInTheDocument()
  })

  it('search filtering is case-insensitive', async () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withName('Sales View').build()] }),
    })
    render(<AuditPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /search bookmarks/i }), 'sales')
    expect(screen.getByText('Sales View')).toBeInTheDocument()
  })

  it('shows "No bookmarks match these filters" when search has no results', async () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withName('Sales View').build()] }),
    })
    render(<AuditPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /search bookmarks/i }), 'zzz')
    expect(screen.getByText('No bookmarks match these filters')).toBeInTheDocument()
  })

  it('shows "Clear all filters" button in empty search state', async () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withName('Sales View').build()] }),
    })
    render(<AuditPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /search bookmarks/i }), 'zzz')
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument()
  })

  it('restores full bookmark list after clicking "Clear all filters"', async () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withName('Sales View').build()] }),
    })
    render(<AuditPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /search bookmarks/i }), 'zzz')
    await userEvent.click(screen.getByRole('button', { name: /clear all filters/i }))
    expect(screen.getByText('Sales View')).toBeInTheDocument()
  })

  it('does not show empty search state when report has zero bookmarks and search is empty', () => {
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [] }) })
    render(<AuditPage />)
    expect(screen.queryByText('No bookmarks match these filters')).not.toBeInTheDocument()
  })
})

describe('AuditPage — bookmark type filter', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  it('renders the type filter dropdown trigger in the sidebar', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withType('display').build()] }),
    })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /^type$/i })).toBeInTheDocument()
  })

  it('filters bookmark list to show only bookmarks of selected type', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Display BM').withType('display').build()
    const b2 = buildBookmark().withId('bk-2').withName('Data BM').withType('data').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2] }) })
    useFilterStore.setState({ selectedTypes: ['display'] })
    render(<AuditPage />)
    expect(screen.getByText('Display BM')).toBeInTheDocument()
    expect(screen.queryByText('Data BM')).not.toBeInTheDocument()
  })

  it('uses OR logic when multiple types selected', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Display BM').withType('display').build()
    const b2 = buildBookmark().withId('bk-2').withName('Data BM').withType('data').build()
    const b3 = buildBookmark().withId('bk-3').withName('Mixed BM').withType('mixed').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2, b3] }) })
    useFilterStore.setState({ selectedTypes: ['display', 'data'] })
    render(<AuditPage />)
    expect(screen.getByText('Display BM')).toBeInTheDocument()
    expect(screen.getByText('Data BM')).toBeInTheDocument()
    expect(screen.queryByText('Mixed BM')).not.toBeInTheDocument()
  })

  it('combines type filter and search query with AND logic', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Sales Display').withType('display').build()
    const b2 = buildBookmark().withId('bk-2').withName('Sales Data').withType('data').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2] }) })
    useFilterStore.setState({ searchQuery: 'sales', selectedTypes: ['display'] })
    render(<AuditPage />)
    expect(screen.getByText('Sales Display')).toBeInTheDocument()
    expect(screen.queryByText('Sales Data')).not.toBeInTheDocument()
  })

  it('shows "Clear filters" button in filter row when type filter is active', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withType('display').build()] }),
    })
    useFilterStore.setState({ selectedTypes: ['display'] })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /^clear filters$/i })).toBeInTheDocument()
  })

  it('does not show "Clear filters" button when no type filter is active', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withType('display').build()] }),
    })
    render(<AuditPage />)
    expect(screen.queryByRole('button', { name: /^clear filters$/i })).not.toBeInTheDocument()
  })

  it('shows "No bookmarks match these filters" when type filter has no matches', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().withName('Display BM').withType('display').build()] }),
    })
    useFilterStore.setState({ selectedTypes: ['data'] })
    render(<AuditPage />)
    expect(screen.getByText('No bookmarks match these filters')).toBeInTheDocument()
  })

  it('restores full bookmark list when "Clear filters" button clicked', async () => {
    const b = buildBookmark().withId('bk-1').withName('Display BM').withType('display').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b] }) })
    useFilterStore.setState({ selectedTypes: ['data'] })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /^clear filters$/i }))
    expect(screen.getByText('Display BM')).toBeInTheDocument()
  })
})

describe('AuditPage — visual filter', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  it('renders the Visual filter trigger when pages has visuals', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [buildBookmark().build()],
        pages: [makePageLayout(['vis-1'])],
        activePageId: 'page-1',
      }),
    })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /^visual$/i })).toBeInTheDocument()
  })

  it('does NOT render the Visual filter trigger when pages is empty', () => {
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [buildBookmark().build()] }),
    })
    render(<AuditPage />)
    expect(screen.queryByRole('button', { name: /^visual$/i })).not.toBeInTheDocument()
  })

  it('does NOT render the Visual filter trigger when visuals array is empty', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [buildBookmark().build()],
        pages: [makePageLayout([])],
        activePageId: 'page-1',
      }),
    })
    render(<AuditPage />)
    expect(screen.queryByRole('button', { name: /^visual$/i })).not.toBeInTheDocument()
  })

  it('filters to bookmarks that include the selected visual id', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Canvas BM').withAffectedVisualIds(['vis-1']).build()
    const b2 = buildBookmark().withId('bk-2').withName('Other BM').withAffectedVisualIds(['vis-2']).build()
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [b1, b2],
        pages: [makePageLayout(['vis-1', 'vis-2'])],
        activePageId: 'page-1',
      }),
    })
    useFilterStore.setState({ selectedVisualIds: ['vis-1'] })
    render(<AuditPage />)
    expect(screen.getByText('Canvas BM')).toBeInTheDocument()
    expect(screen.queryByText('Other BM')).not.toBeInTheDocument()
  })

  it('uses OR logic within the visual dimension', () => {
    const b1 = buildBookmark().withId('bk-1').withName('BM One').withAffectedVisualIds(['vis-1']).build()
    const b2 = buildBookmark().withId('bk-2').withName('BM Two').withAffectedVisualIds(['vis-2']).build()
    const b3 = buildBookmark().withId('bk-3').withName('BM Three').withAffectedVisualIds(['vis-3']).build()
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [b1, b2, b3],
        pages: [makePageLayout(['vis-1', 'vis-2', 'vis-3'])],
        activePageId: 'page-1',
      }),
    })
    useFilterStore.setState({ selectedVisualIds: ['vis-1', 'vis-2'] })
    render(<AuditPage />)
    expect(screen.getByText('BM One')).toBeInTheDocument()
    expect(screen.getByText('BM Two')).toBeInTheDocument()
    expect(screen.queryByText('BM Three')).not.toBeInTheDocument()
  })

  it('applies AND logic across visual and type dimensions', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Display+Vis1').withType('display').withAffectedVisualIds(['vis-1']).build()
    const b2 = buildBookmark().withId('bk-2').withName('Data+Vis1').withType('data').withAffectedVisualIds(['vis-1']).build()
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [b1, b2],
        pages: [makePageLayout(['vis-1'])],
        activePageId: 'page-1',
      }),
    })
    useFilterStore.setState({ selectedTypes: ['display'], selectedVisualIds: ['vis-1'] })
    render(<AuditPage />)
    expect(screen.getByText('Display+Vis1')).toBeInTheDocument()
    expect(screen.queryByText('Data+Vis1')).not.toBeInTheDocument()
  })

  it('shows "Clear filters" button when visual filter is active', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [buildBookmark().withAffectedVisualIds(['vis-1']).build()],
        pages: [makePageLayout(['vis-1'])],
        activePageId: 'page-1',
      }),
    })
    useFilterStore.setState({ selectedVisualIds: ['vis-1'] })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /^clear filters$/i })).toBeInTheDocument()
  })

  it('shows "No bookmarks match these filters" when visual filter has no matches', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [buildBookmark().withName('BM').withAffectedVisualIds(['vis-1']).build()],
        pages: [makePageLayout(['vis-1', 'vis-2'])],
        activePageId: 'page-1',
      }),
    })
    useFilterStore.setState({ selectedVisualIds: ['vis-2'] })
    render(<AuditPage />)
    expect(screen.getByText('No bookmarks match these filters')).toBeInTheDocument()
  })

  it('combines visual filter and search query with AND logic', () => {
    const b1 = buildBookmark().withId('bk-1').withName('Sales BM').withAffectedVisualIds(['vis-1']).build()
    const b2 = buildBookmark().withId('bk-2').withName('Cost BM').withAffectedVisualIds(['vis-1']).build()
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [b1, b2],
        pages: [makePageLayout(['vis-1'])],
        activePageId: 'page-1',
      }),
    })
    useFilterStore.setState({ searchQuery: 'sales', selectedVisualIds: ['vis-1'] })
    render(<AuditPage />)
    expect(screen.getByText('Sales BM')).toBeInTheDocument()
    expect(screen.queryByText('Cost BM')).not.toBeInTheDocument()
  })
})

describe('AuditPage — skip navigation link', () => {
  beforeEach(() => {
    useAuditStore.setState({ auditReport: makeReport() })
  })

  afterEach(() => {
    useAuditStore.setState({ auditReport: null })
  })

  it('renders a skip navigation link', () => {
    render(<AuditPage />)
    expect(screen.getByRole('link', { name: /skip to bookmark list/i })).toBeInTheDocument()
  })

  it('skip link href targets #bookmark-list', () => {
    render(<AuditPage />)
    expect(screen.getByRole('link', { name: /skip to bookmark list/i })).toHaveAttribute('href', '#bookmark-list')
  })

  it('bookmark list container has id="bookmark-list"', () => {
    render(<AuditPage />)
    expect(document.getElementById('bookmark-list')).toBeInTheDocument()
  })

  it('bookmark list container has tabIndex=-1 for programmatic focus', () => {
    render(<AuditPage />)
    expect(document.getElementById('bookmark-list')).toHaveAttribute('tabindex', '-1')
  })

  it('skip link is not hidden with display:none or visibility:hidden', () => {
    render(<AuditPage />)
    const link = screen.getByRole('link', { name: /skip to bookmark list/i })
    expect(link).not.toHaveStyle('display: none')
    expect(link).not.toHaveStyle('visibility: hidden')
  })

  it('skip link activation moves focus to #bookmark-list container', () => {
    render(<AuditPage />)
    const container = document.getElementById('bookmark-list')!
    container.focus()
    expect(document.activeElement).toBe(container)
  })

  it('ArrowDown from focused container moves focus to first bookmark item', async () => {
    const b1 = buildBookmark().withId('bk-1').withName('First BM').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1] }) })
    render(<AuditPage />)
    const container = document.getElementById('bookmark-list')!
    container.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('option'))
  })
})

describe('AuditPage — bookmark grouping sections', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  it('renders "All Visuals" section header when at least one bookmark has applyOnlyToTargetVisuals: false', () => {
    const b = buildBookmark().withId('bk-1').withName('Global BM').withApplyOnlyToTargetVisuals(false).build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b] }) })
    render(<AuditPage />)
    expect(screen.getByText('All Visuals')).toBeInTheDocument()
  })

  it('renders "Selected Visuals" section header when at least one bookmark has applyOnlyToTargetVisuals: true', () => {
    const b = buildBookmark().withId('bk-1').withName('Targeted BM').withApplyOnlyToTargetVisuals(true).build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b] }) })
    render(<AuditPage />)
    expect(screen.getByText('Selected Visuals')).toBeInTheDocument()
  })

  it('hides "Selected Visuals" section when all bookmarks have applyOnlyToTargetVisuals: false', () => {
    const b = buildBookmark().withId('bk-1').withName('Global BM').withApplyOnlyToTargetVisuals(false).build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b] }) })
    render(<AuditPage />)
    expect(screen.queryByText('Selected Visuals')).not.toBeInTheDocument()
  })

  it('hides "All Visuals" section when all bookmarks have applyOnlyToTargetVisuals: true', () => {
    const b = buildBookmark().withId('bk-1').withName('Targeted BM').withApplyOnlyToTargetVisuals(true).build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b] }) })
    render(<AuditPage />)
    expect(screen.queryByText('All Visuals')).not.toBeInTheDocument()
  })

  it('hides a section when filter reduces it to zero matches', async () => {
    const b1 = buildBookmark().withId('bk-1').withName('Global BM').withApplyOnlyToTargetVisuals(false).build()
    const b2 = buildBookmark().withId('bk-2').withName('Targeted BM').withApplyOnlyToTargetVisuals(true).build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2] }) })
    render(<AuditPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /search bookmarks/i }), 'Global')
    expect(screen.getByText('All Visuals')).toBeInTheDocument()
    expect(screen.queryByText('Selected Visuals')).not.toBeInTheDocument()
  })

  it('ArrowDown navigates continuously from last item in "All Visuals" into first item in "Selected Visuals"', async () => {
    const b1 = buildBookmark().withId('bk-1').withName('Global BM').withApplyOnlyToTargetVisuals(false).build()
    const b2 = buildBookmark().withId('bk-2').withName('Targeted BM').withApplyOnlyToTargetVisuals(true).build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [b1, b2] }) })
    render(<AuditPage />)
    const options = screen.getAllByRole('option')
    options[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(options[1]).toHaveFocus()
  })
})

describe('AuditPage — bookmark auto-navigation', () => {
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
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('option', { name: /Nav BM/i }))
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
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('option', { name: /No Nav/i }))
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
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(useAuditStore.getState().selectedPageId).toBe('page-1')
  })
})

describe('AuditPage — reset to default button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuditStore.setState({ auditReport: null })
    useUiStore.setState({ selectedBookmarkId: null })
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  it('renders "Reset to Default" button when pages has visuals', () => {
    useAuditStore.setState({ auditReport: makeReport({ pages: [makePageLayout(['v-1'])], activePageId: 'page-1' }) })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /reset to default/i })).toBeInTheDocument()
  })

  it('does NOT render "Reset to Default" button when pages is empty', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    render(<AuditPage />)
    expect(screen.queryByRole('button', { name: /reset to default/i })).not.toBeInTheDocument()
  })

  it('button is disabled when no bookmark is selected', () => {
    useAuditStore.setState({ auditReport: makeReport({ pages: [makePageLayout(['v-1'])], activePageId: 'page-1' }) })
    useUiStore.setState({ selectedBookmarkId: null })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /reset to default/i })).toBeDisabled()
  })

  it('button is enabled when a bookmark is selected', () => {
    const bk = buildBookmark().withId('bk-1').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [bk], pages: [makePageLayout(['v-1'])], activePageId: 'page-1' }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-1' })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /reset to default/i })).not.toBeDisabled()
  })

  it('clicking Reset to Default clears selectedBookmarkId', async () => {
    const bk = buildBookmark().withId('bk-1').build()
    useAuditStore.setState({ auditReport: makeReport({ bookmarks: [bk], pages: [makePageLayout(['v-1'])], activePageId: 'page-1' }) })
    useUiStore.setState({ selectedBookmarkId: 'bk-1' })
    render(<AuditPage />)
    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(useUiStore.getState().selectedBookmarkId).toBeNull()
  })
})
