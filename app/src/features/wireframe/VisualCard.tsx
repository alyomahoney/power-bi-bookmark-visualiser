import { motion, useReducedMotion } from 'motion/react'
import type { VisualElement } from '@/types/audit'
import { getVisualCategory, getVisualDisplayName } from './visualTypes'
import type { VisualCategory } from './visualTypes'

const CATEGORY_FILL: Record<VisualCategory, string> = {
  charts:      'var(--color-visual-chart)',
  pie:         'var(--color-visual-pie)',
  cards:       'var(--color-visual-card)',
  tables:      'var(--color-visual-table)',
  slicers:     'var(--color-visual-slicer)',
  placeholder: 'var(--color-visual-placeholder)',
}

interface VisualCardProps {
  visual: VisualElement
  normPos: { xPct: number; yPct: number; wPct: number; hPct: number }
  index: number
  opacity?: number
  isAffected?: boolean
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}

export function VisualCard({
  visual,
  normPos,
  index,
  opacity = 1,
  isAffected = false,
  onAnimationStart,
  onAnimationComplete,
}: VisualCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const { xPct, yPct, wPct, hPct } = normPos
  const category = getVisualCategory(visual.visualType)
  const fill = CATEGORY_FILL[category]
  const labelFill = category === 'placeholder'
    ? 'var(--color-text-secondary)'
    : 'var(--color-text-primary)'

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeInOut' as const, delay: Math.min(index * 0.02, 0.1) }

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={transition}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
    >
      <rect
        x={xPct} y={yPct} width={wPct} height={hPct}
        fill={fill} rx={0.5}
        {...(isAffected ? { stroke: 'var(--color-ring)', strokeWidth: 0.3 } : {})}
      />
      <text
        x={xPct + wPct / 2}
        y={yPct + hPct / 2 - 0.8}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={1.2}
        fontWeight="bold"
        fill={labelFill}
        style={{ textTransform: 'uppercase' }}
      >
        {getVisualDisplayName(visual.visualType)}
      </text>
      <text
        x={xPct + wPct / 2}
        y={yPct + hPct / 2 + 0.8}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={0.9}
        fill="var(--color-text-muted)"
      >
        {visual.visualType}
      </text>
    </motion.g>
  )
}
