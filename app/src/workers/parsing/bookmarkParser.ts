import type { Bookmark, BookmarkOptions, ParseWarning } from '../../types/audit'
import type { FileEntry } from '../../types/worker'
import { classifyBookmarkType } from './bookmarkClassifier'

interface BookmarkGroupItem {
  name: string
  displayName?: string
  children?: string[]
}

interface RawBookmarkJson {
  name: string
  displayName: string
  options?: BookmarkOptions
  explorationState?: unknown
}

function parseHiddenVisualIds(explorationState: unknown): string[] {
  if (typeof explorationState !== 'object' || explorationState === null) return []
  const sections = (explorationState as Record<string, unknown>)['sections']
  if (typeof sections !== 'object' || sections === null) return []
  const hidden: string[] = []
  for (const pageState of Object.values(sections as Record<string, unknown>)) {
    if (typeof pageState !== 'object' || pageState === null) continue
    const containers = (pageState as Record<string, unknown>)['visualContainers']
    if (typeof containers !== 'object' || containers === null) continue
    for (const [visualId, containerState] of Object.entries(containers as Record<string, unknown>)) {
      if (typeof containerState !== 'object' || containerState === null) continue
      const sv = (containerState as Record<string, unknown>)['singleVisual']
      if (typeof sv !== 'object' || sv === null) continue
      const display = (sv as Record<string, unknown>)['display']
      if (typeof display !== 'object' || display === null) continue
      if ((display as Record<string, unknown>)['mode'] === 'hidden') hidden.push(visualId)
    }
  }
  return hidden
}

export async function parseBookmarks(
  entries: FileEntry[],
): Promise<{ bookmarks: Bookmark[]; parseWarnings: ParseWarning[] }> {
  const parseWarnings: ParseWarning[] = []

  const bookmarksJsonEntry = entries.find((e) =>
    e.path.endsWith('bookmarks/bookmarks.json'),
  )

  if (!bookmarksJsonEntry) {
    parseWarnings.push({
      structureName: 'bookmarks.json',
      location: 'definition/bookmarks/bookmarks.json',
    })
    return { bookmarks: [], parseWarnings }
  }

  let items: BookmarkGroupItem[]
  try {
    const bookmarksJsonText = await bookmarksJsonEntry.file.text()
    const bookmarksJson = JSON.parse(bookmarksJsonText) as { items: BookmarkGroupItem[] }
    items = bookmarksJson.items ?? []
  } catch {
    parseWarnings.push({
      structureName: 'bookmarks.json',
      location: 'definition/bookmarks/bookmarks.json',
    })
    return { bookmarks: [], parseWarnings }
  }

  const bookmarkIds: string[] = []
  for (const item of items) {
    if (item.children !== undefined && item.displayName !== undefined) {
      // Group item — flatten children as bookmark IDs; do NOT push item.name itself
      bookmarkIds.push(...item.children)
    } else if (item.children === undefined) {
      // Ungrouped bookmark — any item without children, with or without displayName.
      // An item that has displayName but no children is ambiguous PBIR structure; include it
      // as a bookmark and emit a warning so the caller can surface the anomaly.
      if (item.displayName !== undefined) {
        parseWarnings.push({
          structureName: item.name,
          location: 'definition/bookmarks/bookmarks.json',
        })
      }
      bookmarkIds.push(item.name)
    }
  }

  const seen = new Set<string>()
  const uniqueBookmarkIds: string[] = []
  for (const id of bookmarkIds) {
    if (seen.has(id)) {
      parseWarnings.push({
        structureName: `${id}.bookmark.json`,
        location: `definition/bookmarks/${id}.bookmark.json`,
      })
    } else {
      seen.add(id)
      uniqueBookmarkIds.push(id)
    }
  }

  const bookmarks: Bookmark[] = []

  for (const id of uniqueBookmarkIds) {
    const bookmarkEntry = entries.find((e) =>
      e.path.endsWith(`${id}.bookmark.json`),
    )

    if (!bookmarkEntry) {
      parseWarnings.push({
        structureName: `${id}.bookmark.json`,
        location: `definition/bookmarks/${id}.bookmark.json`,
      })
      continue
    }

    try {
      const text = await bookmarkEntry.file.text()
      const parsed = JSON.parse(text) as RawBookmarkJson

      // TypeScript casts don't validate at runtime; a valid JSON object missing name or
      // displayName would silently produce a Bookmark with id/name: undefined.
      if (typeof parsed.name !== 'string' || typeof parsed.displayName !== 'string') {
        parseWarnings.push({
          structureName: `${id}.bookmark.json`,
          location: `definition/bookmarks/${id}.bookmark.json`,
        })
        continue
      }

      const options: BookmarkOptions = parsed.options ?? {}

      let affectedVisualIds: string[]
      if (options.applyOnlyToTargetVisuals === true) {
        if (options.targetVisualNames === undefined) {
          // applyOnlyToTargetVisuals: true with no targetVisualNames is anomalous —
          // indistinguishable from "all visuals" without the warning.
          parseWarnings.push({
            structureName: `${id}.bookmark.json`,
            location: `definition/bookmarks/${id}.bookmark.json`,
          })
          affectedVisualIds = []
        } else {
          affectedVisualIds = options.targetVisualNames
        }
      } else {
        affectedVisualIds = []
      }

      const rawPayload = {
        options,
        explorationState: parsed.explorationState ?? null,
      }
      bookmarks.push({
        id: parsed.name,
        name: parsed.displayName,
        type: classifyBookmarkType({ rawPayload }),
        affectedVisualIds,
        hiddenVisualIds: parseHiddenVisualIds(parsed.explorationState ?? null),
        suppressDisplay: options.suppressDisplay === true,
        filterState: parsed.explorationState ?? null,
        rawPayload,
      })
    } catch {
      parseWarnings.push({
        structureName: `${id}.bookmark.json`,
        location: `definition/bookmarks/${id}.bookmark.json`,
      })
    }
  }

  return { bookmarks, parseWarnings }
}
