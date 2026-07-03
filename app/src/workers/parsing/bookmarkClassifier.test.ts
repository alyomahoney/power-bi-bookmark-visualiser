import type { Bookmark, BookmarkOptions } from '@/types/audit'
import { classifyBookmarkType } from './bookmarkClassifier'

function makeInput(options: BookmarkOptions): Pick<Bookmark, 'rawPayload'> {
  return { rawPayload: { options, explorationState: null } }
}

describe('classifyBookmarkType', () => {
  it('returns "none" when data, display, and page are all suppressed', () => {
    expect(classifyBookmarkType(makeInput({ suppressData: true, suppressDisplay: true }), undefined)).toBe('none')
  })

  it('returns "data" when only data is captured', () => {
    expect(classifyBookmarkType(makeInput({ suppressDisplay: true }), undefined)).toBe('data')
  })

  it('returns "display" when only display is captured', () => {
    expect(classifyBookmarkType(makeInput({ suppressData: true }), undefined)).toBe('display')
  })

  it('returns "page" when only page navigation is captured', () => {
    expect(classifyBookmarkType(makeInput({ suppressData: true, suppressDisplay: true }), 'page-1')).toBe('page')
  })

  it('returns "data-display" when data and display are captured but not page', () => {
    expect(classifyBookmarkType(makeInput({}), undefined)).toBe('data-display')
  })

  it('returns "data-page" when data and page are captured but not display', () => {
    expect(classifyBookmarkType(makeInput({ suppressDisplay: true }), 'page-1')).toBe('data-page')
  })

  it('returns "display-page" when display and page are captured but not data', () => {
    expect(classifyBookmarkType(makeInput({ suppressData: true }), 'page-1')).toBe('display-page')
  })

  it('returns "all" when data, display, and page are all captured', () => {
    expect(classifyBookmarkType(makeInput({}), 'page-1')).toBe('all')
  })

  it('treats absent suppress flags as captured (empty options object)', () => {
    expect(classifyBookmarkType(makeInput({}), undefined)).toBe('data-display')
  })

  it('classification is not affected by applyOnlyToTargetVisuals value', () => {
    expect(classifyBookmarkType(makeInput({ suppressData: true, applyOnlyToTargetVisuals: true }), undefined)).toBe('display')
    expect(classifyBookmarkType(makeInput({ suppressData: true, applyOnlyToTargetVisuals: false }), undefined)).toBe('display')
  })

  it('page axis is driven solely by the targetPageId argument, not by any options field', () => {
    expect(classifyBookmarkType(makeInput({ suppressData: true, suppressDisplay: true, suppressActiveSection: false }), undefined)).toBe('none')
    expect(classifyBookmarkType(makeInput({ suppressData: true, suppressDisplay: true, suppressActiveSection: true }), 'page-1')).toBe('page')
  })
})
