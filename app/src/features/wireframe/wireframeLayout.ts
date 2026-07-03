import type { PageLayout } from '@/types/audit'

export const PBIR_DEFAULT_CANVAS = { width: 1280, height: 720 }

// y/height are also divided by canvasWidth (not canvasHeight) so x and y share
// one physical unit — required for the WireframeCanvas viewBox to stay isotropic,
// otherwise icons/text drawn with circular/curved geometry render stretched.
export function normalisePosition(
  pos: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
): { xPct: number; yPct: number; wPct: number; hPct: number } {
  return {
    xPct: (pos.x / canvasWidth) * 100,
    yPct: (pos.y / canvasWidth) * 100,
    wPct: (pos.width / canvasWidth) * 100,
    hPct: (pos.height / canvasWidth) * 100,
  }
}

export function getCanvasDimensions(layout?: PageLayout): { width: number; height: number } {
  if (!layout) return PBIR_DEFAULT_CANVAS
  const width = layout.canvasWidth > 0 ? layout.canvasWidth : PBIR_DEFAULT_CANVAS.width
  const height = layout.canvasHeight > 0 ? layout.canvasHeight : PBIR_DEFAULT_CANVAS.height
  return { width, height }
}
