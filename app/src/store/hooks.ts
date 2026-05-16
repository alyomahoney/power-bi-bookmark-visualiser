import { useUiStore } from '@/store/uiStore'
import { useAuditStore } from '@/store/auditStore'
import { useFilterStore } from '@/store/filterStore'
import { useDemoStore } from '@/store/demoStore'

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

export function useSelectedVisualIds() {
  return useFilterStore((state) => state.selectedVisualIds)
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
