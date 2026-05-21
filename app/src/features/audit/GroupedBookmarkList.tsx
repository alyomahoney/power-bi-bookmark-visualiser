import React from 'react'
import type { Bookmark } from '@/types/audit'
import { BookmarkListItem } from './BookmarkListItem'

interface GroupedBookmarkListProps {
  allVisualsBookmarks: Bookmark[]
  selectedVisualsBookmarks: Bookmark[]
  toggleKindMap: Map<string, 'pair' | 'set'>
  selectedBookmarkId: string | null
  rovingIndex: number
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  rovingIndexRef: React.MutableRefObject<number>
  setRovingIndex: (i: number) => void
  selectBookmark: (id: string | null) => void
}

export function GroupedBookmarkList({
  allVisualsBookmarks,
  selectedVisualsBookmarks,
  toggleKindMap,
  selectedBookmarkId,
  rovingIndex,
  itemRefs,
  rovingIndexRef,
  setRovingIndex,
  selectBookmark,
}: GroupedBookmarkListProps) {
  return (
    <>
      {allVisualsBookmarks.length > 0 && (
        <div role="group" aria-label="All Visuals">
          <div role="presentation" className="px-3 pt-2 pb-1 text-xs font-medium text-text-muted">All Visuals</div>
          {allVisualsBookmarks.map((bookmark, i) => (
            <BookmarkListItem
              key={bookmark.id}
              ref={(el) => { itemRefs.current[i] = el }}
              bookmark={bookmark}
              toggleKind={toggleKindMap.get(bookmark.id)}
              isSelected={selectedBookmarkId === bookmark.id}
              tabIndex={rovingIndex === i ? 0 : -1}
              onClick={() => {
                setRovingIndex(i)
                rovingIndexRef.current = i
                selectBookmark(selectedBookmarkId === bookmark.id ? null : bookmark.id)
              }}
            />
          ))}
        </div>
      )}
      {selectedVisualsBookmarks.length > 0 && (
        <div role="group" aria-label="Selected Visuals">
          <div role="presentation" className="px-3 pt-2 pb-1 text-xs font-medium text-text-muted">Selected Visuals</div>
          {selectedVisualsBookmarks.map((bookmark, j) => {
            const i = allVisualsBookmarks.length + j
            return (
              <BookmarkListItem
                key={bookmark.id}
                ref={(el) => { itemRefs.current[i] = el }}
                bookmark={bookmark}
                toggleKind={toggleKindMap.get(bookmark.id)}
                isSelected={selectedBookmarkId === bookmark.id}
                tabIndex={rovingIndex === i ? 0 : -1}
                onClick={() => {
                  setRovingIndex(i)
                  rovingIndexRef.current = i
                  selectBookmark(selectedBookmarkId === bookmark.id ? null : bookmark.id)
                }}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
