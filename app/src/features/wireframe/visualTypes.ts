export type VisualCategory = 'charts' | 'pie' | 'cards' | 'tables' | 'slicers' | 'placeholder'

export const VISUAL_TYPE_CATEGORY: Record<string, VisualCategory> = {
  clusteredColumnChart: 'charts',
  columnChart:          'charts',
  clusteredBarChart:    'charts',
  barChart:             'charts',
  lineChart:            'charts',
  areaChart:            'charts',
  waterfallChart:       'charts',
  funnel:               'charts',
  scatterChart:         'charts',
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
  scatterChart:         'Scatter',
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
}

export function getVisualCategory(visualType: string): VisualCategory {
  if (/^PowerApps_PBI_CV_/.test(visualType)) return 'placeholder'
  if (/^FlowVisual_/.test(visualType))        return 'placeholder'
  return VISUAL_TYPE_CATEGORY[visualType] ?? 'placeholder'
}

export function getVisualDisplayName(visualType: string): string {
  return VISUAL_DISPLAY_NAME[visualType] ?? 'Unknown Visual'
}
