import { motion, useReducedMotion } from 'motion/react'
import type { VisualElement } from '@/types/audit'
import { useShowVisualLabels } from '@/store/hooks'
import { computeIconLayout, getVisualCategory, getVisualDisplayName, getVisualIcon } from './visualTypes'
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
  isDataAffected?: boolean
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}

export function VisualCard({
  visual,
  normPos,
  index,
  opacity = 1,
  isAffected = false,
  isDataAffected = false,
  onAnimationStart,
  onAnimationComplete,
}: VisualCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const { showVisualLabels } = useShowVisualLabels()
  const { xPct, yPct, wPct, hPct } = normPos
  const category = getVisualCategory(visual.visualType)
  const fill = CATEGORY_FILL[category]
  const IconComponent = getVisualIcon(visual.visualType)
  const labelFill = category === 'placeholder'
    ? 'var(--color-text-secondary)'
    : 'var(--color-text-primary)'
  const iconLayout = computeIconLayout(xPct, yPct, wPct, hPct, showVisualLabels)
  const labelCenterY = iconLayout ? iconLayout.labelCenterY : yPct + hPct / 2

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
        data-card-bg="true"
        x={xPct} y={yPct} width={wPct} height={hPct}
        fill={fill} rx={1.2}
        stroke={isAffected ? 'var(--color-ring)' : 'var(--color-visual-card-border)'}
        strokeWidth={isAffected ? 0.3 : 0.1}
      />
      {isDataAffected && (
        shouldReduceMotion ? (
          <rect
            x={xPct} y={yPct} width={wPct} height={hPct}
            fill="none"
            stroke="var(--color-data-glow)"
            strokeWidth={0.3}
            rx={0.5}
          />
        ) : (
          <motion.rect
            x={xPct} y={yPct} width={wPct} height={hPct}
            fill="none"
            stroke="var(--color-data-glow)"
            rx={0.5}
            initial={{ strokeWidth: 0.3, strokeOpacity: 0.6 }}
            animate={{ strokeWidth: [0.3, 0.8, 0.3], strokeOpacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        )
      )}
      {iconLayout && (
        <IconComponent x={iconLayout.iconX} y={iconLayout.iconY} size={iconLayout.iconSize} />
      )}
      {showVisualLabels && (
        <text
          x={xPct + wPct / 2}
          y={labelCenterY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={1.15}
          fontWeight={600}
          fill={labelFill}
        >
          {getVisualDisplayName(visual.visualType)}
        </text>
      )}
    </motion.g>
  )
}
