export function TelemetryDisclosure() {
  return (
    <p className="text-sm text-text-secondary">
      Anonymised page view and upload counts only — no report content, file names, or user data.{' '}
      <a
        href="https://plausible.io/open-source-website-analytics"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-text-primary"
      >
        Powered by Plausible
      </a>
    </p>
  )
}
