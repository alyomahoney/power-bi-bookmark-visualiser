import type { BookmarkAxis, BookmarkType } from '@/types/audit'

export function typeHasAxis(type: BookmarkType, axis: BookmarkAxis): boolean {
  if (type === 'none') return false
  if (type === 'all') return true
  return type.split('-').includes(axis)
}

export const TYPE_BADGE_LABEL: Record<BookmarkType, string> = {
  none: 'None',
  data: 'Data',
  display: 'Disp',
  page: 'Page',
  'data-display': 'Data/Disp',
  'data-page': 'Data/Page',
  'display-page': 'Disp/Page',
  all: 'All',
}

export function getTypeBadgeLabel(type: BookmarkType): string {
  return TYPE_BADGE_LABEL[type] ?? 'Unknown'
}
