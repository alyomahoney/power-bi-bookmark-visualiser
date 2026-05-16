import { initTelemetry, trackFileUploaded } from './telemetry'

beforeEach(() => {
  document.head.querySelectorAll('script[data-domain]').forEach(el => el.remove())
  delete window.plausible
  vi.unstubAllEnvs()
})

describe('initTelemetry', () => {
  it('does nothing when VITE_PLAUSIBLE_DOMAIN is absent', () => {
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', '')
    initTelemetry()
    expect(document.head.querySelector('script[data-domain]')).toBeNull()
  })

  it('injects Plausible script tag when domain is set', () => {
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', 'pbibookmark.app')
    initTelemetry()
    const script = document.head.querySelector('script[data-domain]') as HTMLScriptElement | null
    expect(script).not.toBeNull()
    expect(script?.dataset['domain']).toBe('pbibookmark.app')
    expect(script?.src).toBe('https://plausible.io/js/script.js')
    expect(script?.defer).toBe(true)
  })

  it('does not inject a duplicate script tag when called twice', () => {
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', 'pbibookmark.app')
    initTelemetry()
    initTelemetry()
    expect(document.head.querySelectorAll('script[data-domain]').length).toBe(1)
  })
})

describe('trackFileUploaded', () => {
  it('does nothing (no error) when window.plausible is not available', () => {
    expect(() => trackFileUploaded()).not.toThrow()
  })

  it('calls window.plausible with "file_uploaded" and no payload', () => {
    const mockPlausible = vi.fn()
    window.plausible = mockPlausible
    trackFileUploaded()
    expect(mockPlausible).toHaveBeenCalledOnce()
    expect(mockPlausible).toHaveBeenCalledWith('file_uploaded')
  })
})
