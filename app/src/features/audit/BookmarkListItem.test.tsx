import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildBookmark } from '@/__fixtures__/builders/bookmarkBuilder'
import { BookmarkListItem } from './BookmarkListItem'

describe('BookmarkListItem', () => {
  it('renders the bookmark name', () => {
    const bookmark = buildBookmark().withName('My Bookmark').build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByText('My Bookmark')).toBeInTheDocument()
  })

  it('renders "Disp" badge text for display type bookmark', () => {
    const bookmark = buildBookmark().withType('display').build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByText('Disp')).toBeInTheDocument()
  })

  it('renders "Data" badge text for data type bookmark', () => {
    const bookmark = buildBookmark().withType('data').build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByText('Data')).toBeInTheDocument()
  })

  it('renders "Mix" badge text for mixed type bookmark', () => {
    const bookmark = buildBookmark().withType('mixed').build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByText('Mix')).toBeInTheDocument()
  })

  it('container aria-label includes bookmark name and type', () => {
    const bookmark = buildBookmark().withName('Sales View').withType('display').build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByRole('option', { name: 'Sales View, display type' })).toBeInTheDocument()
  })

  it('does not render toggle indicator when toggleKind is not provided', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.queryByLabelText(/toggle/)).not.toBeInTheDocument()
  })

  it('renders toggle indicator with aria-label "toggle pair" when toggleKind is pair', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} toggleKind="pair" />)
    expect(screen.getByLabelText('toggle pair')).toBeInTheDocument()
  })

  it('renders toggle indicator with aria-label "toggle set" when toggleKind is set', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} toggleKind="set" />)
    expect(screen.getByLabelText('toggle set')).toBeInTheDocument()
  })

  it('container aria-label includes toggle kind when toggleKind is provided', () => {
    const bookmark = buildBookmark().withName('Toggle A').withType('display').build()
    render(<BookmarkListItem bookmark={bookmark} toggleKind="pair" />)
    expect(
      screen.getByRole('option', { name: 'Toggle A, display type, toggle pair' }),
    ).toBeInTheDocument()
  })
})

describe('BookmarkListItem — selection state', () => {
  it('has aria-selected="true" when isSelected is true', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={true} />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true')
  })

  it('has aria-selected="false" when isSelected is false', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={false} />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false')
  })

  it('applies active visual state classes when isSelected is true', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={true} />)
    const option = screen.getByRole('option')
    expect(option.className).toContain('bg-indigo-500/10')
    expect(option.className).toContain('border-l-indigo-500')
  })

  it('does NOT apply active visual state classes when isSelected is false', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={false} />)
    const option = screen.getByRole('option')
    expect(option.className).not.toContain('bg-indigo-500/10')
    expect(option.className).not.toContain('border-l-indigo-500')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={false} onClick={onClick} />)
    await userEvent.click(screen.getByRole('option'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('BookmarkListItem — badge colour independence', () => {
  it('display type badge uses data-variant="secondary" — same colour as all other types', () => {
    const bookmark = buildBookmark().withType('display').build()
    const { container } = render(<BookmarkListItem bookmark={bookmark} />)
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute('data-variant', 'secondary')
  })

  it('data type badge uses data-variant="secondary" — same colour as all other types', () => {
    const bookmark = buildBookmark().withType('data').build()
    const { container } = render(<BookmarkListItem bookmark={bookmark} />)
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute('data-variant', 'secondary')
  })

  it('mixed type badge uses data-variant="secondary" — same colour as all other types', () => {
    const bookmark = buildBookmark().withType('mixed').build()
    const { container } = render(<BookmarkListItem bookmark={bookmark} />)
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute('data-variant', 'secondary')
  })
})

describe('BookmarkListItem — focus indicator', () => {
  it('has focus-visible:ring-2 class for visible keyboard focus ring', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} />)
    const option = screen.getByRole('option')
    expect(option.className).toContain('focus-visible:ring-2')
  })

  it('has focus-visible:ring-inset to prevent ring clipping by ancestor overflow-hidden', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByRole('option').className).toContain('focus-visible:ring-inset')
  })

  it('has focus-visible:ring-indigo-500 class when not selected', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={false} />)
    expect(screen.getByRole('option').className).toContain('focus-visible:ring-indigo-500')
  })

  it('has focus-visible:ring-white class when selected for contrast against indigo background', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} isSelected={true} />)
    expect(screen.getByRole('option').className).toContain('focus-visible:ring-white')
  })

  it('has focus-visible:outline-none to suppress default browser outline', () => {
    const bookmark = buildBookmark().build()
    render(<BookmarkListItem bookmark={bookmark} />)
    expect(screen.getByRole('option').className).toContain('focus-visible:outline-none')
  })
})
