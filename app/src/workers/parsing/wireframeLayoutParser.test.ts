import { describe, it, expect } from 'vitest'
import { parsePages } from './wireframeLayoutParser'
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

describe('parsePages', () => {
  it('returns empty pages and empty activePageId when pages.json is missing', async () => {
    const result = await parsePages([])
    expect(result.pages).toEqual([])
    expect(result.activePageId).toBe('')
  })

  it('returns empty pages when page.json is missing', async () => {
    const entries = [makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON)]
    const result = await parsePages(entries)
    expect(result.pages).toEqual([])
    expect(result.activePageId).toBe('pg-001')
  })

  it('parses canvas dimensions from page.json top-level width/height', async () => {
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
    ]
    const result = await parsePages(entries)
    expect(result.pages[0]?.canvasWidth).toBe(1280)
    expect(result.pages[0]?.canvasHeight).toBe(720)
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
    const result = await parsePages(entries)
    expect(result.pages[0]?.visuals).toHaveLength(1)
    expect(result.pages[0]?.visuals[0].id).toBe('vis-001')
  })

  it('parses visual position and type correctly', async () => {
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', PAGES_JSON),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
      makeEntry('report.Report/definition/pages/pg-001/visuals/vis-001/visual.json',
        makeVisualJson('vis-001', 'clusteredColumnChart')),
    ]
    const result = await parsePages(entries)
    expect(result.pages[0]?.visuals[0]).toMatchObject({
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
    const result = await parsePages(entries)
    expect(result.pages[0]?.pageDisplayName).toBe('Sales Overview')
  })

  it('returns two PageLayout objects in order when pageOrder has two pages', async () => {
    const twoPagePagesJson = JSON.stringify({
      pageOrder: ['pg-001', 'pg-002'],
      activePageName: 'pg-001',
    })
    const page2Json = JSON.stringify({
      name: 'pg-002',
      displayName: 'Regional Overview',
      width: 1920,
      height: 1080,
    })
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', twoPagePagesJson),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
      makeEntry('report.Report/definition/pages/pg-002/page.json', page2Json),
    ]
    const result = await parsePages(entries)
    expect(result.pages).toHaveLength(2)
    expect(result.pages[0].pageId).toBe('pg-001')
    expect(result.pages[1].pageId).toBe('pg-002')
    expect(result.pages[1].canvasWidth).toBe(1920)
    expect(result.activePageId).toBe('pg-001')
  })

  it('returns empty pages [] when pages.json is missing', async () => {
    const result = await parsePages([])
    expect(result.pages).toEqual([])
  })

  it('skips a page whose page.json is missing without crashing', async () => {
    const twoPagePagesJson = JSON.stringify({
      pageOrder: ['pg-001', 'pg-missing'],
      activePageName: 'pg-001',
    })
    const entries = [
      makeEntry('report.Report/definition/pages/pages.json', twoPagePagesJson),
      makeEntry('report.Report/definition/pages/pg-001/page.json', PAGE_JSON),
      // pg-missing has no page.json entry
    ]
    const result = await parsePages(entries)
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].pageId).toBe('pg-001')
  })
})
