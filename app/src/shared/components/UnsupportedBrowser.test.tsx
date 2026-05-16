import { render, screen } from '@testing-library/react'
import { UnsupportedBrowser } from './UnsupportedBrowser'
import { UNSUPPORTED_BROWSER_HEADING } from '@/constants/errorMessages'

describe('UnsupportedBrowser', () => {
  it('renders heading', () => {
    render(<UnsupportedBrowser name="Firefox" version={85} minimumVersion={110} />)
    expect(screen.getByRole('heading', { name: UNSUPPORTED_BROWSER_HEADING })).toBeInTheDocument()
  })

  it('renders browser name and versions', () => {
    render(<UnsupportedBrowser name="Firefox" version={85} minimumVersion={110} />)
    expect(screen.getByText(/firefox 85/i)).toBeInTheDocument()
    expect(screen.getByText(/minimum required: firefox 110/i)).toBeInTheDocument()
  })

  it('renders upgrade prompt', () => {
    render(<UnsupportedBrowser name="Safari" version={14} minimumVersion={16} />)
    expect(screen.getByText(/please upgrade/i)).toBeInTheDocument()
  })

  it('has alert role on main element', () => {
    render(<UnsupportedBrowser name="Chrome" version={80} minimumVersion={109} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
