import { GITHUB_REPO_URL } from '@/shared/constants/links'

export function ZeroTrustBadge() {
  return (
    <p className="text-sm text-text-secondary">
      We only need the PBIR report structure — no data, no credentials. And
      since this tool has no backend, even if we wanted to keep your file, we
      couldn&apos;t.{' '}
      {/* stopPropagation prevents UploadZone's onClick from opening the file input dialog */}
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline hover:text-text-primary"
      >
        View source on GitHub
      </a>
    </p>
  )
}
