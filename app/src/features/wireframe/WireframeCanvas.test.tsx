import { render, act } from '@testing-library/react'
import { WireframeCanvas } from './WireframeCanvas'
import type { PageLayout, AuditReport, Bookmark } from '@/types/audit'
import { useReducedMotion } from 'motion/react'
import { useUiStore } from '@/store/uiStore'
import { useAuditStore } from '@/store/auditStore'

function makePageLayout(visuals = 3): PageLayout {
  return {
    pageId: 'pg-test',
    pageDisplayName: 'Test Page',
    canvasWidth: 1280,
    canvasHeight: 720,
    visuals: Array.from({ length: visuals }, (_, i) => ({
      id: `visual-${i}`,
      visualType: 'clusteredColumnChart',
      position: { x: i * 100, y: 0, width: 90, height: 90 },
    })),
  }
}

describe('WireframeCanvas', () => {
  it('renders an SVG element', () => {
    const { container } = render(<WireframeCanvas pageLayout={makePageLayout()} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('has data-canvas-state="empty" on the SVG root', () => {
    const { container } = render(<WireframeCanvas pageLayout={makePageLayout()} />)
    expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
  })

  it('renders the correct number of visual cards', () => {
    const { container } = render(<WireframeCanvas pageLayout={makePageLayout(4)} />)
    expect(container.querySelectorAll('rect')).toHaveLength(4)
  })

  it('renders zero visuals when pageLayout has no visuals', () => {
    const { container } = render(<WireframeCanvas pageLayout={makePageLayout(0)} />)
    expect(container.querySelectorAll('rect')).toHaveLength(0)
  })

  describe('reduced motion', () => {
    beforeEach(() => {
      useUiStore.setState({ selectedBookmarkId: null })
      useAuditStore.setState({ auditReport: null })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('renders all visual cards correctly when reduced motion is enabled', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const { container } = render(<WireframeCanvas pageLayout={makePageLayout(3)} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(container.querySelectorAll('rect')).toHaveLength(3)
    })

    it('canvas state is still driven by store when reduced motion is enabled — empty with no selection', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const { container } = render(<WireframeCanvas pageLayout={makePageLayout(2)} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
    })

    it('canvas state is still driven by store when reduced motion is enabled — bookmark-selected with selection', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const bk: Bookmark = {
        id: 'bk-rm', name: 'Reduced Motion Test', type: 'display',
        affectedVisualIds: [], hiddenVisualIds: [],
        suppressDisplay: false, filterState: null,
        rawPayload: { options: {}, explorationState: null },
      }
      useAuditStore.setState({ auditReport: { bookmarks: [bk] } })
      useUiStore.setState({ selectedBookmarkId: 'bk-rm' })
      const { container } = render(<WireframeCanvas pageLayout={makePageLayout(2)} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'bookmark-selected')
    })
  })

  describe('unsupported visual type placeholder', () => {
    it('renders a rect for a visual with an unknown type (not filtered out)', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          {
            id: 'v-unknown',
            visualType: 'someUnknownVisualType',
            position: { x: 0, y: 0, width: 200, height: 150 },
          },
        ],
      }
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      expect(container.querySelectorAll('rect')).toHaveLength(1)
      expect(container.querySelector('rect')?.getAttribute('fill')).toBe('var(--color-visual-placeholder)')
      expect(container.querySelector('g')).toBeInTheDocument()
    })

    it('renders "Unknown Visual" label for an unsupported visual type', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          {
            id: 'v-unknown',
            visualType: 'someUnknownVisualType',
            position: { x: 0, y: 0, width: 200, height: 150 },
          },
        ],
      }
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      const texts = container.querySelectorAll('text')
      const found = Array.from(texts).some(t => t.textContent === 'Unknown Visual')
      expect(found).toBe(true)
    })

    it('renders a rect for each unsupported type variant — prefix-matched and registry-miss', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v1', visualType: 'PowerApps_PBI_CV_abc123', position: { x: 0, y: 0, width: 100, height: 80 } },
          { id: 'v2', visualType: 'FlowVisual_xyz789',       position: { x: 110, y: 0, width: 100, height: 80 } },
          { id: 'v3', visualType: 'map',                     position: { x: 220, y: 0, width: 100, height: 80 } },
        ],
      }
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      // All 3 visuals must produce a rect — none silently omitted
      expect(container.querySelectorAll('rect')).toHaveLength(3)
    })
  })

  describe('bookmark selection state', () => {
    beforeEach(() => {
      useUiStore.setState({ selectedBookmarkId: null })
      useAuditStore.setState({ auditReport: null })
    })

    function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
      return {
        id: 'bk-1',
        name: 'My Bookmark',
        type: 'display',
        affectedVisualIds: [],
        hiddenVisualIds: [],
        suppressDisplay: false,
        filterState: null,
        rawPayload: { options: {}, explorationState: null },
        ...overrides,
      }
    }

    function makeAuditReport(bookmarks: Bookmark[]): AuditReport {
      return { bookmarks }
    }

    it('has data-canvas-state="bookmark-selected" when a non-noOp bookmark is selected', () => {
      const bk = makeBookmark({ id: 'bk-1', suppressDisplay: false })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const { container } = render(<WireframeCanvas pageLayout={makePageLayout(2)} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'bookmark-selected')
    })

    it('has data-canvas-state="empty" when selected bookmark has suppressDisplay=true (data bookmark)', () => {
      const bk = makeBookmark({ id: 'bk-1', suppressDisplay: true })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const { container } = render(<WireframeCanvas pageLayout={makePageLayout(2)} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
    })

    it('renders indigo ring stroke on affected visual rect when bookmark is selected', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v-affected', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 150 } },
          { id: 'v-neutral',  visualType: 'lineChart',            position: { x: 210, y: 0, width: 200, height: 150 } },
        ],
      }
      const bk = makeBookmark({ id: 'bk-1', affectedVisualIds: ['v-affected'], hiddenVisualIds: [] })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      const rects = container.querySelectorAll('rect')
      expect(rects[0].getAttribute('stroke')).toBe('var(--color-ring)')
      expect(rects[1]).not.toHaveAttribute('stroke', 'var(--color-ring)')
    })

    it('does not render ring on hidden visual (hidden visuals only get opacity change)', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v-hidden', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 150 } },
        ],
      }
      const bk = makeBookmark({ id: 'bk-1', hiddenVisualIds: ['v-hidden'], affectedVisualIds: [] })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      const rect = container.querySelector('rect')
      expect(rect).not.toHaveAttribute('stroke', 'var(--color-ring)')
    })

    it('hidden wins when visual appears in both hiddenVisualIds and affectedVisualIds — no ring rendered', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v-overlap', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 150 } },
        ],
      }
      const bk = makeBookmark({ id: 'bk-1', hiddenVisualIds: ['v-overlap'], affectedVisualIds: ['v-overlap'] })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      const rect = container.querySelector('rect')
      expect(rect).not.toHaveAttribute('stroke', 'var(--color-ring)')
    })

    it('reflects new bookmark ring state when switching from bookmark A to bookmark B', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v-1', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 150 } },
          { id: 'v-2', visualType: 'lineChart', position: { x: 210, y: 0, width: 200, height: 150 } },
        ],
      }
      const bkA = makeBookmark({ id: 'bk-a', affectedVisualIds: ['v-1'], hiddenVisualIds: [] })
      const bkB = makeBookmark({ id: 'bk-b', affectedVisualIds: ['v-2'], hiddenVisualIds: [] })
      useAuditStore.setState({ auditReport: makeAuditReport([bkA, bkB]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-a' })
      const { container } = render(<WireframeCanvas pageLayout={pageLayout} />)
      act(() => { useUiStore.setState({ selectedBookmarkId: 'bk-b' }) })
      const rects = container.querySelectorAll('rect')
      expect(rects[0]).not.toHaveAttribute('stroke', 'var(--color-ring)')
      expect(rects[1].getAttribute('stroke')).toBe('var(--color-ring)')
    })

    it('returns to data-canvas-state="empty" after bookmark is deselected', () => {
      const bk = makeBookmark({ id: 'bk-1', suppressDisplay: false })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const { container } = render(<WireframeCanvas pageLayout={makePageLayout(2)} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'bookmark-selected')
      act(() => { useUiStore.setState({ selectedBookmarkId: null }) })
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
    })
  })

  it('uses canvas aspect ratio from pageLayout', () => {
    const { container } = render(
      <WireframeCanvas pageLayout={{ ...makePageLayout(), canvasWidth: 1920, canvasHeight: 1080 }} />
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.aspectRatio).toBe('1920 / 1080')
  })
})
