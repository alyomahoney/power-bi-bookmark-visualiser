import { useUiStore } from '@/store/uiStore'
import { useAuditStore } from '@/store/auditStore'
import { useFilterStore } from '@/store/filterStore'
import { useDemoStore } from '@/store/demoStore'

const EMPTY_VISUAL_IDS = Object.freeze([] as string[]) as string[]

export function useTheme() {
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  return { theme, toggleTheme }
}

export function useAuditReport() {
  return useAuditStore((state) => state.auditReport)
}

export function useSetAuditReport() {
  return useAuditStore((state) => state.setAuditReport)
}

export function useClearAudit() {
  return useAuditStore((state) => state.clearAudit)
}

export function useSelectedPageId() {
  return useAuditStore((state) => state.selectedPageId)
}

export function useSetSelectedPageId() {
  return useAuditStore((state) => state.setSelectedPageId)
}

export function useActivePageLayout() {
  return useAuditStore((state) => {
    if (!state.auditReport) return undefined
    const id = state.selectedPageId ?? state.auditReport.activePageId
    return state.auditReport.pages.find(p => p.pageId === id) ?? state.auditReport.pages[0]
  })
}

export function useParseError() {
  return useUiStore((state) => state.parseError)
}

export function useClearParseError() {
  return useUiStore((state) => state.clearParseError)
}

export function useIsParsing() {
  return useUiStore((state) => state.isParsing)
}

export function useSetIsParsing() {
  return useUiStore((state) => state.setIsParsing)
}

export function useParseProgressStep() {
  return useUiStore((state) => state.parseProgressStep)
}

export function useSetParseProgressStep() {
  return useUiStore((state) => state.setParseProgressStep)
}

export function useSelectedBookmark() {
  return useUiStore((state) => state.selectedBookmarkId)
}

export function useSelectBookmark() {
  return useUiStore((state) => state.selectBookmark)
}

export function useSearchQuery() {
  return useFilterStore((state) => state.searchQuery)
}

export function useSetSearchQuery() {
  return useFilterStore((state) => state.setSearchQuery)
}

export function useClearFilters() {
  return useFilterStore((state) => state.clearFilters)
}

export function useSelectedTypes() {
  return useFilterStore((state) => state.selectedTypes)
}

export function useToggleType() {
  return useFilterStore((state) => state.toggleType)
}

export function useSelectedVisualIds(pageId: string) {
  return useFilterStore((state) => state.selectedVisualIdsByPage[pageId] ?? EMPTY_VISUAL_IDS)
}

export function useToggleVisual() {
  return useFilterStore((state) => state.toggleVisual)
}

export function useDemoMode() {
  return useDemoStore((state) => state.isDemoMode)
}

export function useLoadDemoReport() {
  return useDemoStore((state) => state.loadDemoReport)
}

export function useExitDemoMode() {
  return useDemoStore((state) => state.exitDemoMode)
}

export function useEffectivePageId(): string {
  return useAuditStore((state) => state.selectedPageId ?? state.auditReport?.activePageId ?? '')
}

export function useSelectBookmarkWithNavigation() {
  const auditReport = useAuditReport()
  const selectBookmark = useSelectBookmark()
  const setSelectedPageId = useSetSelectedPageId()
  return (id: string | null) => {
    if (id !== null) {
      const bookmark = auditReport?.bookmarks.find(b => b.id === id)
      if (bookmark?.targetPageId) {
        setSelectedPageId(bookmark.targetPageId)
      }
    }
    selectBookmark(id)
  }
}
