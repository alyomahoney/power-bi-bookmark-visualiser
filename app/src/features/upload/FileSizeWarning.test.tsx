import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileSizeWarning } from './FileSizeWarning'

function makeFile(sizeBytes: number) {
  const file = new File([''], 'report.pbip', { type: 'application/json' })
  Object.defineProperty(file, 'size', { value: sizeBytes, configurable: true })
  return file
}

describe('FileSizeWarning', () => {
  it('renders dialog with correct file size in MB', () => {
    render(
      <FileSizeWarning
        file={makeFile(7 * 1024 * 1024)}
        onProceed={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/7\.0MB/)).toBeInTheDocument()
  })

  it('renders estimated parse time', () => {
    render(
      <FileSizeWarning
        file={makeFile(7 * 1024 * 1024)}
        onProceed={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/approximately 7s/)).toBeInTheDocument()
  })

  it('rounds up estimated parse time (ceil)', () => {
    // 5.5MB → Math.ceil(5.5) = 6s
    render(
      <FileSizeWarning
        file={makeFile(Math.round(5.5 * 1024 * 1024))}
        onProceed={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/approximately 6s/)).toBeInTheDocument()
  })

  it('calls onProceed when Proceed button is clicked', async () => {
    const onProceed = vi.fn()
    render(
      <FileSizeWarning
        file={makeFile(6 * 1024 * 1024)}
        onProceed={onProceed}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Proceed' }))
    expect(onProceed).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <FileSizeWarning
        file={makeFile(6 * 1024 * 1024)}
        onProceed={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders Cancel button text', () => {
    render(
      <FileSizeWarning
        file={makeFile(6 * 1024 * 1024)}
        onProceed={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders dialog title "Large file detected"', () => {
    render(
      <FileSizeWarning
        file={makeFile(6 * 1024 * 1024)}
        onProceed={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Large file detected')).toBeInTheDocument()
  })
})
