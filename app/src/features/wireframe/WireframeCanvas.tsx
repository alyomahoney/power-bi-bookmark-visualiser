import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { PageLayout } from '@/types/audit'
import { useSelectedBookmark, useAuditReport } from '@/store/hooks'
import { getCanvasDimensions, normalisePosition } from './wireframeLayout'
import { VisualCard } from './VisualCard'
import { typeHasAxis } from '@/shared/utils/bookmarkType'

interface WireframeCanvasProps {
  pages: PageLayout[]
  selectedPageId: string
}

export function WireframeCanvas({ pages, selectedPageId }: WireframeCanvasProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isAnimating, setIsAnimating] = useState(false)
  const selectedBookmarkId = useSelectedBookmark()
  const auditReport = useAuditReport()

  useEffect(() => {
    setIsAnimating(false)
  }, [selectedBookmarkId])

  const pageLayout = pages.find(p => p.pageId === selectedPageId) ?? pages[0]
  if (!pageLayout) return null

  const selectedBookmark =
    auditReport?.bookmarks.find((b) => b.id === selectedBookmarkId) ?? null
  const isBookmarkActive = Boolean(selectedBookmark)
  const isDataType = selectedBookmark !== null && typeHasAxis(selectedBookmark.type, 'data')
  const isDisplayType = selectedBookmark !== null && typeHasAxis(selectedBookmark.type, 'display')

  const hiddenSet = new Set(isBookmarkActive ? selectedBookmark!.hiddenVisualIds : [])
  const targetSet = new Set(isBookmarkActive ? selectedBookmark!.affectedVisualIds : [])

  const canvasState = isAnimating
    ? 'animating'
    : isBookmarkActive
    ? 'bookmark-selected'
    : 'empty'

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(pageLayout)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          position: 'relative',
          backgroundColor: 'var(--color-canvas-surround)',
        }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          data-canvas-state={canvasState}
          style={{
            display: 'block',
            position: 'absolute',
            inset: 0,
            pointerEvents: isAnimating ? 'none' : 'auto',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
        >
          {pageLayout.visuals.map((visual, index) => {
            const isHidden = hiddenSet.has(visual.id)
            const isAffected = !isHidden && targetSet.has(visual.id)
            const showRing = isAffected && isDisplayType
            const isDataAffected = isAffected && isDataType
            const opacity = isHidden ? 0.12 : 1

            return (
              <VisualCard
                key={visual.id}
                visual={visual}
                normPos={normalisePosition(visual.position, canvasWidth, canvasHeight)}
                index={index}
                opacity={opacity}
                isAffected={showRing}
                isDataAffected={isDataAffected}
                onAnimationStart={index === 0 ? () => setIsAnimating(true) : undefined}
                onAnimationComplete={index === 0 ? () => setIsAnimating(false) : undefined}
              />
            )
          })}
        </motion.svg>
      </div>
    </div>
  )
}
