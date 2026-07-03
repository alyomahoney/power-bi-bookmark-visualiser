import type { BookmarkAxis } from '@/types/audit'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const AXIS_LABELS: Record<BookmarkAxis, string> = {
  data: 'Data',
  display: 'Display',
  page: 'Page',
}

const BOOKMARK_AXES: BookmarkAxis[] = ['data', 'display', 'page']

interface Props {
  selectedTypes: BookmarkAxis[]
  onToggleType: (type: BookmarkAxis) => void
}

export function BookmarkTypeFilter({ selectedTypes, onToggleType }: Props) {
  const activeCount = selectedTypes.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1 text-xs rounded-md px-2 py-1',
            'border border-border-subtle bg-bg-elevated text-text-secondary',
            'hover:text-text-primary hover:border-border-strong',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            activeCount > 0 && 'border-indigo-500/50 text-text-primary',
          )}
        >
          <span>{activeCount > 0 ? `Type (${activeCount})` : 'Type'}</span>
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {BOOKMARK_AXES.map((axis) => (
          <DropdownMenuCheckboxItem
            key={axis}
            checked={selectedTypes.includes(axis)}
            onCheckedChange={() => onToggleType(axis)}
          >
            {AXIS_LABELS[axis]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
