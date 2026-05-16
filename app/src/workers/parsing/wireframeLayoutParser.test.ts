import { describe, it, expect } from 'vitest'
import { parsePageLayout } from './wireframeLayoutParser'
import type { FileEntry } from '../../types/worker'

function makeEntry(relativePath: string, content: string): FileEntry {
  return {
    file: new File([content], relativePath.split('/').pop()!, { type: 'application/json' }),
    path: relativePath,
  }
}

const PAGES_JSON = JSON.stringify({
  pageOrder: ['pg-001'],
  activePageName: 'pg-001',
})

const PAGE_JSON = JSON.stringify({
  name: 'pg-001',
  displayName: 'Sales Overview',
  width: 1280,
  height: 720,
})

function makeVisualJson(id: string, type: string, hidden = false) {
  return JSON.stringify({
    name: id,
    position: { x: 100, y: 100, width: 200, height: 150, tabOrder: 1 },
    visual: { visualType: type },
    ...(hidden ? { isHidden: true } : {}),
  })
}

describe('parsePageLayout', () => {
  it('returns undefined when pages.json is missing', async () => {
    const result = await parsePageLayout([])
    expect(result).toBeUndefined()
  })

  it('returns undefined when page.json is missing', async () => {
    const entries = [makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON)]
    const result = await parsePageLayout(entries)
    expect(result).toBeUndefined()
  })

  it('parses canvas dimensions from page.json top-level width/height', async () => {
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
    ]
    const result = await parsePageLayout(entries)
    expect(result?.canvasWidth).toBe(1280)
    expect(result?.canvasHeight).toBe(720)
  })

  it('filters out visuals with isHidden: true', async () => {
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
      makeEntry('report.Report/definition/pages/pg-001/visuals/vis-001/visual.json',
        makeVisualJson('vis-001', 'slicer', false)),
      makeEntry('report.Report/definition/pages/pg-001/visuals/vis-002/visual.json',
        makeVisualJson('vis-002', 'cardVisual', true)),
    ]
    const result = await parsePageLayout(entries)
    expect(result?.visuals).toHaveLength(1)
    expect(result?.visuals[0].id).toBe('vis-001')
  })

  it('parses visual position and type correctly', async () => {
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
      makeEntry('report.Report/definition/pages/pg-001/visuals/vis-001/visual.json',
        makeVisualJson('vis-001', 'clusteredColumnChart')),
    ]
    const result = await parsePageLayout(entries)
    expect(result?.visuals[0]).toMatchObject({
      id: 'vis-001',
      visualType: 'clusteredColumnChart',
      position: { x: 100, y: 100, width: 200, height: 150 },
    })
  })

  it('returns pageDisplayName from page.json', async () => {
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
    ]
    const result = await parsePageLayout(entries)
    expect(result?.pageDisplayName).toBe('Sales Overview')
  })
})
