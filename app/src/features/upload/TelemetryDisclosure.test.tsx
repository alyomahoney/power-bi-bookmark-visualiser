import { render, screen } from '@testing-library/react'
import { TelemetryDisclosure } from './TelemetryDisclosure'

describe('TelemetryDisclosure', () => {
  it('renders telemetry disclosure text', () => {
    render(<TelemetryDisclosure />)
    expect(screen.getByText(/anonymised page view and upload counts only/i)).toBeInTheDocument()
  })

  it('renders Plausible link with correct attributes', () => {
    render(<TelemetryDisclosure />)
    const link = screen.getByRole('link', { name: /powered by plausible/i })
    expect(link).toHaveAttribute('href', 'https://plausible.io/open-source-website-analytics')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
