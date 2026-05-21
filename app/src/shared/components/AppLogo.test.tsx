import { render, screen } from '@testing-library/react'
import { AppLogo } from './AppLogo'

describe('AppLogo', () => {
  it('renders the app title text', () => {
    render(<AppLogo />)
    expect(screen.getByText('Power BI Bookmark Visualiser')).toBeInTheDocument()
  })

  it('renders as a span element', () => {
    const { container } = render(<AppLogo />)
    expect(container.querySelector('span')).toBeInTheDocument()
  })
})
