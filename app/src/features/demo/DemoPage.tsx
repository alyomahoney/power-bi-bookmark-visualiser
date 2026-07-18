import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import {
  useAuditReport,
  useClearAudit,
  useSelectedBookmark,
  useSelectBookmark,
  useSearchQuery,
  useSetSearchQuery,
  useClearFilters,
  useSelectedTypes,
  useToggleType,
  useSelectedVisualIds,
  useToggleVisual,
  useClearVisualsForPage,
  useExitDemoMode,
  useLoadDemoReport,
  useSetSelectedPageId,
  useActivePageLayout,
  useEffectivePageId,
  useSelectBookmarkWithNavigation,
} from '@/store/hooks'
import { sessionCache } from '@/shared/utils/sessionCache'
import { typeHasAxis } from '@/shared/utils/bookmarkType'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { VisualLabelsToggle } from '@/shared/components/VisualLabelsToggle'
import { AppLogo } from '@/shared/components/AppLogo'
import { BookmarkDetail } from '@/features/audit/BookmarkDetail'
import { BookmarkSearchInput } from '@/features/audit/BookmarkSearchInput'
import { GroupedBookmarkList } from '@/features/audit/GroupedBookmarkList'
import { BookmarkTypeFilter } from '@/features/audit/BookmarkTypeFilter'
import { BookmarkVisualFilter } from '@/features/audit/BookmarkVisualFilter'
import { WireframeCanvas } from '@/features/wireframe/WireframeCanvas'
import { PageTabStrip } from '@/features/wireframe/PageTabStrip'

export default function DemoPage() {
  const loadDemoReport = useLoadDemoReport()
  const auditReport = useAuditReport()
  const clearAudit = useClearAudit()
  const navigate = useNavigate()
  const [rovingIndex, setRovingIndex] = useState(0)
  const rovingIndexRef = useRef(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const selectedBookmarkId = useSelectedBookmark()
  const selectBookmark = useSelectBookmark()
  const searchQuery = useSearchQuery()
  const setSearchQuery = useSetSearchQuery()
  const clearFilters = useClearFilters()
  const selectedTypes = useSelectedTypes()
  const toggleType = useToggleType()
  const exitDemoMode = useExitDemoMode()
  const effectivePageId = useEffectivePageId()
  const activePageLayout = useActivePageLayout()
  // Keys the per-page visual filter to the page actually rendered, not the raw
  // effectivePageId — they can diverge if it references a page that failed to
  // parse or was removed, in which case activePageLayout falls back to pages[0].
  const resolvedVisualFilterPageId = activePageLayout?.pageId ?? effectivePageId
  const selectedVisualIds = useSelectedVisualIds(resolvedVisualFilterPageId)
  const toggleVisualForPage = useToggleVisual()
  const toggleVisual = (id: string) => toggleVisualForPage(resolvedVisualFilterPageId, id)
  const clearVisualsForPage = useClearVisualsForPage()
  const clearVisualFilter = () => clearVisualsForPage(resolvedVisualFilterPageId)
  const setSelectedPageId = useSetSelectedPageId()

  useEffect(() => {
    loadDemoReport()
  }, [])

  useEffect(() => {
    setRovingIndex(0)
    rovingIndexRef.current = 0
  }, [auditReport])

  useEffect(() => {
    setRovingIndex(0)
    rovingIndexRef.current = 0
  }, [searchQuery])

  useEffect(() => {
    setRovingIndex(0)
    rovingIndexRef.current = 0
  }, [selectedTypes])

  useEffect(() => {
    setRovingIndex(0)
    rovingIndexRef.current = 0
  }, [selectedVisualIds])

  const toggleKindMap = useMemo((): Map<string, 'pair' | 'set'> => {
    const map = new Map<string, 'pair' | 'set'>()
    for (const group of auditReport?.toggleGroups ?? []) {
      for (const id of group.bookmarkIds) {
        map.set(id, group.kind)
      }
    }
    return map
  }, [auditReport?.toggleGroups])

  const filteredBookmarks = useMemo(() => {
    const bookmarks = auditReport?.bookmarks ?? []
    let result = bookmarks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(b => b.name.toLowerCase().includes(q))
    }
    if (selectedTypes.length > 0) {
      result = result.filter(b => selectedTypes.some(axis => typeHasAxis(b.type, axis)))
    }
    if (selectedVisualIds.length > 0) {
      result = result.filter(b => selectedVisualIds.some(id => b.affectedVisualIds.includes(id)))
    }
    return result
  }, [auditReport?.bookmarks, searchQuery, selectedTypes, selectedVisualIds])

  const handleSelectBookmark = useSelectBookmarkWithNavigation()

  if (!auditReport) return null

  const allVisualsBookmarks = filteredBookmarks.filter(b => !b.applyOnlyToTargetVisuals)
  const selectedVisualsBookmarks = filteredBookmarks.filter(b => b.applyOnlyToTargetVisuals)
  const renderedBookmarks = [...allVisualsBookmarks, ...selectedVisualsBookmarks]

  const selectedBookmark = auditReport.bookmarks.find(b => b.id === selectedBookmarkId) ?? null
  const visuals = activePageLayout?.visuals ?? []

  const handleUploadOwn = () => {
    exitDemoMode()
    selectBookmark(null)
    clearAudit()
    clearFilters()
    sessionCache.clear()
    navigate('/', { replace: true, state: { focusUpload: true } })
  }

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (renderedBookmarks.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(rovingIndexRef.current + 1, renderedBookmarks.length - 1)
      setRovingIndex(next)
      rovingIndexRef.current = next
      itemRefs.current[next]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(rovingIndexRef.current - 1, 0)
      setRovingIndex(prev)
      rovingIndexRef.current = prev
      itemRefs.current[prev]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      selectBookmark(null)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const current = rovingIndexRef.current
      if (current < 0 || current >= renderedBookmarks.length) return
      const focusedId = renderedBookmarks[current].id
      handleSelectBookmark(selectedBookmarkId === focusedId ? null : focusedId)
    }
  }

  return (
    // Bounds the flex tree to the real viewport so #bookmark-list scrolls internally
    // instead of the whole page growing and pushing the canvas out of view.
    <div className="h-dvh flex flex-col">
      <a
        href="#bookmark-list"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:bg-indigo-500 focus:rounded-md focus:shadow-lg"
      >
        Skip to bookmark list
      </a>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
        <h1><AppLogo /></h1>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400 bg-indigo-500/10 rounded-full px-2 py-0.5 shrink-0">
            Demo
          </span>
          <div className="flex flex-col gap-0.5 min-w-0 text-right">
            <span className="font-mono text-sm text-text-secondary break-words">
              {auditReport.filename ?? 'Unknown Report'}
            </span>
            <span className="text-text-muted text-xs">
              {auditReport.bookmarks.length} bookmarks
            </span>
          </div>
          <button
            onClick={handleUploadOwn}
            className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-md px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500"
          >
            Upload your own file
          </button>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <nav
          aria-label="Bookmark navigation"
          className="w-[220px] shrink-0 flex flex-col border-r border-border-subtle overflow-hidden"
        >
          <BookmarkSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
          <div className="px-3 py-2 border-b border-border-subtle flex items-center gap-2 shrink-0">
            <BookmarkTypeFilter selectedTypes={selectedTypes} onToggleType={toggleType} />
            {visuals.length > 0 && (
              <BookmarkVisualFilter
                visuals={visuals}
                selectedVisualIds={selectedVisualIds}
                onToggleVisual={toggleVisual}
                onClear={clearVisualFilter}
              />
            )}
            {(selectedTypes.length > 0 || selectedVisualIds.length > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs text-text-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Clear filters
              </button>
            )}
          </div>
          {(auditReport.parseWarnings?.length ?? 0) > 0 && (
            <div role="status" className="px-3 py-2 text-xs text-text-secondary border-b border-border-subtle">
              <span aria-hidden="true">⚠</span>{' '}Some bookmarks could not be fully parsed.
            </div>
          )}
          <div
            id="bookmark-list"
            tabIndex={-1}
            role="listbox"
            aria-label="Bookmark navigation"
            onKeyDown={handleListKeyDown}
            onFocus={(e) => {
              if (e.target === e.currentTarget) {
                rovingIndexRef.current = -1
                return
              }
              const index = itemRefs.current.findIndex((el) => el === e.target)
              if (index >= 0) {
                setRovingIndex(index)
                rovingIndexRef.current = index
              }
            }}
            className="flex-1 overflow-y-auto py-1"
          >
            {(searchQuery.trim() !== '' || selectedTypes.length > 0 || selectedVisualIds.length > 0) && filteredBookmarks.length === 0 ? (
              <div className="px-3 py-6 flex flex-col items-center gap-3">
                <Search className="w-5 h-5 text-text-muted" aria-hidden="true" />
                <p className="text-sm text-text-muted text-center">No bookmarks match these filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-text-secondary hover:text-text-primary border border-border-subtle rounded px-2 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <GroupedBookmarkList
                allVisualsBookmarks={allVisualsBookmarks}
                selectedVisualsBookmarks={selectedVisualsBookmarks}
                toggleKindMap={toggleKindMap}
                selectedBookmarkId={selectedBookmarkId}
                rovingIndex={rovingIndex}
                itemRefs={itemRefs}
                rovingIndexRef={rovingIndexRef}
                setRovingIndex={setRovingIndex}
                selectBookmark={handleSelectBookmark}
              />
            )}
          </div>
        </nav>
        <section
          aria-label="Report wireframe"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <PageTabStrip
            pages={auditReport.pages}
            selectedPageId={effectivePageId}
            onSelect={setSelectedPageId}
          />
          {activePageLayout ? (
            <>
              <div className="px-4 py-2 border-b border-border-subtle shrink-0 flex items-center justify-end gap-2">
                <VisualLabelsToggle />
                <button
                  type="button"
                  onClick={() => {
                    selectBookmark(null)
                    setSelectedPageId(auditReport.activePageId)
                  }}
                  disabled={!selectedBookmarkId}
                  className="text-xs font-medium text-text-secondary hover:text-text-primary border border-border-subtle rounded px-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reset to Default
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <WireframeCanvas
                  pages={auditReport.pages}
                  selectedPageId={effectivePageId}
                />
              </div>
              {selectedBookmark && (
                <div className="h-64 shrink-0 border-t border-border-subtle overflow-y-auto">
                  <BookmarkDetail bookmark={selectedBookmark} />
                </div>
              )}
            </>
          ) : selectedBookmark ? (
            <BookmarkDetail bookmark={selectedBookmark} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-text-muted">Select a bookmark to see details</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
