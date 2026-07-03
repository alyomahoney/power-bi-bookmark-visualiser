import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkTypeFilter } from './BookmarkTypeFilter'

describe('BookmarkTypeFilter', () => {
  it('renders trigger with label "Type" when no types selected', () => {
    render(<BookmarkTypeFilter selectedTypes={[]} onToggleType={vi.fn()} />)
    expect(screen.getByRole('button', { name: /^type$/i })).toBeInTheDocument()
  })

  it('renders trigger with "Type (1)" when one type selected', () => {
    render(<BookmarkTypeFilter selectedTypes={['display']} onToggleType={vi.fn()} />)
    expect(screen.getByText('Type (1)')).toBeInTheDocument()
  })

  it('renders trigger with "Type (2)" when two types selected', () => {
    render(<BookmarkTypeFilter selectedTypes={['display', 'data']} onToggleType={vi.fn()} />)
    expect(screen.getByText('Type (2)')).toBeInTheDocument()
  })

  it('shows Data, Display, Page options after opening dropdown', async () => {
    render(<BookmarkTypeFilter selectedTypes={[]} onToggleType={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /type/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /display/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: /data/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: /page/i })).toBeInTheDocument()
  })

  it('calls onToggleType with "display" when Display item clicked', async () => {
    const onToggleType = vi.fn()
    render(<BookmarkTypeFilter selectedTypes={[]} onToggleType={onToggleType} />)
    await userEvent.click(screen.getByRole('button', { name: /type/i }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /display/i }))
    expect(onToggleType).toHaveBeenCalledWith('display')
  })

  it('reflects checked state for selected types (aria-checked)', async () => {
    render(<BookmarkTypeFilter selectedTypes={['display']} onToggleType={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /type/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /display/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('menuitemcheckbox', { name: /data/i })).toHaveAttribute('aria-checked', 'false')
  })

  it('keeps the dropdown open after clicking a checkbox item', async () => {
    render(<BookmarkTypeFilter selectedTypes={[]} onToggleType={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /type/i }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /display/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /data/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: /page/i })).toBeInTheDocument()
  })

  it('allows checking multiple boxes in one open dropdown session', async () => {
    const onToggleType = vi.fn()
    render(<BookmarkTypeFilter selectedTypes={[]} onToggleType={onToggleType} />)
    await userEvent.click(screen.getByRole('button', { name: /type/i }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /display/i }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /data/i }))
    expect(onToggleType).toHaveBeenNthCalledWith(1, 'display')
    expect(onToggleType).toHaveBeenNthCalledWith(2, 'data')
  })
})
