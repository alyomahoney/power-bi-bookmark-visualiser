import { describe, it, expect } from 'vitest'
import {
  getVisualCategory,
  getVisualDisplayName,
  VISUAL_TYPE_CATEGORY,
  VISUAL_DISPLAY_NAME,
} from './visualTypes'

describe('getVisualCategory', () => {
  describe('charts', () => {
    it.each(['clusteredColumnChart', 'columnChart', 'clusteredBarChart', 'barChart',
             'lineChart', 'areaChart', 'waterfallChart', 'funnel', 'scatterChart'])(
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
    it.each(['cardVisual', 'card', 'kpi', 'gauge'])(
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

  it('covers all 20 entries in VISUAL_TYPE_CATEGORY without placeholder', () => {
    const supportedTypes = Object.keys(VISUAL_TYPE_CATEGORY)
    expect(supportedTypes).toHaveLength(20)
    for (const type of supportedTypes) {
      expect(getVisualCategory(type)).not.toBe('placeholder')
    }
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

  it('returns Unknown Visual for any unrecognised type', () => {
    expect(getVisualDisplayName('notAVisualType')).toBe('Unknown Visual')
  })

  it('returns Unknown Visual for empty string', () => {
    expect(getVisualDisplayName('')).toBe('Unknown Visual')
  })

  it('covers all 20 entries in VISUAL_DISPLAY_NAME with correct values', () => {
    const mappedTypes = Object.keys(VISUAL_DISPLAY_NAME)
    expect(mappedTypes).toHaveLength(20)
    for (const type of mappedTypes) {
      expect(getVisualDisplayName(type)).toBe(VISUAL_DISPLAY_NAME[type])
    }
  })
})
