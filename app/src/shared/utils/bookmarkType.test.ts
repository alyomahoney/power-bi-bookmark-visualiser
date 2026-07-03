import type { BookmarkType } from '@/types/audit'
import { typeHasAxis, getTypeBadgeLabel } from './bookmarkType'

const ALL_TYPES: BookmarkType[] = [
  'none',
  'data',
  'display',
  'page',
  'data-display',
  'data-page',
  'display-page',
  'all',
]

describe('typeHasAxis', () => {
  it('"none" has no axis', () => {
    for (const axis of ['data', 'display', 'page'] as const) {
      expect(typeHasAxis('none', axis)).toBe(false)
    }
  })

  it('"all" has every axis', () => {
    for (const axis of ['data', 'display', 'page'] as const) {
      expect(typeHasAxis('all', axis)).toBe(true)
    }
  })

  it.each([
    ['data', 'data', true],
    ['data', 'display', false],
    ['data', 'page', false],
    ['display', 'display', true],
    ['display', 'data', false],
    ['page', 'page', true],
    ['page', 'data', false],
    ['data-display', 'data', true],
    ['data-display', 'display', true],
    ['data-display', 'page', false],
    ['data-page', 'data', true],
    ['data-page', 'page', true],
    ['data-page', 'display', false],
    ['display-page', 'display', true],
    ['display-page', 'page', true],
    ['display-page', 'data', false],
  ] as const)('typeHasAxis(%s, %s) === %s', (type, axis, expected) => {
    expect(typeHasAxis(type, axis)).toBe(expected)
  })

  it('every type is well-formed for all three axis checks', () => {
    for (const type of ALL_TYPES) {
      for (const axis of ['data', 'display', 'page'] as const) {
        expect(typeof typeHasAxis(type, axis)).toBe('boolean')
      }
    }
  })
})

describe('getTypeBadgeLabel', () => {
  it.each([
    ['none', 'None'],
    ['data', 'Data'],
    ['display', 'Disp'],
    ['page', 'Page'],
    ['data-display', 'Data/Disp'],
    ['data-page', 'Data/Page'],
    ['display-page', 'Disp/Page'],
    ['all', 'All'],
  ] as const)('getTypeBadgeLabel(%s) === %s', (type, expected) => {
    expect(getTypeBadgeLabel(type)).toBe(expected)
  })

  it('falls back to "Unknown" for a stale/unrecognized type value', () => {
    expect(getTypeBadgeLabel('mixed' as BookmarkType)).toBe('Unknown')
  })
})
