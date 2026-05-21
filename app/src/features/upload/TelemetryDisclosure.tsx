export function TelemetryDisclosure() {
  return (
    <p className="text-sm text-text-secondary">
      Anonymised page view and upload counts only — no report content, file names, or user data.{' '}
      {/* stopPropagation prevents UploadZone's onClick from opening the file input dialog */}
      <a
        href="https://plausible.io/open-source-website-analytics"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline hover:text-text-primary"
      >
        Powered by Plausible
      </a>
    </p>
  )
}
