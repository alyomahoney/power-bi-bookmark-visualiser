import type { Bookmark, ToggleGroup } from '../../types/audit'

function isVisualHiddenInBookmark(explorationState: unknown, visualId: string): boolean {
  if (typeof explorationState !== 'object' || explorationState === null) return false
  const sections = (explorationState as Record<string, unknown>)['sections']
  if (typeof sections !== 'object' || sections === null) return false
  for (const pageId of Object.keys(sections as object)) {
    const page = (sections as Record<string, unknown>)[pageId]
    if (typeof page !== 'object' || page === null) continue
    const visualContainers = (page as Record<string, unknown>)['visualContainers']
    if (typeof visualContainers !== 'object' || visualContainers === null) continue
    const visual = (visualContainers as Record<string, unknown>)[visualId]
    if (typeof visual !== 'object' || visual === null) continue
    const singleVisual = (visual as Record<string, unknown>)['singleVisual']
    if (typeof singleVisual !== 'object' || singleVisual === null) continue
    const display = (singleVisual as Record<string, unknown>)['display']
    if (typeof display !== 'object' || display === null) return false
    return (display as Record<string, unknown>)['mode'] === 'hidden'
  }
  return false
}

export function detectTogglePairs(bookmarks: Bookmark[]): ToggleGroup[] {
  const candidates = bookmarks.filter(
    (bk) =>
      bk.rawPayload.options.applyOnlyToTargetVisuals === true &&
      bk.rawPayload.options.suppressData === true &&
      bk.rawPayload.options.suppressActiveSection === true &&
      bk.affectedVisualIds.length > 0,
  )

  const groups = new Map<string, Bookmark[]>()
  for (const bk of candidates) {
    const key = bk.affectedVisualIds.slice().sort().join(',')
    const existing = groups.get(key)
    if (existing) {
      existing.push(bk)
    } else {
      groups.set(key, [bk])
    }
  }

  const result: ToggleGroup[] = []

  for (const groupMembers of groups.values()) {
    if (groupMembers.length < 2) continue

    const visualIds = groupMembers[0].affectedVisualIds
    const kind: 'pair' | 'set' = groupMembers.length === 2 ? 'pair' : 'set'

    if (kind === 'pair') {
      // Strict inverse: every visual must have opposing states between the two members
      const isStrictInverse = visualIds.every((visualId) => {
        const firstHidden = isVisualHiddenInBookmark(
          groupMembers[0].rawPayload.explorationState,
          visualId,
        )
        const secondHidden = isVisualHiddenInBookmark(
          groupMembers[1].rawPayload.explorationState,
          visualId,
        )
        return firstHidden !== secondHidden
      })
      if (!isStrictInverse) continue
    } else {
      // Set detection: at least one visual must have varying states across members
      let hasVariation = false
      for (const visualId of visualIds) {
        const firstHidden = isVisualHiddenInBookmark(
          groupMembers[0].rawPayload.explorationState,
          visualId,
        )
        for (let i = 1; i < groupMembers.length; i++) {
          if (
            isVisualHiddenInBookmark(groupMembers[i].rawPayload.explorationState, visualId) !==
            firstHidden
          ) {
            hasVariation = true
            break
          }
        }
        if (hasVariation) break
      }
      if (!hasVariation) continue
    }

    const sortedIds = groupMembers.map((bk) => bk.id).sort()

    result.push({
      id: `toggle-${sortedIds.join('-')}`,
      kind,
      bookmarkIds: sortedIds,
    })
  }

  return result
}
