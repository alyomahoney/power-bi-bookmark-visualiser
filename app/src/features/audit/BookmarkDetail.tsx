import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Bookmark, BookmarkType } from '@/types/audit'

const TYPE_LABEL: Record<BookmarkType, string> = {
  display: 'Disp',
  data: 'Data',
  mixed: 'Mix',
}

interface Props {
  bookmark: Bookmark
}

export function BookmarkDetail({ bookmark }: Props) {
  const showAffectedVisuals = bookmark.type === 'display' || bookmark.type === 'mixed'
  const showFilterState = bookmark.type === 'data' || bookmark.type === 'mixed'

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="font-mono text-sm text-text-primary truncate flex-1">
          {bookmark.name}
        </h2>
        <Badge
          variant="secondary"
          className="text-[8px] font-bold uppercase px-[3px] py-0 rounded-full text-text-muted shrink-0"
        >
          {TYPE_LABEL[bookmark.type]}
        </Badge>
      </div>

      {showAffectedVisuals && (
        <section aria-label="Affected visuals">
          <h3 className="text-xs font-medium text-text-secondary uppercase mb-2 tracking-wide">
            Affected Visuals
          </h3>
          {bookmark.affectedVisualIds.length === 0 ? (
            <p className="text-sm text-text-muted">No visuals affected</p>
          ) : (
            <ul className="space-y-1">
              {bookmark.affectedVisualIds.map((id) => (
                <li key={id} className="font-mono text-sm text-text-primary">
                  {id}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showFilterState && (
        <section
          aria-label="Filter state"
          className={cn(showAffectedVisuals && 'mt-6')}
        >
          <h3 className="text-xs font-medium text-text-secondary uppercase mb-2 tracking-wide">
            Filter State
          </h3>
          {bookmark.filterState == null ? (
            <p className="text-sm text-text-muted">No filter state captured</p>
          ) : (
            <pre className="text-xs text-text-primary bg-bg-surface rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(bookmark.filterState, null, 2)}
            </pre>
          )}
        </section>
      )}
    </div>
  )
}
