import { useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function BookmarkSearchInput({ value, onChange, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="px-3 py-2 border-b border-border-subtle shrink-0">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          aria-label="Search bookmarks"
          placeholder="Search bookmarks"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full bg-bg-elevated text-text-primary text-sm rounded-md',
            'px-3 py-1.5 border border-border-subtle',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            'placeholder:text-text-muted',
            value.trim() && 'pr-7',
          )}
        />
        {value.trim() && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onClear()
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
