import type { Bookmark, BookmarkType } from '@/types/audit'

export function classifyBookmarkType(
  bookmark: Pick<Bookmark, 'rawPayload'>,
  targetPageId: string | undefined
): BookmarkType {
  const { options } = bookmark.rawPayload
  const hasData = options.suppressData !== true
  const hasDisplay = options.suppressDisplay !== true
  const hasPage = targetPageId !== undefined

  if (hasData && hasDisplay && hasPage) return 'all'
  if (hasData && hasDisplay) return 'data-display'
  if (hasData && hasPage) return 'data-page'
  if (hasDisplay && hasPage) return 'display-page'
  if (hasData) return 'data'
  if (hasDisplay) return 'display'
  if (hasPage) return 'page'
  return 'none'
}
