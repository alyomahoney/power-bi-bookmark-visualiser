import type { Bookmark, BookmarkOptions, BookmarkType } from '@/types/audit'
import { classifyBookmarkType } from './bookmarkClassifier'

function makeInput(options: BookmarkOptions): Pick<Bookmark, 'rawPayload'> {
  return { rawPayload: { options, explorationState: null } }
}

describe('classifyBookmarkType', () => {
  describe('returns "mixed" when both data and display are captured', () => {
    it('returns "mixed" for an empty options object (all aspects captured)', () => {
      expect(classifyBookmarkType(makeInput({}))).toBe<BookmarkType>('mixed')
    })

    it('returns "mixed" when suppressActiveSection is true but data and display flags are absent', () => {
      expect(classifyBookmarkType(makeInput({ suppressActiveSection: true }))).toBe<BookmarkType>('mixed')
    })

    it('returns "mixed" when applyOnlyToTargetVisuals is true but data and display flags are absent', () => {
      expect(classifyBookmarkType(makeInput({ applyOnlyToTargetVisuals: true }))).toBe<BookmarkType>('mixed')
    })

    it('returns "mixed" when suppressData and suppressDisplay are explicitly false', () => {
      expect(classifyBookmarkType(makeInput({ suppressData: false, suppressDisplay: false }))).toBe<BookmarkType>('mixed')
    })
  })

  describe('returns "data" when display is suppressed but data is captured', () => {
    it('returns "data" when suppressDisplay is true and suppressData is absent', () => {
      expect(classifyBookmarkType(makeInput({ suppressDisplay: true }))).toBe<BookmarkType>('data')
    })

    it('returns "data" when suppressDisplay is true and suppressData is explicitly false', () => {
      expect(classifyBookmarkType(makeInput({ suppressDisplay: true, suppressData: false }))).toBe<BookmarkType>('data')
    })
  })

  describe('returns "display" when data is suppressed but display is captured', () => {
    it('returns "display" when suppressData is true and suppressDisplay is absent', () => {
      expect(classifyBookmarkType(makeInput({ suppressData: true }))).toBe<BookmarkType>('display')
    })

    it('returns "display" when suppressData is true and suppressDisplay is explicitly false', () => {
      expect(classifyBookmarkType(makeInput({ suppressData: true, suppressDisplay: false }))).toBe<BookmarkType>('display')
    })
  })

  describe('edge cases', () => {
    it('returns "mixed" when both suppressData and suppressDisplay are true (useless bookmark)', () => {
      expect(classifyBookmarkType(makeInput({ suppressData: true, suppressDisplay: true }))).toBe<BookmarkType>('mixed')
    })

    it('classification is not affected by suppressActiveSection value', () => {
      expect(classifyBookmarkType(makeInput({ suppressDisplay: true, suppressActiveSection: true }))).toBe<BookmarkType>('data')
      expect(classifyBookmarkType(makeInput({ suppressDisplay: true, suppressActiveSection: false }))).toBe<BookmarkType>('data')
    })

    it('classification is not affected by applyOnlyToTargetVisuals value', () => {
      expect(classifyBookmarkType(makeInput({ suppressData: true, applyOnlyToTargetVisuals: true }))).toBe<BookmarkType>('display')
      expect(classifyBookmarkType(makeInput({ suppressData: true, applyOnlyToTargetVisuals: false }))).toBe<BookmarkType>('display')
    })
  })
})
