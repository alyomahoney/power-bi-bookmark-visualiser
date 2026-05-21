import { BMAD_URL, CLAUDE_CODE_URL } from '@/shared/constants/links'

export function AppFooter() {
  return (
    <footer className="py-4 text-center">
      <p className="text-xs text-text-muted">
        Built with{' '}
        <a
          href={CLAUDE_CODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-primary"
        >
          Claude Code
        </a>
        {' & '}
        <a
          href={BMAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-primary"
        >
          BMAD
        </a>
      </p>
    </footer>
  )
}
