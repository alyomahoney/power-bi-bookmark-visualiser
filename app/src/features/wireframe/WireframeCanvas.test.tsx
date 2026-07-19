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

function makePages(visuals = 3): [PageLayout[], string] {
  const page = makePageLayout(visuals)
  return [[page], page.pageId]
}

describe('WireframeCanvas', () => {
  it('renders an SVG element', () => {
    const [pages, selectedPageId] = makePages()
    const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('has data-canvas-state="empty" on the SVG root', () => {
    const [pages, selectedPageId] = makePages()
    const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
    expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
  })

  it('renders the correct number of visual cards', () => {
    const [pages, selectedPageId] = makePages(4)
    const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
    expect(container.querySelectorAll('rect[data-card-bg]')).toHaveLength(4)
  })

  it('renders zero visuals when pageLayout has no visuals', () => {
    const [pages, selectedPageId] = makePages(0)
    const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
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
      const [pages, selectedPageId] = makePages(3)
      const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(container.querySelectorAll('rect[data-card-bg]')).toHaveLength(3)
    })

    it('canvas state is still driven by store when reduced motion is enabled — empty with no selection', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const [pages, selectedPageId] = makePages(2)
      const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
    })

    it('canvas state is still driven by store when reduced motion is enabled — bookmark-selected with selection', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const bk: Bookmark = {
        id: 'bk-rm', name: 'Reduced Motion Test', type: 'display',
        affectedVisualIds: [], hiddenVisualIds: [],
        suppressDisplay: false, applyOnlyToTargetVisuals: false, filterState: null,
        rawPayload: { options: {}, explorationState: null },
      }
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-rm' })
      const [pages, selectedPageId] = makePages(2)
      const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
      // All 3 visuals must produce a card rect — none silently omitted
      expect(container.querySelectorAll('rect[data-card-bg]')).toHaveLength(3)
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
        applyOnlyToTargetVisuals: false,
        filterState: null,
        rawPayload: { options: {}, explorationState: null },
        ...overrides,
      }
    }

    function makeAuditReport(bookmarks: Bookmark[]): AuditReport {
      return { bookmarks, pages: [], activePageId: '' }
    }

    it('has data-canvas-state="bookmark-selected" when a non-noOp bookmark is selected', () => {
      const bk = makeBookmark({ id: 'bk-1', suppressDisplay: false })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const [pages, selectedPageId] = makePages(2)
      const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'bookmark-selected')
    })

    it('has data-canvas-state="bookmark-selected" when a data bookmark (suppressDisplay=true) is selected', () => {
      const bk = makeBookmark({ id: 'bk-1', suppressDisplay: true })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const [pages, selectedPageId] = makePages(2)
      const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'bookmark-selected')
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
      const rects = container.querySelectorAll('rect[data-card-bg]')
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
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
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
      act(() => { useUiStore.setState({ selectedBookmarkId: 'bk-b' }) })
      const rects = container.querySelectorAll('rect[data-card-bg]')
      expect(rects[0]).not.toHaveAttribute('stroke', 'var(--color-ring)')
      expect(rects[1].getAttribute('stroke')).toBe('var(--color-ring)')
    })

    it('returns to data-canvas-state="empty" after bookmark is deselected', () => {
      const bk = makeBookmark({ id: 'bk-1', suppressDisplay: false })
      useAuditStore.setState({ auditReport: makeAuditReport([bk]) })
      useUiStore.setState({ selectedBookmarkId: 'bk-1' })
      const [pages, selectedPageId] = makePages(2)
      const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'bookmark-selected')
      act(() => { useUiStore.setState({ selectedBookmarkId: null }) })
      expect(container.querySelector('svg')).toHaveAttribute('data-canvas-state', 'empty')
    })
  })

  describe('data bookmark glow indicator', () => {
    const glowPageLayout: PageLayout = {
      pageId: 'pg-glow',
      pageDisplayName: 'Glow Test Page',
      canvasWidth: 1280,
      canvasHeight: 720,
      visuals: [
        { id: 'v-affected', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 150 } },
        { id: 'v-neutral',  visualType: 'lineChart',            position: { x: 210, y: 0, width: 200, height: 150 } },
      ],
    }

    function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
      return {
        id: 'bk-glow',
        name: 'Glow Bookmark',
        type: 'data',
        affectedVisualIds: [],
        hiddenVisualIds: [],
        suppressDisplay: true,
        applyOnlyToTargetVisuals: false,
        filterState: null,
        rawPayload: { options: {}, explorationState: null },
        ...overrides,
      }
    }

    beforeEach(() => {
      useUiStore.setState({ selectedBookmarkId: null })
      useAuditStore.setState({ auditReport: null })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it("Test A: 'data' type bookmark — amber glow background appears on affected visual rect", () => {
      const bk = makeBookmark({ type: 'data', suppressDisplay: true, affectedVisualIds: ['v-affected'] })
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-glow' })
      const { container } = render(<WireframeCanvas pages={[glowPageLayout]} selectedPageId={glowPageLayout.pageId} />)
      const glowRect = container.querySelector('rect[data-glow="true"]')
      expect(glowRect).toBeInTheDocument()
      expect(glowRect?.getAttribute('fill')).toMatch(/^color-mix\(in oklch, var\(--color-visual-chart\), white/)
    })

    it("Test B: 'data' type bookmark — no indigo ring on affected visual", () => {
      const bk = makeBookmark({ type: 'data', suppressDisplay: true, affectedVisualIds: ['v-affected'] })
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-glow' })
      const { container } = render(<WireframeCanvas pages={[glowPageLayout]} selectedPageId={glowPageLayout.pageId} />)
      const rects = Array.from(container.querySelectorAll('rect'))
      const ringRect = rects.find(r => r.getAttribute('stroke') === 'var(--color-ring)')
      expect(ringRect).toBeUndefined()
    })

    it("Test C: 'display' type bookmark — no amber glow (unchanged behaviour)", () => {
      const bk = makeBookmark({ type: 'display', suppressDisplay: false, affectedVisualIds: ['v-affected'] })
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-glow' })
      const { container } = render(<WireframeCanvas pages={[glowPageLayout]} selectedPageId={glowPageLayout.pageId} />)
      const glowRect = container.querySelector('rect[data-glow="true"]')
      expect(glowRect).not.toBeInTheDocument()
    })

    it("Test D: 'data-display' type bookmark — both amber glow AND indigo ring present on affected visual", () => {
      const bk = makeBookmark({ type: 'data-display', suppressDisplay: false, affectedVisualIds: ['v-affected'], hiddenVisualIds: [] })
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-glow' })
      const { container } = render(<WireframeCanvas pages={[glowPageLayout]} selectedPageId={glowPageLayout.pageId} />)
      const glowRect = container.querySelector('rect[data-glow="true"]')
      const ringRect = Array.from(container.querySelectorAll('rect')).find(r => r.getAttribute('stroke') === 'var(--color-ring)')
      expect(glowRect).toBeInTheDocument()
      expect(ringRect).toBeInTheDocument()
    })

    it('Test E: reduced motion — amber glow is a static rect (no animation)', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const bk = makeBookmark({ type: 'data', suppressDisplay: true, affectedVisualIds: ['v-affected'] })
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-glow' })
      const { container } = render(<WireframeCanvas pages={[glowPageLayout]} selectedPageId={glowPageLayout.pageId} />)
      const glowRect = container.querySelector('rect[data-glow="true"]')
      expect(glowRect).toBeInTheDocument()
    })

    it('Test F: hidden visual in a data bookmark does NOT get the glow', () => {
      const bk = makeBookmark({ type: 'data', suppressDisplay: true, affectedVisualIds: ['v-affected'], hiddenVisualIds: ['v-affected'] })
      useAuditStore.setState({ auditReport: { bookmarks: [bk], pages: [], activePageId: '' } })
      useUiStore.setState({ selectedBookmarkId: 'bk-glow' })
      const { container } = render(<WireframeCanvas pages={[glowPageLayout]} selectedPageId={glowPageLayout.pageId} />)
      const glowRect = container.querySelector('rect[data-glow="true"]')
      expect(glowRect).not.toBeInTheDocument()
    })
  })

  it('uses canvas aspect ratio from pageLayout', () => {
    const page = { ...makePageLayout(), canvasWidth: 1920, canvasHeight: 1080 }
    const { container } = render(<WireframeCanvas pages={[page]} selectedPageId={page.pageId} />)
    const surround = container.firstElementChild as HTMLElement
    const canvasContainer = surround.firstElementChild as HTMLElement
    expect(canvasContainer.style.aspectRatio).toBe('1920 / 1080')
  })

  it('canvas report box has dark background CSS variable', () => {
    const [pages, selectedPageId] = makePages()
    const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
    const surround = container.firstElementChild as HTMLElement
    const canvasContainer = surround.firstElementChild as HTMLElement
    expect(canvasContainer.style.backgroundColor).toBe('var(--color-canvas-surround)')
  })

  it('canvas inner div is constrained by max-width and max-height to prevent overflow', () => {
    const [pages, selectedPageId] = makePages()
    const { container } = render(<WireframeCanvas pages={pages} selectedPageId={selectedPageId} />)
    const surround = container.firstElementChild as HTMLElement
    const canvasContainer = surround.firstElementChild as HTMLElement
    expect(canvasContainer.style.maxWidth).toBe('100%')
    expect(canvasContainer.style.maxHeight).toBe('100%')
  })

  describe('visual type icons', () => {
    it('renders a PowerBiIcon glyph (nested svg) inside each known-type visual card with room for one', () => {
      // Tall enough (well above the label-safe-zone threshold) that the icon actually renders —
      // see makePowerBiVisualIcon's label-collision guard in visualTypes.tsx.
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: Array.from({ length: 2 }, (_, i) => ({
          id: `visual-${i}`,
          visualType: 'clusteredColumnChart',
          position: { x: i * 300, y: 0, width: 280, height: 280 },
        })),
      }
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
      // clusteredColumnChart → PowerBiIcon's "clusteredColumn" glyph, a nested <svg data-icon-name="...">
      const icons = container.querySelectorAll('svg[data-icon-name="clusteredColumn"]')
      expect(icons).toHaveLength(2)
      // Background card rects are unaffected by the icon's own internal rects
      expect(container.querySelectorAll('rect[data-card-bg]')).toHaveLength(2)
    })

    it('suppresses the icon (but keeps the label) on a card too short to fit both', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v-short', visualType: 'clusteredColumnChart', position: { x: 0, y: 0, width: 200, height: 60 } },
        ],
      }
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
      expect(container.querySelector('svg[data-icon-name]')).not.toBeInTheDocument()
      const texts = container.querySelectorAll('text')
      expect(Array.from(texts).some(t => t.textContent === 'Col Chart')).toBe(true)
    })

    it('renders placeholder icon (path/circle) for an unknown visual type, card rect count stays at 1', () => {
      const pageLayout: PageLayout = {
        pageId: 'pg-test',
        pageDisplayName: 'Test Page',
        canvasWidth: 1280,
        canvasHeight: 720,
        visuals: [
          { id: 'v-unknown', visualType: 'someUnknownVisualType', position: { x: 0, y: 0, width: 200, height: 150 } },
        ],
      }
      const { container } = render(<WireframeCanvas pages={[pageLayout]} selectedPageId={pageLayout.pageId} />)
      // PLACEHOLDER_ICON uses path + circle, not rect, and no PowerBiIcon glyph
      expect(container.querySelector('path')).toBeInTheDocument()
      expect(container.querySelector('svg[data-icon-name]')).not.toBeInTheDocument()
      expect(container.querySelectorAll('rect[data-card-bg]')).toHaveLength(1)
    })
  })
})
