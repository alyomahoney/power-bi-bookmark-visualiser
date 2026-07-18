import { PowerBiIcon } from '@/shared/components/icons/PowerBiIcon'
import type { PowerBiIconName } from '@/shared/components/icons/PowerBiIcon'

export type VisualCategory = 'charts' | 'pie' | 'cards' | 'tables' | 'slicers' | 'placeholder'

export type VisualIcon = React.FC<{ x: number; y: number; size: number }>

export const VISUAL_TYPE_CATEGORY: Record<string, VisualCategory> = {
  clusteredColumnChart: 'charts',
  columnChart:          'charts',
  clusteredBarChart:    'charts',
  barChart:             'charts',
  lineChart:            'charts',
  areaChart:            'charts',
  waterfallChart:       'charts',
  funnel:               'charts',
  scatterChart:                      'charts',
  hundredPercentStackedBarChart:     'charts',
  hundredPercentStackedColumnChart:  'charts',
  stackedAreaChart:                  'charts',
  ribbonChart:                       'charts',
  pieChart:             'pie',
  donutChart:           'pie',
  treemap:              'pie',
  cardVisual:           'cards',
  card:                 'cards',
  kpi:                  'cards',
  gauge:                'cards',
  tableEx:              'tables',
  pivotTable:           'tables',
  slicer:               'slicers',
  advancedSlicerVisual: 'slicers',
  map:                  'charts',
  filledMap:            'charts',
  azureMap:             'charts',
  esriVisual:           'charts',
  decompositionTreeVisual: 'charts',
  textbox:              'cards',
  keyDriversVisual:     'charts',
  scorecard:            'cards',
  qnaVisual:            'cards',
  aiNarratives:         'cards',
  lineStackedColumnComboChart:    'charts',
  lineClusteredColumnComboChart: 'charts',
  pythonVisual:         'charts',
  scriptVisual:         'charts',
  rdlVisual:            'tables',
  textSlicer:           'slicers',
  listSlicer:           'slicers',
  shape:                'cards',
  image:                'cards',
  actionButton:         'cards',
  bookmarkNavigator:    'cards',
  pageNavigator:        'cards',
  multiRowCard:         'cards',
}

export const VISUAL_DISPLAY_NAME: Record<string, string> = {
  clusteredColumnChart: 'Col Chart',
  columnChart:          'Stacked Col',
  clusteredBarChart:    'Bar Chart',
  barChart:             'Stacked Bar',
  lineChart:            'Line',
  areaChart:            'Area',
  waterfallChart:       'Waterfall',
  funnel:               'Funnel',
  scatterChart:                      'Scatter',
  hundredPercentStackedBarChart:     '100% Stacked Bar',
  hundredPercentStackedColumnChart:  '100% Stacked Column',
  stackedAreaChart:                  'Stacked Area',
  ribbonChart:                       'Ribbon',
  pieChart:             'Pie',
  donutChart:           'Donut',
  treemap:              'Treemap',
  cardVisual:           'Card',
  card:                 'Card',
  kpi:                  'KPI',
  gauge:                'Gauge',
  tableEx:              'Table',
  pivotTable:           'Matrix',
  slicer:               'Slicer',
  advancedSlicerVisual: 'Button Slicer',
  map:                  'Map',
  filledMap:            'Filled Map',
  azureMap:             'Azure Map',
  esriVisual:           'ArcGIS Map',
  decompositionTreeVisual: 'Decomposition Tree',
  textbox:              'Text Box',
  keyDriversVisual:     'Key Influencers',
  scorecard:            'Goals',
  qnaVisual:            'Q&A',
  aiNarratives:         'Smart Narrative',
  lineStackedColumnComboChart:    'Line & Stacked Column',
  lineClusteredColumnComboChart: 'Line & Clustered Column',
  pythonVisual:         'Python Visual',
  scriptVisual:         'R Visual',
  rdlVisual:            'Paginated Report',
  textSlicer:           'Text Slicer',
  listSlicer:           'List Slicer',
  shape:                'Shape',
  image:                'Image',
  actionButton:         'Button',
  bookmarkNavigator:    'Bookmark Nav',
  pageNavigator:        'Page Nav',
  multiRowCard:         'Multi-Row Card',
}

export function getVisualCategory(visualType: string): VisualCategory {
  if (/^PowerApps_PBI_CV_/.test(visualType)) return 'placeholder'
  if (/^FlowVisual_/.test(visualType))        return 'placeholder'
  return VISUAL_TYPE_CATEGORY[visualType] ?? 'placeholder'
}

export function getVisualDisplayName(visualType: string): string {
  if (/^PowerApps_PBI_CV_/.test(visualType)) return 'Power Apps'
  if (/^FlowVisual_/.test(visualType))        return 'Power Automate'
  return VISUAL_DISPLAY_NAME[visualType] ?? 'Unknown Visual'
}

// ─── Icon components ─────────────────────────────────────────────────────────
// All icons accept card coords in viewBox space (0–100 range).

const S = 'var(--color-text-secondary)'
const sw = 0.3

// Full glyph set comes from the PowerBiIcon component (shared/components/icons) —
// each registered visual type maps to one of its 47 named glyphs, rendered as a
// small nested <svg> positioned within the card's icon region.
const ACCENT = 'var(--color-primary)'

const POWER_BI_ICON_NAME: Record<string, PowerBiIconName> = {
  clusteredColumnChart:            'clusteredColumn',
  columnChart:                     'stackedColumn',
  clusteredBarChart:               'clusteredBar',
  barChart:                        'stackedBar',
  lineChart:                       'line',
  areaChart:                       'area',
  waterfallChart:                  'waterfall',
  funnel:                          'funnel',
  scatterChart:                    'scatter',
  hundredPercentStackedBarChart:   '100StackedBar',
  hundredPercentStackedColumnChart: '100StackedColumn',
  stackedAreaChart:                'stackedArea',
  ribbonChart:                     'ribbon',
  pieChart:                        'pie',
  donutChart:                      'donut',
  treemap:                         'treemap',
  cardVisual:                      'card',
  card:                            'card',
  kpi:                             'kPI',
  gauge:                           'gauge',
  tableEx:                         'table',
  pivotTable:                      'matrix',
  slicer:                          'slicer',
  advancedSlicerVisual:            'buttonSlicer',
  map:                             'map',
  filledMap:                       'filledMap',
  azureMap:                        'azureMap',
  esriVisual:                      'arcGISMap',
  decompositionTreeVisual:         'decompositionTree',
  textbox:                         'textBox',
  keyDriversVisual:                'keyInfluencers',
  scorecard:                       'goals',
  qnaVisual:                       'qandA',
  aiNarratives:                    'smartNarrative',
  lineStackedColumnComboChart:     'lineAndStackedColumn',
  lineClusteredColumnComboChart:   'lineAndClusteredColumn',
  pythonVisual:                    'pythonVisual',
  scriptVisual:                    'rVisual',
  rdlVisual:                       'paginatedReport',
  textSlicer:                      'textSlicer',
  listSlicer:                      'listSlicer',
  shape:                           'shape',
  image:                           'image',
  actionButton:                    'button',
  bookmarkNavigator:               'bookmarkNav',
  pageNavigator:                   'pageNav',
  multiRowCard:                    'multiRowCard',
}

// The icon and its label are laid out as a single vertically-centred block
// within the card, rather than the icon pinned to the top — see
// computeIconLayout(). LABEL_BLOCK_H approximates the (single-line) label's
// own visual footprint (independent of card height, since font size is
// fixed), so short cards shrink or drop the icon before the two ever collide.
export interface IconLayout {
  iconX: number
  iconY: number
  iconSize: number
  labelCenterY: number
  /** Bottom edge of the whole icon+label block — exposed so callers/tests can
   *  verify vertical centring without hardcoding the internal spacing constants. */
  blockBottom: number
}

const LABEL_BLOCK_H = 1.5
const ICON_LABEL_GAP = 0.6
const CARD_MARGIN = 0.6
const MIN_ICON_SIZE = 1.6

export function computeIconLayout(x: number, y: number, w: number, h: number, showLabel = true): IconLayout | null {
  // With the label hidden there's no text block to reserve room for or
  // stack above — the icon alone gets the full card to center in and can
  // grow a bit further before it's judged too cramped to bother with.
  const labelH = showLabel ? LABEL_BLOCK_H : 0
  const gap = showLabel ? ICON_LABEL_GAP : 0
  const maxIconSize = showLabel ? Math.min(w * 0.55, h * 0.42) : Math.min(w * 0.6, h * 0.6)
  const availForIcon = h - CARD_MARGIN * 2 - gap - labelH
  const iconSize = Math.min(maxIconSize, availForIcon)
  if (iconSize < MIN_ICON_SIZE) return null
  const contentH = iconSize + gap + labelH
  const blockTop = y + (h - contentH) / 2
  return {
    iconX: x + w / 2 - iconSize / 2,
    iconY: blockTop,
    iconSize,
    labelCenterY: blockTop + iconSize + ICON_LABEL_GAP + LABEL_BLOCK_H / 2,
    blockBottom: blockTop + contentH,
  }
}

function makePowerBiVisualIcon(name: PowerBiIconName): VisualIcon {
  return function PowerBiVisualIcon({ x, y, size }) {
    return (
      <PowerBiIcon
        name={name}
        x={x}
        y={y}
        size={size}
        color={S}
        accentColor={ACCENT}
        style={{ overflow: 'visible' }}
      />
    )
  }
}

export const PLACEHOLDER_ICON: VisualIcon = ({ x, y, size }) => {
  const cx = x + size / 2; const cy = y + size * 0.42; const r = size * 0.15
  return (
    <>
      <path
        d={`M${cx - r},${cy - r * 1.2} A${r},${r},0,0,1,${cx + r * 0.5},${cy + r * 0.5} Q${cx + r},${cy + r} ${cx},${cy + r * 1.5}`}
        stroke={S} strokeWidth={sw} fill="none"
      />
      <circle cx={cx} cy={cy + r * 2.2} r={r * 0.3} fill={S} />
    </>
  )
}

export const VISUAL_ICON: Record<string, VisualIcon> = Object.fromEntries(
  Object.entries(POWER_BI_ICON_NAME).map(([visualType, iconName]) => [
    visualType,
    makePowerBiVisualIcon(iconName),
  ])
)

const POWER_APPS_ICON = makePowerBiVisualIcon('powerApps')
const POWER_AUTOMATE_ICON = makePowerBiVisualIcon('powerAutomate')

export function getVisualIcon(visualType: string): VisualIcon {
  if (/^PowerApps_PBI_CV_/.test(visualType)) return POWER_APPS_ICON
  if (/^FlowVisual_/.test(visualType))        return POWER_AUTOMATE_ICON
  return VISUAL_ICON[visualType] ?? PLACEHOLDER_ICON
}
