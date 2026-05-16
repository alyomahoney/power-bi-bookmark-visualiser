import { UNSUPPORTED_BROWSER_HEADING, UNSUPPORTED_BROWSER_UPGRADE_PROMPT } from '@/constants/errorMessages'

interface UnsupportedBrowserProps {
  name: string
  version: number
  minimumVersion: number
}

export function UnsupportedBrowser({ name, version, minimumVersion }: UnsupportedBrowserProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <div
        role="alert"
        autoFocus
        tabIndex={-1}
        className="max-w-md space-y-4 rounded-lg border border-border-subtle p-8 outline-none"
      >
        <h1 className="text-xl font-semibold text-text-primary">{UNSUPPORTED_BROWSER_HEADING}</h1>
        <p className="text-sm text-text-secondary">
          {name} {version} is not supported. Minimum required: {name} {minimumVersion}.
        </p>
        <p className="text-sm text-text-secondary">{UNSUPPORTED_BROWSER_UPGRADE_PROMPT}</p>
      </div>
    </main>
  )
}
