import type { BookmarkType } from '@/types/audit'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<BookmarkType, string> = {
  display: 'Display',
  data: 'Data',
  mixed: 'Mixed',
}

const BOOKMARK_TYPES: BookmarkType[] = ['display', 'data', 'mixed']

interface Props {
  selectedTypes: BookmarkType[]
  onToggleType: (type: BookmarkType) => void
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
        {BOOKMARK_TYPES.map((type) => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={selectedTypes.includes(type)}
            onCheckedChange={() => onToggleType(type)}
          >
            {TYPE_LABELS[type]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
