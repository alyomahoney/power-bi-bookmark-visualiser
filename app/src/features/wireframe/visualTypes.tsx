export type VisualCategory = 'charts' | 'pie' | 'cards' | 'tables' | 'slicers' | 'placeholder'

export type VisualIcon = React.FC<{ x: number; y: number; w: number; h: number }>

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
}

export function getVisualCategory(visualType: string): VisualCategory {
  if (/^PowerApps_PBI_CV_/.test(visualType)) return 'placeholder'
  if (/^FlowVisual_/.test(visualType))        return 'placeholder'
  return VISUAL_TYPE_CATEGORY[visualType] ?? 'placeholder'
}

export function getVisualDisplayName(visualType: string): string {
  return VISUAL_DISPLAY_NAME[visualType] ?? 'Unknown Visual'
}

// ─── Icon components ─────────────────────────────────────────────────────────
// All icons accept card coords in viewBox space (0–100 range).
// Use line/path/circle only so existing rect-count tests are unaffected.

const S = 'var(--color-text-secondary)'
const sw = 0.3

const ColIcon: VisualIcon = ({ x, y, w, h }) => {
  const base = y + h * 0.44
  const cx = x + w / 2
  const sp = w * 0.18
  return (
    <>
      <line x1={cx - sp} y1={base} x2={cx - sp} y2={base - h * 0.2}  stroke={S} strokeWidth={0.5} />
      <line x1={cx}      y1={base} x2={cx}       y2={base - h * 0.3}  stroke={S} strokeWidth={0.5} />
      <line x1={cx + sp} y1={base} x2={cx + sp}  y2={base - h * 0.15} stroke={S} strokeWidth={0.5} />
    </>
  )
}

const BarIcon: VisualIcon = ({ x, y, w, h }) => {
  const left = x + w * 0.2
  const cy   = y + h * 0.22
  const sp   = h * 0.11
  return (
    <>
      <line x1={left} y1={cy - sp} x2={left + w * 0.45} y2={cy - sp} stroke={S} strokeWidth={0.5} />
      <line x1={left} y1={cy}      x2={left + w * 0.3}  y2={cy}      stroke={S} strokeWidth={0.5} />
      <line x1={left} y1={cy + sp} x2={left + w * 0.4}  y2={cy + sp} stroke={S} strokeWidth={0.5} />
    </>
  )
}

const LineIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iy = y + h * 0.38
  const iw = w * 0.7;       const ih = h * 0.28
  return (
    <path
      d={`M${ix},${iy + ih * 0.5} L${ix + iw * 0.3},${iy + ih * 0.1} L${ix + iw * 0.6},${iy + ih * 0.7} L${ix + iw},${iy}`}
      stroke={S} strokeWidth={sw} fill="none"
    />
  )
}

const AreaIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iw = w * 0.7
  const ih = h * 0.3;       const iy = y + h * 0.38; const base = iy + ih
  return (
    <path
      d={`M${ix},${base} L${ix},${iy + ih * 0.55} L${ix + iw * 0.35},${iy + ih * 0.1} L${ix + iw * 0.7},${iy + ih * 0.65} L${ix + iw},${iy} L${ix + iw},${base} Z`}
      stroke={S} strokeWidth={sw} fill={S} fillOpacity={0.2}
    />
  )
}

const WaterfallIcon: VisualIcon = ({ x, y, w, h }) => {
  const base = y + h * 0.43; const sp = w * 0.16; const cx0 = x + w * 0.18
  return (
    <>
      <line x1={cx0}          y1={base}            x2={cx0}          y2={base - h * 0.2}  stroke={S} strokeWidth={0.5} />
      <line x1={cx0 + sp}     y1={base - h * 0.1}  x2={cx0 + sp}     y2={base - h * 0.28} stroke={S} strokeWidth={0.5} />
      <line x1={cx0 + sp * 2} y1={base - h * 0.05} x2={cx0 + sp * 2} y2={base - h * 0.22} stroke={S} strokeWidth={0.5} />
      <line x1={cx0 + sp * 3} y1={base}            x2={cx0 + sp * 3} y2={base - h * 0.34} stroke={S} strokeWidth={0.5} />
    </>
  )
}

const FunnelIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const iy = y + h * 0.08; const ih = h * 0.35
  const tw = w * 0.45;  const bw = w * 0.15
  return (
    <path
      d={`M${cx - tw / 2},${iy} L${cx + tw / 2},${iy} L${cx + bw / 2},${iy + ih} L${cx - bw / 2},${iy + ih} Z`}
      stroke={S} strokeWidth={sw} fill="none"
    />
  )
}

const ScatterIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.22; const r = 0.3
  return (
    <>
      <circle cx={cx - w * 0.2}  cy={cy + h * 0.1}  r={r} fill={S} />
      <circle cx={cx}            cy={cy - h * 0.05}  r={r} fill={S} />
      <circle cx={cx + w * 0.2}  cy={cy + h * 0.12}  r={r} fill={S} />
      <circle cx={cx - w * 0.08} cy={cy - h * 0.13}  r={r} fill={S} />
    </>
  )
}

const StackedAreaIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iw = w * 0.7
  const ih = h * 0.3;       const iy = y + h * 0.38; const base = iy + ih
  return (
    <>
      <path
        d={`M${ix},${base} L${ix},${iy + ih * 0.6} L${ix + iw * 0.5},${iy + ih * 0.3} L${ix + iw},${iy + ih * 0.5} L${ix + iw},${base} Z`}
        stroke={S} strokeWidth={sw} fill={S} fillOpacity={0.15}
      />
      <path
        d={`M${ix},${iy + ih * 0.6} L${ix + iw * 0.5},${iy + ih * 0.3} L${ix + iw},${iy + ih * 0.5} L${ix + iw},${iy + ih * 0.1} L${ix + iw * 0.5},${iy} L${ix},${iy + ih * 0.3} Z`}
        stroke={S} strokeWidth={sw} fill={S} fillOpacity={0.25}
      />
    </>
  )
}

const RibbonIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iy = y + h * 0.38; const iw = w * 0.7; const ih = h * 0.28
  return (
    <path
      d={`M${ix},${iy + ih * 0.5} C${ix + iw * 0.25},${iy} ${ix + iw * 0.25},${iy + ih} ${ix + iw * 0.5},${iy + ih * 0.5} C${ix + iw * 0.75},${iy} ${ix + iw * 0.75},${iy + ih} ${ix + iw},${iy + ih * 0.5}`}
      stroke={S} strokeWidth={sw} fill="none"
    />
  )
}

const PieIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.22; const r = Math.min(w, h) * 0.18
  return (
    <>
      <path
        d={`M${cx},${cy} L${cx},${cy - r} A${r},${r},0,1,1,${cx - r * 0.87},${cy + r * 0.5} Z`}
        stroke={S} strokeWidth={sw} fill={S} fillOpacity={0.2}
      />
      <path
        d={`M${cx},${cy} L${cx - r * 0.87},${cy + r * 0.5} A${r},${r},0,0,1,${cx},${cy - r} Z`}
        stroke={S} strokeWidth={sw} fill="none"
      />
    </>
  )
}

const DonutIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.22
  const r = Math.min(w, h) * 0.17; const ri = r * 0.55
  return (
    <>
      <circle cx={cx} cy={cy} r={r}  stroke={S} strokeWidth={sw} fill="none" />
      <circle cx={cx} cy={cy} r={ri} stroke={S} strokeWidth={sw} fill="none" />
      <path
        d={`M${cx},${cy - r} A${r},${r},0,0,1,${cx + r},${cy}`}
        stroke={S} strokeWidth={sw * 2} fill="none"
      />
    </>
  )
}

const TreemapIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iy = y + h * 0.08; const iw = w * 0.7; const ih = h * 0.36
  const mx = ix + iw * 0.55; const my = iy + ih * 0.45
  return (
    <>
      <path d={`M${ix},${iy} L${ix + iw},${iy} L${ix + iw},${iy + ih} L${ix},${iy + ih} Z`} stroke={S} strokeWidth={sw} fill="none" />
      <line x1={mx} y1={iy}  x2={mx} y2={iy + ih}  stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={my}  x2={mx} y2={my}        stroke={S} strokeWidth={sw} />
    </>
  )
}

const CardIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.22; const lw = w * 0.5
  return (
    <>
      <line x1={cx - lw / 2}      y1={cy - h * 0.07} x2={cx + lw / 2}       y2={cy - h * 0.07} stroke={S} strokeWidth={0.5} />
      <line x1={cx - lw * 0.35}   y1={cy + h * 0.08} x2={cx + lw * 0.35}    y2={cy + h * 0.08} stroke={S} strokeWidth={sw} />
    </>
  )
}

const KpiIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.22
  return (
    <>
      <line x1={cx - w * 0.2}  y1={cy}            x2={cx + w * 0.2}  y2={cy}            stroke={S} strokeWidth={0.5} />
      <line x1={cx}             y1={cy - h * 0.14} x2={cx}             y2={cy + h * 0.06} stroke={S} strokeWidth={sw} />
      <line x1={cx - w * 0.1}  y1={cy - h * 0.08} x2={cx}             y2={cy - h * 0.14} stroke={S} strokeWidth={sw} />
      <line x1={cx + w * 0.1}  y1={cy - h * 0.08} x2={cx}             y2={cy - h * 0.14} stroke={S} strokeWidth={sw} />
    </>
  )
}

const GaugeIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.3; const r = Math.min(w, h) * 0.2
  return (
    <>
      <path d={`M${cx - r},${cy} A${r},${r},0,0,1,${cx + r},${cy}`} stroke={S} strokeWidth={sw} fill="none" />
      <line x1={cx} y1={cy} x2={cx + r * 0.7} y2={cy - r * 0.7} stroke={S} strokeWidth={sw} />
    </>
  )
}

const TableIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iy = y + h * 0.08; const iw = w * 0.7; const ih = h * 0.36
  return (
    <>
      <line x1={ix} y1={iy}          x2={ix + iw} y2={iy}          stroke={S} strokeWidth={0.4} />
      <line x1={ix} y1={iy + ih / 2} x2={ix + iw} y2={iy + ih / 2} stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + ih}     x2={ix + iw} y2={iy + ih}     stroke={S} strokeWidth={sw} />
      <line x1={ix}          y1={iy} x2={ix}          y2={iy + ih}  stroke={S} strokeWidth={sw} />
      <line x1={ix + iw / 2} y1={iy} x2={ix + iw / 2} y2={iy + ih} stroke={S} strokeWidth={sw} />
      <line x1={ix + iw}     y1={iy} x2={ix + iw}     y2={iy + ih} stroke={S} strokeWidth={sw} />
    </>
  )
}

const MatrixIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iy = y + h * 0.08; const iw = w * 0.7; const ih = h * 0.36
  const hh = ih * 0.3
  return (
    <>
      <line x1={ix} y1={iy}       x2={ix + iw} y2={iy}       stroke={S} strokeWidth={0.4} />
      <line x1={ix} y1={iy + hh}  x2={ix + iw} y2={iy + hh}  stroke={S} strokeWidth={0.4} />
      <line x1={ix} y1={iy + ih}  x2={ix + iw} y2={iy + ih}  stroke={S} strokeWidth={sw} />
      <line x1={ix}               y1={iy} x2={ix}               y2={iy + ih} stroke={S} strokeWidth={0.4} />
      <line x1={ix + iw * 0.35}   y1={iy} x2={ix + iw * 0.35}   y2={iy + ih} stroke={S} strokeWidth={sw} />
      <line x1={ix + iw}          y1={iy} x2={ix + iw}          y2={iy + ih} stroke={S} strokeWidth={sw} />
    </>
  )
}

const SlicerIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const cy = y + h * 0.22; const iw = w * 0.7
  return (
    <>
      <line x1={ix}               y1={cy}             x2={ix + iw}         y2={cy}             stroke={S} strokeWidth={sw} />
      <line x1={ix + iw * 0.3}    y1={cy - h * 0.1}   x2={ix + iw * 0.3}   y2={cy + h * 0.1}   stroke={S} strokeWidth={0.5} />
    </>
  )
}

const ButtonSlicerIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.15; const iy = y + h * 0.1; const iw = w * 0.7; const sp = h * 0.13
  return (
    <>
      <line x1={ix} y1={iy}          x2={ix + iw}       y2={iy}          stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + sp}     x2={ix + iw * 0.8} y2={iy + sp}     stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + sp * 2} x2={ix + iw * 0.9} y2={iy + sp * 2} stroke={S} strokeWidth={sw} />
    </>
  )
}

const MapIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.16; const r = Math.min(w, h) * 0.14
  return (
    <>
      <path
        d={`M${cx},${cy - r * 1.6} C${cx + r * 1.3},${cy - r * 1.6} ${cx + r * 1.3},${cy + r * 0.2} ${cx},${cy + r * 1.8} C${cx - r * 1.3},${cy + r * 0.2} ${cx - r * 1.3},${cy - r * 1.6} ${cx},${cy - r * 1.6} Z`}
        stroke={S} strokeWidth={sw} fill="none"
      />
      <circle cx={cx} cy={cy - r * 0.5} r={r * 0.45} fill={S} />
    </>
  )
}

const DecompositionTreeIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const rootY = y + h * 0.14; const childY = rootY + h * 0.2
  const leftX = cx - w * 0.22; const rightX = cx + w * 0.22
  return (
    <>
      <line x1={cx} y1={rootY} x2={leftX}  y2={childY} stroke={S} strokeWidth={sw} />
      <line x1={cx} y1={rootY} x2={rightX} y2={childY} stroke={S} strokeWidth={sw} />
      <circle cx={cx}     cy={rootY}  r={0.5} fill={S} />
      <circle cx={leftX}  cy={childY} r={0.5} fill={S} />
      <circle cx={rightX} cy={childY} r={0.5} fill={S} />
    </>
  )
}

const TextboxIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.2; const iw = w * 0.6
  const iy = y + h * 0.13; const lh = h * 0.09
  return (
    <>
      <line x1={ix} y1={iy}          x2={ix + iw}       y2={iy}          stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + lh}     x2={ix + iw}       y2={iy + lh}     stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + lh * 2} x2={ix + iw * 0.6} y2={iy + lh * 2} stroke={S} strokeWidth={sw} />
    </>
  )
}

const KeyDriversIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.2; const r = Math.min(w, h) * 0.12
  return (
    <>
      <circle cx={cx} cy={cy} r={r} stroke={S} strokeWidth={sw} fill="none" />
      <line x1={cx - r * 2.2} y1={cy - r * 1.2} x2={cx - r * 1.1} y2={cy - r * 0.4} stroke={S} strokeWidth={sw} />
      <line x1={cx + r * 2.2} y1={cy - r * 1.2} x2={cx + r * 1.1} y2={cy - r * 0.4} stroke={S} strokeWidth={sw} />
      <line x1={cx}           y1={cy + r * 1.8} x2={cx}           y2={cy + r * 0.9} stroke={S} strokeWidth={sw} />
    </>
  )
}

const GoalsIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w * 0.38; const topY = y + h * 0.06; const botY = topY + h * 0.32
  return (
    <>
      <line x1={cx} y1={topY} x2={cx} y2={botY} stroke={S} strokeWidth={sw} />
      <path
        d={`M${cx},${topY} L${cx + w * 0.22},${topY + h * 0.06} L${cx},${topY + h * 0.12} Z`}
        stroke={S} strokeWidth={sw} fill={S} fillOpacity={0.3}
      />
    </>
  )
}

const QnAIcon: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w * 0.42; const cy = y + h * 0.16; const r = Math.min(w, h) * 0.1
  return (
    <>
      <circle cx={cx} cy={cy} r={r} stroke={S} strokeWidth={sw} fill="none" />
      <line x1={cx + r * 0.7} y1={cy + r * 0.7} x2={cx + r * 1.6} y2={cy + r * 1.6} stroke={S} strokeWidth={sw} />
    </>
  )
}

const SmartNarrativeIcon: VisualIcon = ({ x, y, w, h }) => {
  const ix = x + w * 0.22; const iw = w * 0.56
  const iy = y + h * 0.16; const lh = h * 0.09
  const sx = x + w * 0.78; const sy = y + h * 0.1; const sr = Math.min(w, h) * 0.05
  return (
    <>
      <path d={`M${sx},${sy - sr} L${sx},${sy + sr} M${sx - sr},${sy} L${sx + sr},${sy}`} stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy}          x2={ix + iw}       y2={iy}          stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + lh}     x2={ix + iw}       y2={iy + lh}     stroke={S} strokeWidth={sw} />
      <line x1={ix} y1={iy + lh * 2} x2={ix + iw * 0.6} y2={iy + lh * 2} stroke={S} strokeWidth={sw} />
    </>
  )
}

export const PLACEHOLDER_ICON: VisualIcon = ({ x, y, w, h }) => {
  const cx = x + w / 2; const cy = y + h * 0.22; const r = Math.min(w, h) * 0.1
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

export const VISUAL_ICON: Record<string, VisualIcon> = {
  clusteredColumnChart:            ColIcon,
  columnChart:                     ColIcon,
  clusteredBarChart:               BarIcon,
  barChart:                        BarIcon,
  lineChart:                       LineIcon,
  areaChart:                       AreaIcon,
  waterfallChart:                  WaterfallIcon,
  funnel:                          FunnelIcon,
  scatterChart:                    ScatterIcon,
  hundredPercentStackedBarChart:   BarIcon,
  hundredPercentStackedColumnChart: ColIcon,
  stackedAreaChart:                StackedAreaIcon,
  ribbonChart:                     RibbonIcon,
  pieChart:                        PieIcon,
  donutChart:                      DonutIcon,
  treemap:                         TreemapIcon,
  cardVisual:                      CardIcon,
  card:                            CardIcon,
  kpi:                             KpiIcon,
  gauge:                           GaugeIcon,
  tableEx:                         TableIcon,
  pivotTable:                      MatrixIcon,
  slicer:                          SlicerIcon,
  advancedSlicerVisual:            ButtonSlicerIcon,
  map:                             MapIcon,
  filledMap:                       MapIcon,
  azureMap:                        MapIcon,
  esriVisual:                      MapIcon,
  decompositionTreeVisual:         DecompositionTreeIcon,
  textbox:                         TextboxIcon,
  keyDriversVisual:                KeyDriversIcon,
  scorecard:                       GoalsIcon,
  qnaVisual:                       QnAIcon,
  aiNarratives:                    SmartNarrativeIcon,
}

export function getVisualIcon(visualType: string): VisualIcon {
  return VISUAL_ICON[visualType] ?? PLACEHOLDER_ICON
}
