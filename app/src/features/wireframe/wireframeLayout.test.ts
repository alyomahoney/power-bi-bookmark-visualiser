import { describe, it, expect } from 'vitest'
import { normalisePosition, getCanvasDimensions, PBIR_DEFAULT_CANVAS } from './wireframeLayout'
import type { PageLayout } from '@/types/audit'

describe('normalisePosition', () => {
  it('normalises a position at origin to 0%', () => {
    const result = normalisePosition({ x: 0, y: 0, width: 0, height: 0 }, 1280)
    expect(result).toEqual({ xPct: 0, yPct: 0, wPct: 0, hPct: 0 })
  })

  it('normalises full canvas width to 100%, height relative to width', () => {
    const result = normalisePosition({ x: 0, y: 0, width: 1280, height: 720 }, 1280)
    expect(result).toEqual({ xPct: 0, yPct: 0, wPct: 100, hPct: 56.25 })
  })

  it('normalises a centred half-size visual, y/height scaled by canvas width', () => {
    const result = normalisePosition({ x: 320, y: 180, width: 640, height: 360 }, 1280)
    expect(result.xPct).toBeCloseTo(25)
    expect(result.yPct).toBeCloseTo(14.0625)
    expect(result.wPct).toBeCloseTo(50)
    expect(result.hPct).toBeCloseTo(28.125)
  })

  it('uses provided canvas width (not hardcoded default)', () => {
    const result = normalisePosition({ x: 512, y: 0, width: 512, height: 768 }, 1024)
    expect(result.xPct).toBeCloseTo(50)
    expect(result.wPct).toBeCloseTo(50)
    expect(result.hPct).toBeCloseTo(75)
  })
})

describe('getCanvasDimensions', () => {
  it('returns PBIR_DEFAULT_CANVAS when layout is undefined', () => {
    expect(getCanvasDimensions(undefined)).toEqual(PBIR_DEFAULT_CANVAS)
  })

  it('returns layout canvas dimensions when layout is provided', () => {
    const layout: PageLayout = {
      pageId: 'pg1', pageDisplayName: 'Overview',
      canvasWidth: 1920, canvasHeight: 1080,
      visuals: [],
    }
    expect(getCanvasDimensions(layout)).toEqual({ width: 1920, height: 1080 })
  })

  it('returns default width when canvasWidth is 0', () => {
    const layout: PageLayout = {
      pageId: 'pg1', pageDisplayName: 'Test',
      canvasWidth: 0, canvasHeight: 720,
      visuals: [],
    }
    expect(getCanvasDimensions(layout)).toEqual({ width: 1280, height: 720 })
  })

  it('returns default height when canvasHeight is 0', () => {
    const layout: PageLayout = {
      pageId: 'pg1', pageDisplayName: 'Test',
      canvasWidth: 1280, canvasHeight: 0,
      visuals: [],
    }
    expect(getCanvasDimensions(layout)).toEqual({ width: 1280, height: 720 })
  })

  it('returns default width when canvasWidth is negative', () => {
    const layout: PageLayout = {
      pageId: 'pg1', pageDisplayName: 'Test',
      canvasWidth: -1, canvasHeight: 720,
      visuals: [],
    }
    expect(getCanvasDimensions(layout)).toEqual({ width: 1280, height: 720 })
  })

  it('returns default height when canvasHeight is negative', () => {
    const layout: PageLayout = {
      pageId: 'pg1', pageDisplayName: 'Test',
      canvasWidth: 1280, canvasHeight: -1,
      visuals: [],
    }
    expect(getCanvasDimensions(layout)).toEqual({ width: 1280, height: 720 })
  })
})
