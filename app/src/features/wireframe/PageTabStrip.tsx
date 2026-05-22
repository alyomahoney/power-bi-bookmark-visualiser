import { useRef } from 'react'
import type { PageLayout } from '@/types/audit'

interface PageTabStripProps {
  pages: PageLayout[]
  selectedPageId: string
  onSelect: (id: string) => void
}

export function PageTabStrip({ pages, selectedPageId, onSelect }: PageTabStripProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  if (pages.length <= 1) return null

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      next = (index + 1) % pages.length
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      next = (index - 1 + pages.length) % pages.length
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(pages[index].pageId)
      return
    }
    if (next >= 0) {
      tabRefs.current[next]?.focus()
      onSelect(pages[next].pageId)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Report pages"
      className="flex items-center border-b border-border-subtle shrink-0 overflow-x-auto"
    >
      {pages.map((page, index) => {
        const isActive = page.pageId === selectedPageId
        return (
          <button
            key={page.pageId}
            ref={(el) => { tabRefs.current[index] = el }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(page.pageId)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
              isActive
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {page.pageDisplayName}
          </button>
        )
      })}
    </div>
  )
}
