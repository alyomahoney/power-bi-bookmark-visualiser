import type { Bookmark } from '@/types/audit'
import { detectTogglePairs } from './togglePairDetector'

function makeToggleBookmark(
  id: string,
  targetVisualIds: string[],
  hiddenVisualIds: string[],
): Bookmark {
  const visualContainers: Record<string, unknown> = {}
  for (const vid of hiddenVisualIds) {
    visualContainers[vid] = { singleVisual: { display: { mode: 'hidden' } } }
  }
  return {
    id,
    name: id,
    type: 'display',
    affectedVisualIds: targetVisualIds,
    hiddenVisualIds: hiddenVisualIds,
    suppressDisplay: false,
    applyOnlyToTargetVisuals: true,
    filterState: null,
    rawPayload: {
      options: {
        applyOnlyToTargetVisuals: true,
        suppressData: true,
        suppressActiveSection: true,
        targetVisualNames: targetVisualIds,
      },
      explorationState: {
        sections: { 'page-1': { visualContainers } },
      },
    },
  }
}

describe('detectTogglePairs', () => {
  describe('returns [] for empty or non-qualifying input', () => {
    it('returns [] for empty bookmark array', () => {
      expect(detectTogglePairs([])).toHaveLength(0)
    })

    it('returns [] when no bookmarks have applyOnlyToTargetVisuals: true', () => {
      const bk: Bookmark = {
        id: 'bk-1',
        name: 'bk-1',
        type: 'display',
        affectedVisualIds: ['visual-A'],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: false,
        filterState: null,
        rawPayload: {
          options: { suppressData: true, suppressActiveSection: true },
          explorationState: null,
        },
      }
      expect(detectTogglePairs([bk])).toHaveLength(0)
    })

    it('returns [] when bookmark has applyOnlyToTargetVisuals but suppressData is false', () => {
      const bk: Bookmark = {
        id: 'bk-1',
        name: 'bk-1',
        type: 'mixed',
        affectedVisualIds: ['visual-A'],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: true,
        filterState: null,
        rawPayload: {
          options: {
            applyOnlyToTargetVisuals: true,
            suppressData: false,
            suppressActiveSection: true,
          },
          explorationState: null,
        },
      }
      expect(detectTogglePairs([bk])).toHaveLength(0)
    })

    it('returns [] when bookmark has applyOnlyToTargetVisuals but suppressActiveSection is false', () => {
      const bk: Bookmark = {
        id: 'bk-1',
        name: 'bk-1',
        type: 'display',
        affectedVisualIds: ['visual-A'],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: true,
        filterState: null,
        rawPayload: {
          options: {
            applyOnlyToTargetVisuals: true,
            suppressData: true,
            suppressActiveSection: false,
          },
          explorationState: null,
        },
      }
      expect(detectTogglePairs([bk])).toHaveLength(0)
    })

    it('returns [] when bookmark has all flags set but affectedVisualIds is empty', () => {
      const bk: Bookmark = {
        id: 'bk-1',
        name: 'bk-1',
        type: 'display',
        affectedVisualIds: [],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: true,
        filterState: null,
        rawPayload: {
          options: {
            applyOnlyToTargetVisuals: true,
            suppressData: true,
            suppressActiveSection: true,
          },
          explorationState: null,
        },
      }
      expect(detectTogglePairs([bk])).toHaveLength(0)
    })

    it('returns [] when only one candidate exists for a target set (no pair possible)', () => {
      const bk = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      expect(detectTogglePairs([bk])).toHaveLength(0)
    })

    it('returns [] when two candidates target different visual sets', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-B'], [])
      expect(detectTogglePairs([bk1, bk2])).toHaveLength(0)
    })

    it('returns [] when two candidates target the same visuals but have identical display states', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], ['visual-A'])
      expect(detectTogglePairs([bk1, bk2])).toHaveLength(0)
    })

    it('returns [] when two candidates both leave all visuals visible (no hidden)', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], [])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      expect(detectTogglePairs([bk1, bk2])).toHaveLength(0)
    })

    it('returns [] when two candidates share visual targets but not all visuals have opposing states (strict inverse required)', () => {
      // bk1 hides visual-A and visual-B; bk2 shows visual-A but also hides visual-B — not a strict inverse
      const bk1 = makeToggleBookmark('bk-1', ['visual-A', 'visual-B'], ['visual-A', 'visual-B'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A', 'visual-B'], ['visual-B'])
      expect(detectTogglePairs([bk1, bk2])).toHaveLength(0)
    })
  })

  describe('toggle pair detection — kind: "pair"', () => {
    it('detects a pair when bk1 hides visual-A and bk2 shows visual-A (absent = visible)', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const groups = detectTogglePairs([bk1, bk2])
      expect(groups).toHaveLength(1)
    })

    it('assigns kind="pair" for a two-bookmark group', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const groups = detectTogglePairs([bk1, bk2])
      expect(groups[0].kind).toBe('pair')
    })

    it('includes both bookmark IDs in bookmarkIds', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const groups = detectTogglePairs([bk1, bk2])
      expect(groups[0].bookmarkIds).toContain('bk-1')
      expect(groups[0].bookmarkIds).toContain('bk-2')
      expect(groups[0].bookmarkIds).toHaveLength(2)
    })

    it('detects pair when every visual has opposing states across both members (strict inverse)', () => {
      // bk1: hides visual-A, shows visual-B
      // bk2: shows visual-A, hides visual-B
      const bk1 = makeToggleBookmark('bk-1', ['visual-A', 'visual-B'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A', 'visual-B'], ['visual-B'])
      const groups = detectTogglePairs([bk1, bk2])
      expect(groups).toHaveLength(1)
      expect(groups[0].kind).toBe('pair')
    })

    it('grouping is order-independent — same result with reversed input', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const forward = detectTogglePairs([bk1, bk2])
      const reversed = detectTogglePairs([bk2, bk1])
      expect(forward).toHaveLength(1)
      expect(reversed).toHaveLength(1)
      expect(forward[0].kind).toBe(reversed[0].kind)
    })
  })

  describe('toggle set detection — kind: "set"', () => {
    it('assigns kind="set" for a three-bookmark group targeting the same visuals', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A', 'visual-B', 'visual-C'], ['visual-B', 'visual-C'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A', 'visual-B', 'visual-C'], ['visual-A', 'visual-C'])
      const bk3 = makeToggleBookmark('bk-3', ['visual-A', 'visual-B', 'visual-C'], ['visual-A', 'visual-B'])
      const groups = detectTogglePairs([bk1, bk2, bk3])
      expect(groups).toHaveLength(1)
      expect(groups[0].kind).toBe('set')
    })

    it('includes all three bookmark IDs for a set', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A', 'visual-B', 'visual-C'], ['visual-B', 'visual-C'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A', 'visual-B', 'visual-C'], ['visual-A', 'visual-C'])
      const bk3 = makeToggleBookmark('bk-3', ['visual-A', 'visual-B', 'visual-C'], ['visual-A', 'visual-B'])
      const groups = detectTogglePairs([bk1, bk2, bk3])
      expect(groups[0].bookmarkIds).toContain('bk-1')
      expect(groups[0].bookmarkIds).toContain('bk-2')
      expect(groups[0].bookmarkIds).toContain('bk-3')
      expect(groups[0].bookmarkIds).toHaveLength(3)
    })
  })

  describe('group ID determinism', () => {
    it('group id is deterministic regardless of input order', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const forward = detectTogglePairs([bk1, bk2])
      const reversed = detectTogglePairs([bk2, bk1])
      expect(forward[0].id).toBe(reversed[0].id)
    })

    it('group id contains sorted bookmark IDs joined by dashes', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const groups = detectTogglePairs([bk1, bk2])
      expect(groups[0].id).toBe('toggle-bk-1-bk-2')
    })

    it('group id and bookmarkIds are stable when bookmark IDs do not sort in insertion order', () => {
      const bk1 = makeToggleBookmark('z-bm', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('a-bm', ['visual-A'], [])
      const forward = detectTogglePairs([bk1, bk2])
      const reversed = detectTogglePairs([bk2, bk1])
      expect(forward[0].id).toBe('toggle-a-bm-z-bm')
      expect(reversed[0].id).toBe('toggle-a-bm-z-bm')
      expect(forward[0].bookmarkIds).toEqual(['a-bm', 'z-bm'])
      expect(reversed[0].bookmarkIds).toEqual(['a-bm', 'z-bm'])
    })
  })

  describe('multiple groups', () => {
    it('returns two separate groups when two independent toggle pairs exist', () => {
      const pairA1 = makeToggleBookmark('a-1', ['visual-A'], ['visual-A'])
      const pairA2 = makeToggleBookmark('a-2', ['visual-A'], [])
      const pairB1 = makeToggleBookmark('b-1', ['visual-B'], ['visual-B'])
      const pairB2 = makeToggleBookmark('b-2', ['visual-B'], [])
      const groups = detectTogglePairs([pairA1, pairA2, pairB1, pairB2])
      expect(groups).toHaveLength(2)
    })

    it('does not mix bookmarks from different target sets', () => {
      const pairA1 = makeToggleBookmark('a-1', ['visual-A'], ['visual-A'])
      const pairA2 = makeToggleBookmark('a-2', ['visual-A'], [])
      const pairB1 = makeToggleBookmark('b-1', ['visual-B'], ['visual-B'])
      const pairB2 = makeToggleBookmark('b-2', ['visual-B'], [])
      const groups = detectTogglePairs([pairA1, pairA2, pairB1, pairB2])
      const groupIds = groups.map((g) => g.bookmarkIds.sort())
      expect(groupIds).toContainEqual(['a-1', 'a-2'])
      expect(groupIds).toContainEqual(['b-1', 'b-2'])
    })

    it('handles non-toggle bookmarks mixed in with toggle candidates', () => {
      const nonToggle: Bookmark = {
        id: 'nt-1',
        name: 'Non-toggle',
        type: 'data',
        affectedVisualIds: [],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: false,
        filterState: null,
        rawPayload: { options: {}, explorationState: null },
      }
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2 = makeToggleBookmark('bk-2', ['visual-A'], [])
      const groups = detectTogglePairs([nonToggle, bk1, bk2])
      expect(groups).toHaveLength(1)
      expect(groups[0].bookmarkIds).not.toContain('nt-1')
    })
  })

  describe('explorationState edge cases', () => {
    it('handles null explorationState gracefully (treats visual as visible)', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      const bk2: Bookmark = {
        id: 'bk-2',
        name: 'bk-2',
        type: 'display',
        affectedVisualIds: ['visual-A'],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: true,
        filterState: null,
        rawPayload: {
          options: {
            applyOnlyToTargetVisuals: true,
            suppressData: true,
            suppressActiveSection: true,
          },
          explorationState: null,
        },
      }
      const groups = detectTogglePairs([bk1, bk2])
      // bk2 null explorationState → visual-A is visible; bk1 hides it → valid pair
      expect(groups).toHaveLength(1)
      expect(groups[0].kind).toBe('pair')
    })

    it('searches across multiple sections (page IDs) for visual display mode', () => {
      const bk1 = makeToggleBookmark('bk-1', ['visual-A'], ['visual-A'])
      // bk2 has visual-A in a different page section
      const bk2: Bookmark = {
        id: 'bk-2',
        name: 'bk-2',
        type: 'display',
        affectedVisualIds: ['visual-A'],
        hiddenVisualIds: [],
        suppressDisplay: false,
        applyOnlyToTargetVisuals: true,
        filterState: null,
        rawPayload: {
          options: {
            applyOnlyToTargetVisuals: true,
            suppressData: true,
            suppressActiveSection: true,
          },
          explorationState: {
            sections: {
              'page-2': {
                visualContainers: {
                  'visual-A': { singleVisual: { display: { mode: 'hidden' } } },
                },
              },
            },
          },
        },
      }
      // Both hide visual-A → same state → not a pair
      const groups = detectTogglePairs([bk1, bk2])
      expect(groups).toHaveLength(0)
    })
  })
})
