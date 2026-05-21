import type { Bookmark, BookmarkType } from '@/types/audit'

interface BookmarkBuilder {
  withId: (id: string) => BookmarkBuilder
  withName: (name: string) => BookmarkBuilder
  withType: (type: BookmarkType) => BookmarkBuilder
  withAffectedVisualIds: (ids: string[]) => BookmarkBuilder
  withHiddenVisualIds: (ids: string[]) => BookmarkBuilder
  withSuppressDisplay: (value: boolean) => BookmarkBuilder
  withApplyOnlyToTargetVisuals: (value: boolean) => BookmarkBuilder
  withFilterState: (state: unknown) => BookmarkBuilder
  withRawPayload: (payload: Bookmark['rawPayload']) => BookmarkBuilder
  build: () => Bookmark
}

export function buildBookmark(): BookmarkBuilder {
  const bookmark: Bookmark = {
    id: 'bk-test-001',
    name: 'Test Bookmark',
    type: 'data' as BookmarkType,
    affectedVisualIds: [],
    hiddenVisualIds: [],
    suppressDisplay: false,
    applyOnlyToTargetVisuals: false,
    filterState: null,
    rawPayload: { options: {}, explorationState: null },
  }

  const builder: BookmarkBuilder = {
    withId: (id) => { bookmark.id = id; return builder },
    withName: (name) => { bookmark.name = name; return builder },
    withType: (type) => { bookmark.type = type; return builder },
    withAffectedVisualIds: (ids) => { bookmark.affectedVisualIds = ids; return builder },
    withHiddenVisualIds: (ids) => { bookmark.hiddenVisualIds = ids; return builder },
    withSuppressDisplay: (value) => { bookmark.suppressDisplay = value; return builder },
    withApplyOnlyToTargetVisuals: (value) => { bookmark.applyOnlyToTargetVisuals = value; return builder },
    withFilterState: (state) => { bookmark.filterState = state; return builder },
    withRawPayload: (payload) => { bookmark.rawPayload = payload; return builder },
    build: () => structuredClone(bookmark),
  }

  return builder
}
