import { describe, it, expect } from 'vitest'
import {
  computeIconLayout,
  getVisualCategory,
  getVisualDisplayName,
  getVisualIcon,
  VISUAL_TYPE_CATEGORY,
  VISUAL_DISPLAY_NAME,
  PLACEHOLDER_ICON,
} from './visualTypes'

// Real card sizes (px) from a "Navigation & Utility" report page, converted to
// viewBox units at canvasWidth=1280 (1 unit = 12.8px) — see wireframeLayout's
// isotropic scaling. These pin down the icon-vs-no-icon boundary against
// genuine small utility visuals (buttons, nav strips, shapes, slicers) so the
// threshold can't silently regress back to hiding icons on real-world reports.
const UNIT = 12.8
const px = (n: number) => n / UNIT

describe('getVisualCategory', () => {
  describe('charts', () => {
    it.each(['clusteredColumnChart', 'columnChart', 'clusteredBarChart', 'barChart',
             'lineChart', 'areaChart', 'waterfallChart', 'funnel', 'scatterChart',
             'hundredPercentStackedBarChart', 'hundredPercentStackedColumnChart',
             'stackedAreaChart', 'ribbonChart', 'map', 'filledMap', 'azureMap',
             'esriVisual', 'decompositionTreeVisual', 'keyDriversVisual',
             'lineStackedColumnComboChart', 'lineClusteredColumnComboChart',
             'pythonVisual', 'scriptVisual'])(
      '%s → charts',
      (type) => expect(getVisualCategory(type)).toBe('charts')
    )
  })

  describe('pie', () => {
    it.each(['pieChart', 'donutChart', 'treemap'])(
      '%s → pie',
      (type) => expect(getVisualCategory(type)).toBe('pie')
    )
  })

  describe('cards', () => {
    it.each(['cardVisual', 'card', 'kpi', 'gauge', 'textbox', 'scorecard', 'qnaVisual', 'aiNarratives',
             'shape', 'image', 'actionButton', 'bookmarkNavigator', 'pageNavigator', 'multiRowCard'])(
      '%s → cards',
      (type) => expect(getVisualCategory(type)).toBe('cards')
    )
  })

  describe('tables', () => {
    it.each(['tableEx', 'pivotTable', 'rdlVisual'])(
      '%s → tables',
      (type) => expect(getVisualCategory(type)).toBe('tables')
    )
  })

  describe('slicers', () => {
    it.each(['slicer', 'advancedSlicerVisual', 'textSlicer', 'listSlicer'])(
      '%s → slicers',
      (type) => expect(getVisualCategory(type)).toBe('slicers')
    )
  })

  describe('placeholder fallback', () => {
    it('returns placeholder for unknown type', () => {
      expect(getVisualCategory('someUnknownVisualType')).toBe('placeholder')
    })

    it('returns placeholder for PowerApps pattern', () => {
      expect(getVisualCategory('PowerApps_PBI_CV_abc123def456')).toBe('placeholder')
    })

    it('returns placeholder for FlowVisual pattern', () => {
      expect(getVisualCategory('FlowVisual_xyz789')).toBe('placeholder')
    })

    it('returns placeholder for empty string', () => {
      expect(getVisualCategory('')).toBe('placeholder')
    })
  })

  it('covers all 47 entries in VISUAL_TYPE_CATEGORY without placeholder', () => {
    const supportedTypes = Object.keys(VISUAL_TYPE_CATEGORY)
    expect(supportedTypes).toHaveLength(47)
    for (const type of supportedTypes) {
      expect(getVisualCategory(type)).not.toBe('placeholder')
    }
  })
})

describe('getVisualIcon', () => {
  it('returns a distinct (non-placeholder) component for every known type', () => {
    for (const type of Object.keys(VISUAL_TYPE_CATEGORY)) {
      const Icon = getVisualIcon(type)
      expect(Icon).not.toBeNull()
      expect(Icon).not.toBe(PLACEHOLDER_ICON)
    }
  })

  it('returns PLACEHOLDER_ICON for an unknown type', () => {
    expect(getVisualIcon('someUnknownType')).toBe(PLACEHOLDER_ICON)
  })

  it('returns PLACEHOLDER_ICON for empty string', () => {
    expect(getVisualIcon('')).toBe(PLACEHOLDER_ICON)
  })
})

it('VISUAL_TYPE_CATEGORY and VISUAL_DISPLAY_NAME contain the same keys', () => {
  expect(Object.keys(VISUAL_TYPE_CATEGORY).sort()).toEqual(Object.keys(VISUAL_DISPLAY_NAME).sort())
})

describe('getVisualDisplayName', () => {
  it('returns Col Chart for clusteredColumnChart', () => {
    expect(getVisualDisplayName('clusteredColumnChart')).toBe('Col Chart')
  })

  it('returns Matrix for pivotTable', () => {
    expect(getVisualDisplayName('pivotTable')).toBe('Matrix')
  })

  it('returns Button Slicer for advancedSlicerVisual', () => {
    expect(getVisualDisplayName('advancedSlicerVisual')).toBe('Button Slicer')
  })

  it('returns 100% Stacked Bar for hundredPercentStackedBarChart', () => {
    expect(getVisualDisplayName('hundredPercentStackedBarChart')).toBe('100% Stacked Bar')
  })

  it('returns 100% Stacked Column for hundredPercentStackedColumnChart', () => {
    expect(getVisualDisplayName('hundredPercentStackedColumnChart')).toBe('100% Stacked Column')
  })

  it('returns Stacked Area for stackedAreaChart', () => {
    expect(getVisualDisplayName('stackedAreaChart')).toBe('Stacked Area')
  })

  it('returns Ribbon for ribbonChart', () => {
    expect(getVisualDisplayName('ribbonChart')).toBe('Ribbon')
  })

  it('returns Filled Map for filledMap', () => {
    expect(getVisualDisplayName('filledMap')).toBe('Filled Map')
  })

  it('returns ArcGIS Map for esriVisual', () => {
    expect(getVisualDisplayName('esriVisual')).toBe('ArcGIS Map')
  })

  it('returns Decomposition Tree for decompositionTreeVisual', () => {
    expect(getVisualDisplayName('decompositionTreeVisual')).toBe('Decomposition Tree')
  })

  it('returns Text Box for textbox', () => {
    expect(getVisualDisplayName('textbox')).toBe('Text Box')
  })

  it('returns Key Influencers for keyDriversVisual', () => {
    expect(getVisualDisplayName('keyDriversVisual')).toBe('Key Influencers')
  })

  it('returns Goals for scorecard', () => {
    expect(getVisualDisplayName('scorecard')).toBe('Goals')
  })

  it('returns Q&A for qnaVisual', () => {
    expect(getVisualDisplayName('qnaVisual')).toBe('Q&A')
  })

  it('returns Smart Narrative for aiNarratives', () => {
    expect(getVisualDisplayName('aiNarratives')).toBe('Smart Narrative')
  })

  it('returns Paginated Report for rdlVisual', () => {
    expect(getVisualDisplayName('rdlVisual')).toBe('Paginated Report')
  })

  it('returns R Visual for scriptVisual', () => {
    expect(getVisualDisplayName('scriptVisual')).toBe('R Visual')
  })

  it('returns Bookmark Nav for bookmarkNavigator', () => {
    expect(getVisualDisplayName('bookmarkNavigator')).toBe('Bookmark Nav')
  })

  it('returns Multi-Row Card for multiRowCard', () => {
    expect(getVisualDisplayName('multiRowCard')).toBe('Multi-Row Card')
  })

  it('returns Power Apps for a PowerApps_PBI_CV_ GUID-suffixed type', () => {
    expect(getVisualDisplayName('PowerApps_PBI_CV_abc123def456')).toBe('Power Apps')
  })

  it('returns Power Automate for a FlowVisual_ GUID-suffixed type', () => {
    expect(getVisualDisplayName('FlowVisual_xyz789')).toBe('Power Automate')
  })

  it('returns Unknown Visual for any unrecognised type', () => {
    expect(getVisualDisplayName('notAVisualType')).toBe('Unknown Visual')
  })

  it('returns Unknown Visual for empty string', () => {
    expect(getVisualDisplayName('')).toBe('Unknown Visual')
  })

  it('covers all 47 entries in VISUAL_DISPLAY_NAME with correct values', () => {
    const mappedTypes = Object.keys(VISUAL_DISPLAY_NAME)
    expect(mappedTypes).toHaveLength(47)
    for (const type of mappedTypes) {
      expect(getVisualDisplayName(type)).toBe(VISUAL_DISPLAY_NAME[type])
    }
  })
})

describe('getVisualIcon — PowerApps / Power Automate GUID-suffixed prefixes', () => {
  it('returns a distinct, non-placeholder icon for a PowerApps_PBI_CV_ type', () => {
    const icon = getVisualIcon('PowerApps_PBI_CV_abc123def456')
    expect(icon).not.toBe(PLACEHOLDER_ICON)
  })

  it('returns a distinct, non-placeholder icon for a FlowVisual_ type', () => {
    const icon = getVisualIcon('FlowVisual_xyz789')
    expect(icon).not.toBe(PLACEHOLDER_ICON)
  })
})

describe('computeIconLayout', () => {
  it('drops the icon on very short utility elements (buttons, nav strips) — no room for icon + label', () => {
    // actionButton, bookmarkNavigator, pageNavigator, textbox — all real
    // Navigation & Utility page visuals, 39-52px tall on a 1280-wide canvas
    expect(computeIconLayout(0, 0, px(100.3), px(39.8))).toBeNull()   // actionButton
    expect(computeIconLayout(0, 0, px(439.7), px(51.4))).toBeNull()   // bookmarkNavigator
    expect(computeIconLayout(0, 0, px(999.8), px(50.1))).toBeNull()   // pageNavigator
    expect(computeIconLayout(0, 0, px(302.3), px(44.2))).toBeNull()   // textbox
  })

  it('shows a small icon on compact-but-not-tiny visuals (~90-100px tall)', () => {
    expect(computeIconLayout(0, 0, px(182.2), px(99.8))).not.toBeNull()  // scriptVisual
    expect(computeIconLayout(0, 0, px(130.1), px(93.3))).not.toBeNull()  // pythonVisual
  })

  it('shows a comfortably-sized icon on normal-sized visuals (~150px tall)', () => {
    const layout = computeIconLayout(0, 0, px(346.5), px(150.4))  // advancedSlicerVisual
    expect(layout).not.toBeNull()
    expect(layout!.iconSize).toBeGreaterThan(3)
  })

  it('centres the icon+label block vertically as one unit — not pinned to the top', () => {
    const y = 0, h = 40
    const layout = computeIconLayout(0, y, 40, h)!
    const gapAbove = layout.iconY - y
    const gapBelow = (y + h) - layout.blockBottom
    expect(gapAbove).toBeCloseTo(gapBelow, 5)
  })

  it('returns null once a card is too small in either dimension for a meaningful icon', () => {
    expect(computeIconLayout(0, 0, 2, 2)).toBeNull()
  })
})
