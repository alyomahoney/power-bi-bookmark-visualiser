import { render, screen } from '@testing-library/react'
import { AppFooter } from './AppFooter'

describe('AppFooter', () => {
  it('renders a footer element', () => {
    const { container } = render(<AppFooter />)
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('contains Built with text', () => {
    render(<AppFooter />)
    expect(screen.getByText(/built with/i)).toBeInTheDocument()
  })

  it('renders Claude Code link with correct href', () => {
    render(<AppFooter />)
    const link = screen.getByRole('link', { name: /claude code/i })
    expect(link).toHaveAttribute('href', 'https://claude.ai/code')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders BMAD link with correct href', () => {
    render(<AppFooter />)
    const link = screen.getByRole('link', { name: 'BMAD' })
    expect(link).toHaveAttribute('href', 'https://bmad.dev')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
