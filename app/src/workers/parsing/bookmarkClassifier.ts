import type { Bookmark, BookmarkType } from '@/types/audit'

export function classifyBookmarkType(bookmark: Pick<Bookmark, 'rawPayload'>): BookmarkType {
  const { options } = bookmark.rawPayload
  const hasData = options.suppressData !== true
  const hasDisplay = options.suppressDisplay !== true

  if (hasData && !hasDisplay) return 'data'
  if (!hasData && hasDisplay) return 'display'
  // Both captured (true mixed) AND both suppressed (useless — V2 adds 'useless' type)
  return 'mixed'
}
