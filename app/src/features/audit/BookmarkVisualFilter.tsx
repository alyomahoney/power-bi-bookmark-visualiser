import { useMemo } from 'react'
import type { VisualElement } from '@/types/audit'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVisualDisplayName } from '@/features/wireframe/visualTypes'

interface Props {
  visuals: VisualElement[]
  selectedVisualIds: string[]
  onToggleVisual: (id: string) => void
}

function resolveLabel(v: VisualElement): string {
  const displayName = getVisualDisplayName(v.visualType)
  return displayName === 'Unknown Visual' ? v.visualType : displayName
}

function buildVisualLabels(sortedVisuals: VisualElement[]): Map<string, string> {
  const typeCount: Record<string, number> = {}
  for (const v of sortedVisuals) {
    const name = resolveLabel(v)
    typeCount[name] = (typeCount[name] ?? 0) + 1
  }
  const typeIndex: Record<string, number> = {}
  const labels = new Map<string, string>()
  for (const v of sortedVisuals) {
    const name = resolveLabel(v)
    if (typeCount[name] > 1) {
      typeIndex[name] = (typeIndex[name] ?? 0) + 1
      labels.set(v.id, `${name} #${typeIndex[name]}`)
    } else {
      labels.set(v.id, name)
    }
  }
  return labels
}

export function BookmarkVisualFilter({ visuals, selectedVisualIds, onToggleVisual }: Props) {
  const activeCount = selectedVisualIds.length
  const sortedVisuals = useMemo(
    () => [...visuals].sort((a, b) => (a.position.tabOrder ?? Infinity) - (b.position.tabOrder ?? Infinity)),
    [visuals],
  )
  const visualLabels = useMemo(() => buildVisualLabels(sortedVisuals), [sortedVisuals])

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
          <span>{activeCount > 0 ? `Visual (${activeCount})` : 'Visual'}</span>
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {sortedVisuals.map((visual) => (
          <DropdownMenuCheckboxItem
            key={visual.id}
            checked={selectedVisualIds.includes(visual.id)}
            onCheckedChange={() => onToggleVisual(visual.id)}
          >
            {visualLabels.get(visual.id) ?? visual.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
