import { render, screen } from '@testing-library/react'
import { ZeroTrustBadge } from './ZeroTrustBadge'
import { GITHUB_REPO_URL } from '@/shared/constants/links'

describe('ZeroTrustBadge', () => {
  it('renders the zero-trust copy', () => {
    render(<ZeroTrustBadge />)
    expect(
      screen.getByText(/we only need the PBIR report structure/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/no backend/i)).toBeInTheDocument()
  })

  it('renders a GitHub link with correct href', () => {
    render(<ZeroTrustBadge />)
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toHaveAttribute('href', GITHUB_REPO_URL)
  })

  it('GitHub link opens in a new tab safely', () => {
    render(<ZeroTrustBadge />)
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
