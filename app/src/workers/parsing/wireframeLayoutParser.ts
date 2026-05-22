import type { PageLayout, VisualElement } from '../../types/audit'
import type { FileEntry } from '../../types/worker'

interface RawPagesJson {
  pageOrder?: string[]
  activePageName?: string
}

interface RawPageJson {
  name: string
  displayName?: string
  width?: number
  height?: number
}

interface RawVisualJson {
  name: string
  position?: { x?: number; y?: number; width?: number; height?: number; tabOrder?: number }
  visual?: { visualType?: string }
  isHidden?: boolean
}

async function parseSinglePage(
  pageEntryMap: Map<string, FileEntry>,
  visualEntryMap: Map<string, FileEntry[]>,
  pageId: string,
): Promise<PageLayout | undefined> {
  try {
    const pageEntry = pageEntryMap.get(pageId)
    if (!pageEntry) return undefined

    const pageJson = JSON.parse(await pageEntry.file.text()) as RawPageJson

    const visualEntries = visualEntryMap.get(pageId) ?? []

    const visuals: VisualElement[] = []
    for (const ve of visualEntries) {
      try {
        const raw = JSON.parse(await ve.file.text()) as RawVisualJson
        if (raw.isHidden === true) continue
        visuals.push({
          id: raw.name,
          visualType: raw.visual?.visualType ?? 'unknown',
          position: {
            x: raw.position?.x ?? 0,
            y: raw.position?.y ?? 0,
            width: raw.position?.width ?? 0,
            height: raw.position?.height ?? 0,
            tabOrder: raw.position?.tabOrder,
          },
        })
      } catch {
        // skip malformed visual.json; continue parsing remaining visuals
      }
    }

    visuals.sort((a, b) => {
      if (a.position.tabOrder === undefined && b.position.tabOrder === undefined) return 0
      if (a.position.tabOrder === undefined) return 1
      if (b.position.tabOrder === undefined) return -1
      return a.position.tabOrder - b.position.tabOrder
    })

    return {
      pageId: pageJson.name,
      pageDisplayName: pageJson.displayName ?? pageJson.name,
      canvasWidth: Math.max(pageJson.width ?? 1280, 1),
      canvasHeight: Math.max(pageJson.height ?? 720, 1),
      visuals,
    }
  } catch {
    return undefined
  }
}

export async function parsePages(entries: FileEntry[]): Promise<{ pages: PageLayout[]; activePageId: string }> {
  try {
    const pagesEntry = entries.find(e => e.path.endsWith('pages/pages.json'))
    if (!pagesEntry) return { pages: [], activePageId: '' }

    const pagesJson = JSON.parse(await pagesEntry.file.text()) as RawPagesJson
    const pageOrder = pagesJson.pageOrder ?? []
    const activePageId = pagesJson.activePageName ?? ''

    const pageEntryMap = new Map<string, FileEntry>()
    const visualEntryMap = new Map<string, FileEntry[]>()
    for (const e of entries) {
      const pageMatch = e.path.match(/\/([^/]+)\/page\.json$/)
      if (pageMatch) {
        pageEntryMap.set(pageMatch[1], e)
        continue
      }
      const visualMatch = e.path.match(/\/([^/]+)\/visuals\/[^/]+\/visual\.json$/)
      if (visualMatch) {
        const arr = visualEntryMap.get(visualMatch[1])
        if (arr) arr.push(e)
        else visualEntryMap.set(visualMatch[1], [e])
      }
    }

    const settled = await Promise.all(pageOrder.map(id => parseSinglePage(pageEntryMap, visualEntryMap, id)))
    const pages = settled.filter((p): p is PageLayout => p !== undefined)

    return { pages, activePageId }
  } catch {
    return { pages: [], activePageId: '' }
  }
}
