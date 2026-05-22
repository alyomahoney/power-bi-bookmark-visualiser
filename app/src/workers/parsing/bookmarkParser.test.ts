import { parseBookmarks } from './bookmarkParser'
import type { FileEntry } from '../../types/worker'

function makeBookmarksJsonEntry(items: unknown[], reportName = 'TestReport.Report'): FileEntry {
  return {
    file: new File([JSON.stringify({ items })], 'bookmarks.json', { type: 'application/json' }),
    path: `${reportName}/definition/bookmarks/bookmarks.json`,
  }
}

function makeBookmarkEntry(id: string, payload: unknown, reportName = 'TestReport.Report'): FileEntry {
  return {
    file: new File([JSON.stringify(payload)], `${id}.bookmark.json`, { type: 'application/json' }),
    path: `${reportName}/definition/bookmarks/${id}.bookmark.json`,
  }
}

const BK_ID = 'abc123def456abc123de'
const BK_ID_2 = 'zzzyyy111222333444xx'

const minimalPayload = {
  name: BK_ID,
  displayName: 'My Bookmark',
  options: {},
  explorationState: { version: '1.3', activeSection: 'page01', sections: {} },
}

describe('parseBookmarks', () => {
  describe('happy path', () => {
    it('returns empty bookmarks array when bookmarks.json has no items', async () => {
      const entries = [makeBookmarksJsonEntry([])]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toEqual([])
    })

    it('returns one Bookmark per ungrouped bookmark in items[]', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toHaveLength(1)
      expect(result.parseWarnings).toHaveLength(0)
    })

    it('returns Bookmarks in the order they appear in bookmarks.json', async () => {
      const payload2 = { ...minimalPayload, name: BK_ID_2, displayName: 'Second' }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }, { name: BK_ID_2 }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
        makeBookmarkEntry(BK_ID_2, payload2),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks[0].id).toBe(BK_ID)
      expect(result.bookmarks[1].id).toBe(BK_ID_2)
    })

    it('flattens grouped bookmarks — returns children, not the group header itself', async () => {
      const groupId = 'groupheader000000000'
      const entries = [
        makeBookmarksJsonEntry([
          { name: groupId, displayName: 'My Group', children: [BK_ID] },
        ]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toHaveLength(1)
      expect(result.bookmarks[0].id).toBe(BK_ID)
    })

    it('maps PBIR name → Bookmark.id and PBIR displayName → Bookmark.name', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].id).toBe(BK_ID)
      expect(bookmarks[0].name).toBe('My Bookmark')
      expect(bookmarks[0].type).toBe('mixed')
    })

    it('sets affectedVisualIds from targetVisualNames when applyOnlyToTargetVisuals is true', async () => {
      const payload = {
        ...minimalPayload,
        options: {
          applyOnlyToTargetVisuals: true,
          targetVisualNames: ['vis-aaa', 'vis-bbb'],
        },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].affectedVisualIds).toEqual(['vis-aaa', 'vis-bbb'])
    })

    it('sets affectedVisualIds to [] when applyOnlyToTargetVisuals is absent', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].affectedVisualIds).toEqual([])
    })

    it('sets affectedVisualIds to [] when applyOnlyToTargetVisuals is absent even if targetVisualNames is non-empty', async () => {
      const payload = {
        ...minimalPayload,
        options: { targetVisualNames: ['vis-aaa'] },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].affectedVisualIds).toEqual([])
    })

    it('stores explorationState as filterState', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].filterState).toEqual(minimalPayload.explorationState)
    })

    it('stores options and explorationState in rawPayload', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].rawPayload.options).toEqual({})
      expect(bookmarks[0].rawPayload.explorationState).toEqual(minimalPayload.explorationState)
    })
  })

  describe('partial-parse strategy', () => {
    it('returns empty bookmarks + one ParseWarning when bookmarks.json is not in entries[]', async () => {
      const result = await parseBookmarks([])
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe('bookmarks.json')
    })

    it('skips a bookmark and adds ParseWarning when its .bookmark.json file is not in entries[]', async () => {
      const entries = [makeBookmarksJsonEntry([{ name: BK_ID }])]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe(`${BK_ID}.bookmark.json`)
    })

    it('skips a bookmark and adds ParseWarning when its .bookmark.json contains malformed JSON', async () => {
      const malformedEntry: FileEntry = {
        file: new File(['not-valid-json'], `${BK_ID}.bookmark.json`),
        path: `TestReport.Report/definition/bookmarks/${BK_ID}.bookmark.json`,
      }
      const entries = [makeBookmarksJsonEntry([{ name: BK_ID }]), malformedEntry]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe(`${BK_ID}.bookmark.json`)
    })

    it('continues parsing remaining bookmarks after one fails to parse', async () => {
      const malformedEntry: FileEntry = {
        file: new File(['bad-json'], `${BK_ID}.bookmark.json`),
        path: `TestReport.Report/definition/bookmarks/${BK_ID}.bookmark.json`,
      }
      const payload2 = { ...minimalPayload, name: BK_ID_2, displayName: 'Second' }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }, { name: BK_ID_2 }]),
        malformedEntry,
        makeBookmarkEntry(BK_ID_2, payload2),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toHaveLength(1)
      expect(result.bookmarks[0].id).toBe(BK_ID_2)
      expect(result.parseWarnings).toHaveLength(1)
    })

    it('never throws — always resolves with { bookmarks, parseWarnings }', async () => {
      await expect(parseBookmarks([])).resolves.toMatchObject({
        bookmarks: expect.any(Array),
        parseWarnings: expect.any(Array),
      })
    })

    it('returns empty bookmarks + one ParseWarning when bookmarks.json contains malformed JSON', async () => {
      const malformedEntry: FileEntry = {
        file: new File(['not-valid-json'], 'bookmarks.json', { type: 'application/json' }),
        path: 'TestReport.Report/definition/bookmarks/bookmarks.json',
      }
      const result = await parseBookmarks([malformedEntry])
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe('bookmarks.json')
    })

    it('returns empty bookmarks + one ParseWarning when bookmarks.json contains non-object JSON', async () => {
      const nullEntry: FileEntry = {
        file: new File(['null'], 'bookmarks.json', { type: 'application/json' }),
        path: 'TestReport.Report/definition/bookmarks/bookmarks.json',
      }
      const result = await parseBookmarks([nullEntry])
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe('bookmarks.json')
    })

    it('skips a bookmark and emits a ParseWarning when its .bookmark.json is missing the name field', async () => {
      const missingName = { displayName: 'My Bookmark', options: {}, explorationState: null }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, missingName),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe(`${BK_ID}.bookmark.json`)
    })

    it('deduplicates duplicate bookmark IDs and emits a ParseWarning for each duplicate', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }, { name: BK_ID }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toHaveLength(1)
      expect(result.bookmarks[0].id).toBe(BK_ID)
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe(`${BK_ID}.bookmark.json`)
    })
  })

  describe('type classification integration', () => {
    it('assigns type "data" to a bookmark with suppressDisplay: true', async () => {
      const payload = { ...minimalPayload, options: { suppressDisplay: true } }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].type).toBe('data')
    })

    it('assigns type "display" to a bookmark with suppressData: true', async () => {
      const payload = { ...minimalPayload, options: { suppressData: true } }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].type).toBe('display')
    })
  })

  describe('hiddenVisualIds', () => {
    it('sets hiddenVisualIds from explorationState visualContainers with display.mode hidden', async () => {
      const explorationState = {
        sections: {
          'page-1': {
            visualContainers: {
              'vis-abc': { singleVisual: { display: { mode: 'hidden' } } },
              'vis-def': { singleVisual: { visualType: 'waterfallChart' } },
            },
          },
        },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, { name: BK_ID, displayName: 'Bookmark One', explorationState }),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].hiddenVisualIds).toEqual(['vis-abc'])
    })

    it('sets hiddenVisualIds to [] when explorationState is null', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, { name: BK_ID, displayName: 'Bookmark One', explorationState: undefined }),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].hiddenVisualIds).toEqual([])
    })
  })

  describe('suppressDisplay', () => {
    it('sets suppressDisplay to true when options.suppressDisplay is true', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, { name: BK_ID, displayName: 'Bookmark One', options: { suppressDisplay: true } }),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].suppressDisplay).toBe(true)
    })

    it('sets suppressDisplay to false when options.suppressDisplay is absent', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, { name: BK_ID, displayName: 'Bookmark One', options: {} }),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].suppressDisplay).toBe(false)
    })
  })

  describe('applyOnlyToTargetVisuals', () => {
    it('sets applyOnlyToTargetVisuals to true when options.applyOnlyToTargetVisuals is true', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, { name: BK_ID, displayName: 'Bookmark One', options: { applyOnlyToTargetVisuals: true, targetVisualNames: ['v1'] } }),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].applyOnlyToTargetVisuals).toBe(true)
    })

    it('sets applyOnlyToTargetVisuals to false when options.applyOnlyToTargetVisuals is absent', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, { name: BK_ID, displayName: 'Bookmark One', options: {} }),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].applyOnlyToTargetVisuals).toBe(false)
    })
  })

  describe('targetPageId', () => {
    it('populates targetPageId when explorationState.activeSection is set and suppressActiveSection is absent', async () => {
      const payload = {
        name: BK_ID,
        displayName: 'Page Nav Bookmark',
        options: {},
        explorationState: { activeSection: 'page-regional-breakdown', sections: {} },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].targetPageId).toBe('page-regional-breakdown')
    })

    it('sets targetPageId to undefined when suppressActiveSection is true', async () => {
      const payload = {
        name: BK_ID,
        displayName: 'Suppressed Nav',
        options: { suppressActiveSection: true },
        explorationState: { activeSection: 'page-regional-breakdown', sections: {} },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].targetPageId).toBeUndefined()
    })

    it('sets targetPageId to undefined when explorationState is null', async () => {
      const payload = {
        name: BK_ID,
        displayName: 'No Exploration',
        options: {},
        explorationState: null,
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].targetPageId).toBeUndefined()
    })

    it('sets targetPageId to undefined when explorationState.activeSection is an empty string', async () => {
      const payload = {
        name: BK_ID,
        displayName: 'Empty Section',
        options: {},
        explorationState: { activeSection: '', sections: {} },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const { bookmarks } = await parseBookmarks(entries)
      expect(bookmarks[0].targetPageId).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('treats an item with displayName but no children as an ungrouped bookmark and emits a ParseWarning', async () => {
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID, displayName: 'Ambiguous Item' }]),
        makeBookmarkEntry(BK_ID, minimalPayload),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toHaveLength(1)
      expect(result.bookmarks[0].id).toBe(BK_ID)
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe(BK_ID)
    })

    it('emits a ParseWarning when applyOnlyToTargetVisuals is true but targetVisualNames is absent, and still includes the bookmark', async () => {
      const payload = {
        ...minimalPayload,
        options: { applyOnlyToTargetVisuals: true },
      }
      const entries = [
        makeBookmarksJsonEntry([{ name: BK_ID }]),
        makeBookmarkEntry(BK_ID, payload),
      ]
      const result = await parseBookmarks(entries)
      expect(result.bookmarks).toHaveLength(1)
      expect(result.bookmarks[0].affectedVisualIds).toEqual([])
      expect(result.parseWarnings).toHaveLength(1)
      expect(result.parseWarnings[0].structureName).toBe(`${BK_ID}.bookmark.json`)
    })
  })
})
