import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SchemaErrorMessage } from './SchemaErrorMessage'
import type { WorkerError } from '@/types/worker'
import {
  SCHEMA_UNSUPPORTED_HEADING,
  SCHEMA_UNSUPPORTED_RATIONALE,
} from '@/constants/errorMessages'
import { SCHEMA_SUPPORT_URL } from '@/shared/constants/links'
import { SUPPORTED_SCHEMA_VERSIONS } from '@/constants/schemas'

function makeError(detectedVersion?: string): WorkerError {
  return {
    code: 'UNSUPPORTED_SCHEMA_VERSION',
    message: 'Schema version not supported',
    ...(detectedVersion !== undefined ? { detectedVersion } : {}),
  }
}

describe('SchemaErrorMessage', () => {
  it('renders with role="alert" and aria-live="assertive"', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders the error heading from SCHEMA_UNSUPPORTED_HEADING constant', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      SCHEMA_UNSUPPORTED_HEADING,
    )
  })

  it('renders the detected version when error.detectedVersion is provided', () => {
    render(<SchemaErrorMessage error={makeError('3.0.0')} onTryAnother={() => {}} />)
    expect(screen.getByText('3.0.0')).toBeInTheDocument()
  })

  it('does not render detected version when error.detectedVersion is undefined', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    expect(screen.queryByText(/Detected version/)).not.toBeInTheDocument()
  })

  it('renders supported versions from SUPPORTED_SCHEMA_VERSIONS constant', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    const versionText = SUPPORTED_SCHEMA_VERSIONS.join(', ')
    expect(screen.getByText(versionText)).toBeInTheDocument()
  })

  it('renders the rationale text from SCHEMA_UNSUPPORTED_RATIONALE constant', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    expect(screen.getByText(SCHEMA_UNSUPPORTED_RATIONALE)).toBeInTheDocument()
  })

  it('renders a link to SCHEMA_SUPPORT_URL that opens in a new tab', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    const link = screen.getByRole('link', { name: /check schema support status/i })
    expect(link).toHaveAttribute('href', SCHEMA_SUPPORT_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('calls onTryAnother when the try-another button is clicked', async () => {
    const onTryAnother = vi.fn()
    render(<SchemaErrorMessage error={makeError()} onTryAnother={onTryAnother} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onTryAnother).toHaveBeenCalledTimes(1)
  })
})

describe('SchemaErrorMessage — focus indicators', () => {
  it('Try another button has focus-visible ring', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    const btn = screen.getByRole('button', { name: /try another/i })
    expect(btn.className).toContain('focus-visible:ring-2')
    expect(btn.className).toContain('focus-visible:ring-indigo-500')
  })

  it('support link has focus-visible ring', () => {
    render(<SchemaErrorMessage error={makeError()} onTryAnother={() => {}} />)
    const link = screen.getByRole('link', { name: /check schema support status/i })
    expect(link.className).toContain('focus-visible:ring-2')
    expect(link.className).toContain('focus-visible:ring-indigo-500')
  })
})
