interface UnsupportedBrowserInfo {
  name: string
  version: number
  minimumVersion: number
}

const MINIMUM_VERSIONS: Record<string, number> = {
  Chrome: 109,
  Edge: 109,
  Firefox: 110,
  Safari: 16,
}

export function detectUnsupportedBrowser(): UnsupportedBrowserInfo | null {
  if (typeof navigator === 'undefined') return null

  const ua = navigator.userAgent

  // Edge must be checked before Chrome (Edge UA includes "Chrome")
  const edgeMatch = /Edg\/(\d+)/.exec(ua)
  const chromeMatch = /Chrome\/(\d+)/.exec(ua)
  const firefoxMatch = /Firefox\/(\d+)/.exec(ua)
  const safariMatch = /Version\/(\d+).*Safari/.exec(ua)

  let name: string | null = null
  let version: number | null = null

  if (edgeMatch) {
    name = 'Edge'
    version = parseInt(edgeMatch[1], 10)
  } else if (chromeMatch) {
    name = 'Chrome'
    version = parseInt(chromeMatch[1], 10)
  } else if (firefoxMatch) {
    name = 'Firefox'
    version = parseInt(firefoxMatch[1], 10)
  } else if (safariMatch) {
    name = 'Safari'
    version = parseInt(safariMatch[1], 10)
  }

  if (name === null || version === null || isNaN(version)) return null // unknown browser — fail open

  const minimumVersion = MINIMUM_VERSIONS[name]
  if (version >= minimumVersion) return null // supported

  return { name, version, minimumVersion }
}
