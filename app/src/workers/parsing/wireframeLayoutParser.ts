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

export async function parsePageLayout(entries: FileEntry[]): Promise<PageLayout | undefined> {
  try {
    const pagesEntry = entries.find(e => e.path.endsWith('pages/pages.json'))
    if (!pagesEntry) return undefined

    const pagesJson = JSON.parse(await pagesEntry.file.text()) as RawPagesJson
    const activePageId = pagesJson.activePageName
    if (!activePageId) return undefined

    const pageEntry = entries.find(e =>
      e.path.includes(`/${activePageId}/`) &&
      e.path.endsWith('/page.json')
    )
    if (!pageEntry) return undefined

    const pageJson = JSON.parse(await pageEntry.file.text()) as RawPageJson

    const visualEntries = entries.filter(e =>
      e.path.includes(`/${activePageId}/visuals/`) &&
      e.path.endsWith('/visual.json'),
    )

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
