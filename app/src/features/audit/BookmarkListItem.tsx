import React from 'react'
import { Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Bookmark, BookmarkType } from '@/types/audit'

const BADGE_LABEL: Record<BookmarkType, string> = {
  display: 'Disp',
  data: 'Data',
  mixed: 'Mix',
}

interface Props {
  bookmark: Bookmark
  toggleKind?: 'pair' | 'set'
  isSelected?: boolean
  onClick?: () => void
  tabIndex?: number
}

export const BookmarkListItem = React.forwardRef<HTMLDivElement, Props>(
  ({ bookmark, toggleKind, isSelected = false, onClick, tabIndex = -1 }, ref) => {
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        tabIndex={tabIndex}
        onClick={onClick}
        aria-label={`${bookmark.name}, ${bookmark.type} type${toggleKind !== undefined ? `, toggle ${toggleKind}` : ''}`}
        className={cn(
          'flex items-center gap-2 px-3 h-8 cursor-pointer hover:bg-bg-surface border-l-2',
          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2',
          isSelected
            ? 'bg-indigo-500/10 border-l-indigo-500 focus-visible:ring-white'
            : 'border-l-transparent focus-visible:ring-indigo-500',
        )}
      >
        <span className="font-mono text-sm text-text-primary flex-1 truncate">
          {bookmark.name}
        </span>
        <Badge
          variant="secondary"
          className="text-[8px] font-bold uppercase px-[3px] py-0 rounded-full text-text-muted shrink-0"
        >
          {BADGE_LABEL[bookmark.type]}
        </Badge>
        {toggleKind !== undefined && (
          <Link2
            aria-label={`toggle ${toggleKind}`}
            className="w-3 h-3 text-text-muted shrink-0"
          />
        )}
      </div>
    )
  }
)
BookmarkListItem.displayName = 'BookmarkListItem'
