import type { PageLayout } from '@/types/audit'

export const PBIR_DEFAULT_CANVAS = { width: 1280, height: 720 }

export function normalisePosition(
  pos: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
): { xPct: number; yPct: number; wPct: number; hPct: number } {
  return {
    xPct: (pos.x / canvasWidth) * 100,
    yPct: (pos.y / canvasHeight) * 100,
    wPct: (pos.width / canvasWidth) * 100,
    hPct: (pos.height / canvasHeight) * 100,
  }
}

export function getCanvasDimensions(layout?: PageLayout): { width: number; height: number } {
  if (!layout) return PBIR_DEFAULT_CANVAS
  const width = layout.canvasWidth > 0 ? layout.canvasWidth : PBIR_DEFAULT_CANVAS.width
  const height = layout.canvasHeight > 0 ? layout.canvasHeight : PBIR_DEFAULT_CANVAS.height
  return { width, height }
}
