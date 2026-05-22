export interface ParseWarning {
  structureName: string
  location: string
}

export interface BookmarkOptions {
  suppressData?: boolean
  suppressDisplay?: boolean
  suppressActiveSection?: boolean
  applyOnlyToTargetVisuals?: boolean
  targetVisualNames?: string[]
}

export type BookmarkType = 'display' | 'data' | 'mixed'

export interface Bookmark {
  id: string
  name: string
  type: BookmarkType
  affectedVisualIds: string[]
  hiddenVisualIds: string[]
  suppressDisplay: boolean
  applyOnlyToTargetVisuals: boolean
  filterState: unknown
  targetPageId?: string
  rawPayload: {
    options: BookmarkOptions
    explorationState: unknown
  }
}

export interface ToggleGroup {
  id: string
  kind: 'pair' | 'set'
  bookmarkIds: string[]
}

export interface VisualElement {
  id: string
  visualType: string
  position: { x: number; y: number; width: number; height: number; tabOrder?: number }
}

export interface PageLayout {
  pageId: string
  pageDisplayName: string
  canvasWidth: number
  canvasHeight: number
  visuals: VisualElement[]
}

export interface AuditReport {
  bookmarks: Bookmark[]
  filename?: string
  parseWarnings?: ParseWarning[]
  toggleGroups?: ToggleGroup[]
  pages: PageLayout[]
  activePageId: string
}
