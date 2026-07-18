import { render } from '@testing-library/react'
import { VisualCard } from './VisualCard'
import { useReducedMotion } from 'motion/react'
import { useUiStore } from '@/store/uiStore'
import type { VisualElement } from '@/types/audit'

function makeVisual(visualType: string, id = 'v1'): VisualElement {
  return {
    id,
    visualType,
    position: { x: 100, y: 50, width: 200, height: 150 },
  }
}

const defaultNormPos = { xPct: 10, yPct: 5, wPct: 20, hPct: 15 }

describe('VisualCard', () => {
  it('renders a g element with a rect child', () => {
    const { container } = render(
      <svg>
        <VisualCard visual={makeVisual('clusteredColumnChart')} normPos={defaultNormPos} index={0} />
      </svg>
    )
    expect(container.querySelector('g')).toBeInTheDocument()
    expect(container.querySelector('rect')).toBeInTheDocument()
  })

  describe('category fill — supported types', () => {
    const cases: Array<[string, string]> = [
      ['clusteredColumnChart', 'var(--color-visual-chart)'],
      ['lineChart',            'var(--color-visual-chart)'],
      ['pieChart',             'var(--color-visual-pie)'],
      ['donutChart',           'var(--color-visual-pie)'],
      ['treemap',              'var(--color-visual-pie)'],
      ['cardVisual',           'var(--color-visual-card)'],
      ['kpi',                  'var(--color-visual-card)'],
      ['gauge',                'var(--color-visual-card)'],
      ['card',                 'var(--color-visual-card)'],
      ['tableEx',              'var(--color-visual-table)'],
      ['pivotTable',           'var(--color-visual-table)'],
      ['slicer',               'var(--color-visual-slicer)'],
      ['advancedSlicerVisual', 'var(--color-visual-slicer)'],
    ]

    it.each(cases)('visualType %s → fill %s', (visualType, expectedFill) => {
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual(visualType)} normPos={defaultNormPos} index={0} />
        </svg>
      )
      expect(container.querySelector('rect')?.getAttribute('fill')).toBe(expectedFill)
    })
  })

  it('renders primary label from getVisualDisplayName()', () => {
    const { container } = render(
      <svg>
        <VisualCard visual={makeVisual('clusteredColumnChart')} normPos={defaultNormPos} index={0} />
      </svg>
    )
    const texts = container.querySelectorAll('text')
    const found = Array.from(texts).some(t => t.textContent === 'Col Chart')
    expect(found).toBe(true)
  })

  it('does not render a sub-label with the raw visualType string', () => {
    const { container } = render(
      <svg>
        <VisualCard visual={makeVisual('lineChart')} normPos={defaultNormPos} index={0} />
      </svg>
    )
    const texts = container.querySelectorAll('text')
    const found = Array.from(texts).some(t => t.textContent === 'lineChart')
    expect(found).toBe(false)
    expect(texts).toHaveLength(1)
  })

  it('uses --color-text-primary for supported type label fill', () => {
    const { container } = render(
      <svg>
        <VisualCard visual={makeVisual('tableEx')} normPos={defaultNormPos} index={0} />
      </svg>
    )
    const texts = container.querySelectorAll('text')
    const primaryLabel = Array.from(texts).find(t => t.textContent === 'Table')
    expect(primaryLabel?.getAttribute('fill')).toBe('var(--color-text-primary)')
  })

  describe('reduced motion', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('renders without error when useReducedMotion returns true', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('pieChart')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      expect(container.querySelector('rect')).toBeInTheDocument()
    })

    it('still applies isAffected indigo ring when reduced motion is enabled', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const { container } = render(
        <svg>
          <VisualCard
            visual={makeVisual('clusteredColumnChart')}
            normPos={defaultNormPos}
            index={0}
            isAffected={true}
          />
        </svg>
      )
      const rect = container.querySelector('rect')
      expect(rect?.getAttribute('stroke')).toBe('var(--color-ring)')
      expect(rect?.getAttribute('stroke-width')).toBe('0.3')
    })

    it('still applies placeholder fill when reduced motion is enabled', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('unknownVisualType')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      expect(container.querySelector('rect')?.getAttribute('fill')).toBe('var(--color-visual-placeholder)')
    })
  })

  describe('placeholder visual type', () => {
    it('applies var(--color-visual-placeholder) fill for unknown visualType', () => {
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('unknownVisualType')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      expect(container.querySelector('rect')?.getAttribute('fill')).toBe('var(--color-visual-placeholder)')
    })

    it('uses --color-text-secondary for primary label fill on unknown visualType', () => {
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('unknownVisualType')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      const texts = container.querySelectorAll('text')
      const primaryLabel = Array.from(texts).find(t => t.textContent === 'Unknown Visual')
      expect(primaryLabel?.getAttribute('fill')).toBe('var(--color-text-secondary)')
    })
  })

  describe('bookmark selection state', () => {
    it('renders indigo ring stroke on rect when isAffected is true', () => {
      const { container } = render(
        <svg>
          <VisualCard
            visual={makeVisual('clusteredColumnChart')}
            normPos={defaultNormPos}
            index={0}
            isAffected={true}
          />
        </svg>
      )
      const rect = container.querySelector('rect')
      expect(rect?.getAttribute('stroke')).toBe('var(--color-ring)')
      expect(rect?.getAttribute('stroke-width')).toBe('0.3')
    })

    it('renders no stroke on rect when isAffected is false (default)', () => {
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('clusteredColumnChart')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      const rect = container.querySelector('rect')
      expect(rect).not.toHaveAttribute('stroke', 'var(--color-ring)')
    })
  })

  it('normalised position values are applied to rect attributes', () => {
    const normPos = { xPct: 5, yPct: 10, wPct: 30, hPct: 25 }
    const { container } = render(
      <svg>
        <VisualCard visual={makeVisual('slicer')} normPos={normPos} index={2} />
      </svg>
    )
    const rect = container.querySelector('rect')!
    expect(Number(rect.getAttribute('x'))).toBeCloseTo(5)
    expect(Number(rect.getAttribute('y'))).toBeCloseTo(10)
    expect(Number(rect.getAttribute('width'))).toBeCloseTo(30)
    expect(Number(rect.getAttribute('height'))).toBeCloseTo(25)
  })

  describe('showVisualLabels toggle', () => {
    afterEach(() => {
      useUiStore.setState({ showVisualLabels: true })
    })

    it('renders the label by default', () => {
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('clusteredColumnChart')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      const found = Array.from(container.querySelectorAll('text')).some(t => t.textContent === 'Col Chart')
      expect(found).toBe(true)
    })

    it('hides the label when showVisualLabels is false', () => {
      useUiStore.setState({ showVisualLabels: false })
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('clusteredColumnChart')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      expect(container.querySelector('text')).not.toBeInTheDocument()
    })

    it('still renders the icon when the label is hidden', () => {
      useUiStore.setState({ showVisualLabels: false })
      const { container } = render(
        <svg>
          <VisualCard visual={makeVisual('clusteredColumnChart')} normPos={defaultNormPos} index={0} />
        </svg>
      )
      expect(container.querySelector('svg[data-icon-name]')).toBeInTheDocument()
    })
  })
})
