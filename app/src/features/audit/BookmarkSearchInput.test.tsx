import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkSearchInput } from './BookmarkSearchInput'

describe('BookmarkSearchInput', () => {
  it('renders a text input with accessible label "Search bookmarks"', () => {
    render(<BookmarkSearchInput value="" onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /search bookmarks/i })).toBeInTheDocument()
  })

  it('calls onChange for each character typed', async () => {
    const onChange = vi.fn()
    render(<BookmarkSearchInput value="" onChange={onChange} onClear={vi.fn()} />)
    const input = screen.getByRole('textbox', { name: /search bookmarks/i })
    await userEvent.type(input, 'abc')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('does not render clear button when value is empty', () => {
    render(<BookmarkSearchInput value="" onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
  })

  it('renders clear button when value is non-empty', () => {
    render(<BookmarkSearchInput value="sales" onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', async () => {
    const onClear = vi.fn()
    render(<BookmarkSearchInput value="sales" onChange={vi.fn()} onClear={onClear} />)
    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('returns focus to the input after clear button is clicked', async () => {
    render(<BookmarkSearchInput value="sales" onChange={vi.fn()} onClear={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))
    expect(screen.getByRole('textbox', { name: /search bookmarks/i })).toHaveFocus()
  })
})

describe('BookmarkSearchInput — clear button focus indicator', () => {
  it('clear button has focus-visible ring when value is non-empty', () => {
    render(<BookmarkSearchInput value="hello" onChange={() => {}} onClear={() => {}} />)
    const clearBtn = screen.getByRole('button', { name: /clear search/i })
    expect(clearBtn.className).toContain('focus-visible:ring-2')
    expect(clearBtn.className).toContain('focus-visible:ring-indigo-500')
  })
})
