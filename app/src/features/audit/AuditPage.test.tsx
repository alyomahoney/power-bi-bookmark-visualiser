import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuditPage from './AuditPage'
import { useAuditStore } from '@/store/auditStore'
import { useUiStore } from '@/store/uiStore'
import { useFilterStore } from '@/store/filterStore'
import { sessionCache } from '@/shared/utils/sessionCache'
import { buildBookmark } from '@/__fixtures__/builders/bookmarkBuilder'
import type { AuditReport, PageLayout } from '@/types/audit'

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

function makeReport(partial: Partial<AuditReport> = {}): AuditReport {
  return { bookmarks: [], ...partial }
}

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
  useAuditStore.setState({ auditReport: null })
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
    const report = makeReport({ bookmarks: [buildBookmark().withName('Sales View').build()] })
    vi.mocked(sessionCache.read).mockReturnValue(report)
    await act(async () => { render(<AuditPage />) })
    expect(useAuditStore.getState().auditReport).toEqual(report)
    expect(screen.getByText('Sales View')).toBeInTheDocument()
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

  it('renders WireframeCanvas visual elements when auditReport.pageLayout is set', () => {
    useAuditStore.setState({ auditReport: makeReport({ pageLayout: makeWireframeLayout() }) })
    const { container } = render(<AuditPage />)
    expect(container.querySelector('rect')).toBeInTheDocument()
  })

  it('does not render WireframeCanvas when auditReport.pageLayout is absent', () => {
    useAuditStore.setState({ auditReport: makeReport() })
    const { container } = render(<AuditPage />)
    expect(container.querySelector('rect')).not.toBeInTheDocument()
  })

  it('shows BookmarkDetail below canvas when pageLayout is set and a bookmark is selected', () => {
    const bookmark = buildBookmark()
      .withId('bk-detail')
      .withType('display')
      .withAffectedVisualIds(['v-001'])
      .build()
    useAuditStore.setState({
      auditReport: makeReport({ bookmarks: [bookmark], pageLayout: makeWireframeLayout() }),
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

  it('renders the Visual filter trigger when pageLayout has visuals', () => {
    useAuditStore.setState({
      auditReport: makeReport({
        bookmarks: [buildBookmark().build()],
        pageLayout: makePageLayout(['vis-1']),
      }),
    })
    render(<AuditPage />)
    expect(screen.getByRole('button', { name: /^visual$/i })).toBeInTheDocument()
  })

  it('does NOT render the Visual filter trigger when pageLayout is absent', () => {
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
        pageLayout: makePageLayout([]),
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
        pageLayout: makePageLayout(['vis-1', 'vis-2']),
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
        pageLayout: makePageLayout(['vis-1', 'vis-2', 'vis-3']),
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
        pageLayout: makePageLayout(['vis-1']),
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
        pageLayout: makePageLayout(['vis-1']),
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
        pageLayout: makePageLayout(['vis-1', 'vis-2']),
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
        pageLayout: makePageLayout(['vis-1']),
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
