import { describe, it, expect } from 'vitest'
import {
  getVisualCategory,
  getVisualDisplayName,
  getVisualIcon,
  VISUAL_TYPE_CATEGORY,
  VISUAL_DISPLAY_NAME,
  PLACEHOLDER_ICON,
} from './visualTypes'

describe('getVisualCategory', () => {
  describe('charts', () => {
    it.each(['clusteredColumnChart', 'columnChart', 'clusteredBarChart', 'barChart',
             'lineChart', 'areaChart', 'waterfallChart', 'funnel', 'scatterChart',
             'hundredPercentStackedBarChart', 'hundredPercentStackedColumnChart',
             'stackedAreaChart', 'ribbonChart', 'map', 'filledMap', 'azureMap',
             'esriVisual', 'decompositionTreeVisual'])(
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
    it.each(['cardVisual', 'card', 'kpi', 'gauge', 'textbox'])(
      '%s → cards',
      (type) => expect(getVisualCategory(type)).toBe('cards')
    )
  })

  describe('tables', () => {
    it.each(['tableEx', 'pivotTable'])(
      '%s → tables',
      (type) => expect(getVisualCategory(type)).toBe('tables')
    )
  })

  describe('slicers', () => {
    it.each(['slicer', 'advancedSlicerVisual'])(
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

  it('covers all 30 entries in VISUAL_TYPE_CATEGORY without placeholder', () => {
    const supportedTypes = Object.keys(VISUAL_TYPE_CATEGORY)
    expect(supportedTypes).toHaveLength(30)
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

  it('returns Unknown Visual for any unrecognised type', () => {
    expect(getVisualDisplayName('notAVisualType')).toBe('Unknown Visual')
  })

  it('returns Unknown Visual for empty string', () => {
    expect(getVisualDisplayName('')).toBe('Unknown Visual')
  })

  it('covers all 30 entries in VISUAL_DISPLAY_NAME with correct values', () => {
    const mappedTypes = Object.keys(VISUAL_DISPLAY_NAME)
    expect(mappedTypes).toHaveLength(30)
    for (const type of mappedTypes) {
      expect(getVisualDisplayName(type)).toBe(VISUAL_DISPLAY_NAME[type])
    }
  })
})
