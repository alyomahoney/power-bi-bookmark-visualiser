declare global {
  interface Window {
    plausible?: (eventName: string) => void
  }
}

export function initTelemetry(): void {
  const domain = import.meta.env['VITE_PLAUSIBLE_DOMAIN'] as string | undefined
  if (!domain) return
  if (document.head.querySelector('script[data-domain]')) return
  const script = document.createElement('script')
  script.defer = true
  script.dataset['domain'] = domain
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

export function trackFileUploaded(): void {
  window.plausible?.('file_uploaded')
}
