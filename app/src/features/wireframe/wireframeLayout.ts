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
  return { width: layout.canvasWidth, height: layout.canvasHeight }
}
