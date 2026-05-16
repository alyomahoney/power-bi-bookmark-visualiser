import { render, screen } from '@testing-library/react'
import { ParseProgressState } from './ParseProgressState'

describe('ParseProgressState', () => {
  it('renders with aria-live="polite"', () => {
    render(<ParseProgressState step={null} />)
    expect(screen.getByTestId('parse-progress-state')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders step label "Reading file" when step is reading', () => {
    render(<ParseProgressState step="reading" />)
    expect(screen.getByText('Reading file')).toBeInTheDocument()
  })

  it('renders step label "Parsing structure" when step is parsing', () => {
    render(<ParseProgressState step="parsing" />)
    expect(screen.getByText('Parsing structure')).toBeInTheDocument()
  })

  it('renders step label "Building audit" when step is building', () => {
    render(<ParseProgressState step="building" />)
    expect(screen.getByText('Building audit')).toBeInTheDocument()
  })

  it('renders step label "Complete" when step is complete', () => {
    render(<ParseProgressState step="complete" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('renders fallback label "Starting..." when step is null', () => {
    render(<ParseProgressState step={null} />)
    expect(screen.getByText('Starting...')).toBeInTheDocument()
  })

  it('renders file name when fileName prop is provided', () => {
    render(<ParseProgressState step="reading" fileName="report.pbip" />)
    expect(screen.getByText(/report\.pbip/)).toBeInTheDocument()
  })

  it('renders file size in MB when fileSize is provided alongside fileName', () => {
    render(<ParseProgressState step="reading" fileName="report.pbip" fileSize={2 * 1024 * 1024} />)
    expect(screen.getByText(/report\.pbip · 2\.0 MB/)).toBeInTheDocument()
  })

  it('does not render file info when fileName is not provided', () => {
    render(<ParseProgressState step="reading" fileSize={2 * 1024 * 1024} />)
    expect(screen.queryByText(/MB/)).not.toBeInTheDocument()
  })
})
