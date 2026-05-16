import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MalformedFileError } from './MalformedFileError'
import {
  MALFORMED_FILE_HEADING,
  MALFORMED_FILE_RATIONALE,
  MALFORMED_FILE_ACTION,
} from '@/constants/errorMessages'

const mockOnTryAnother = vi.fn()
const defaultError = { code: 'MALFORMED_FILE' as const, message: 'Error: definition/version.json not found' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MalformedFileError', () => {
  it('renders with role="alert" and aria-live="assertive"', () => {
    render(<MalformedFileError error={defaultError} onTryAnother={mockOnTryAnother} />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveAttribute('aria-atomic', 'true')
  })

  it('renders the error heading from MALFORMED_FILE_HEADING constant', () => {
    render(<MalformedFileError error={defaultError} onTryAnother={mockOnTryAnother} />)
    expect(screen.getByRole('heading', { name: MALFORMED_FILE_HEADING })).toBeInTheDocument()
  })

  it('renders the error message when error.message is provided', () => {
    render(<MalformedFileError error={defaultError} onTryAnother={mockOnTryAnother} />)
    expect(screen.getByText(defaultError.message)).toBeInTheDocument()
  })

  it('does not render message paragraph when error.message is empty string', () => {
    const emptyError = { code: 'MALFORMED_FILE' as const, message: '' }
    render(<MalformedFileError error={emptyError} onTryAnother={mockOnTryAnother} />)
    const container = screen.getByTestId('malformed-file-error')
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].textContent).toBe(MALFORMED_FILE_RATIONALE)
  })

  it('renders the rationale text from MALFORMED_FILE_RATIONALE constant', () => {
    render(<MalformedFileError error={defaultError} onTryAnother={mockOnTryAnother} />)
    expect(screen.getByText(MALFORMED_FILE_RATIONALE)).toBeInTheDocument()
  })

  it('calls onTryAnother when the button is clicked', async () => {
    render(<MalformedFileError error={defaultError} onTryAnother={mockOnTryAnother} />)
    await userEvent.click(screen.getByRole('button', { name: /try another file/i }))
    expect(mockOnTryAnother).toHaveBeenCalledTimes(1)
  })

  it('button text matches MALFORMED_FILE_ACTION constant', () => {
    render(<MalformedFileError error={defaultError} onTryAnother={mockOnTryAnother} />)
    expect(screen.getByRole('button', { name: MALFORMED_FILE_ACTION })).toBeInTheDocument()
  })
})

describe('MalformedFileError — focus indicator', () => {
  it('Try another button has focus-visible ring', () => {
    render(<MalformedFileError error={defaultError} onTryAnother={() => {}} />)
    const btn = screen.getByRole('button', { name: /try another/i })
    expect(btn.className).toContain('focus-visible:ring-2')
    expect(btn.className).toContain('focus-visible:ring-indigo-500')
  })
})
