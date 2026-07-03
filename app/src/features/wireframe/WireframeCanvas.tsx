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
  // Isotropic viewBox: x spans 0-100, y spans 0-(100 * H/W) so one unit is the
  // same physical length on both axes, matching normalisePosition's scaling.
  const viewBoxHeight = (canvasHeight / canvasWidth) * 100

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        containerType: 'size',
      }}
    >
      <div
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          // min() of the width/height-limited candidate widths keeps the box locked
          // to the true page aspect ratio no matter which axis the container clips —
          // a plain width:100% + maxHeight:100% lets max-height silently distort it.
          width: `min(100cqw, calc(100cqh * ${canvasWidth} / ${canvasHeight}))`,
          maxWidth: '100%',
          maxHeight: '100%',
          position: 'relative',
          backgroundColor: 'var(--color-canvas-surround)',
        }}
      >
        <motion.svg
          viewBox={`0 0 100 ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
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
                normPos={normalisePosition(visual.position, canvasWidth)}
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
