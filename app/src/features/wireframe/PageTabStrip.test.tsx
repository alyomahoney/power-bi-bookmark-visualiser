import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageTabStrip } from './PageTabStrip'
import type { PageLayout } from '@/types/audit'

function makePage(id: string, name: string): PageLayout {
  return {
    pageId: id,
    pageDisplayName: name,
    canvasWidth: 1280,
    canvasHeight: 720,
    visuals: [],
  }
}

const pages = [
  makePage('pg-1', 'Overview'),
  makePage('pg-2', 'Details'),
  makePage('pg-3', 'Summary'),
]

describe('PageTabStrip', () => {
  describe('tab rendering', () => {
    it('renders a tab for each page', () => {
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={vi.fn()} />)
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Summary' })).toBeInTheDocument()
    })

    it('renders a tablist container with aria-label "Report pages"', () => {
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={vi.fn()} />)
      expect(screen.getByRole('tablist', { name: 'Report pages' })).toBeInTheDocument()
    })
  })

  describe('active state', () => {
    it('active tab has aria-selected="true"', () => {
      render(<PageTabStrip pages={pages} selectedPageId="pg-2" onSelect={vi.fn()} />)
      expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
    })

    it('inactive tabs have aria-selected="false"', () => {
      render(<PageTabStrip pages={pages} selectedPageId="pg-2" onSelect={vi.fn()} />)
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'false')
    })

    it('active tab has indigo border class', () => {
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={vi.fn()} />)
      const tab = screen.getByRole('tab', { name: 'Overview' })
      expect(tab.className).toContain('border-indigo-500')
      expect(tab.className).toContain('text-indigo-400')
    })

    it('active tab has tabIndex=0 and inactive tabs have tabIndex=-1', () => {
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={vi.fn()} />)
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('click handler', () => {
    it('calls onSelect with the page id when a tab is clicked', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={onSelect} />)
      await userEvent.click(screen.getByRole('tab', { name: 'Details' }))
      expect(onSelect).toHaveBeenCalledWith('pg-2')
    })

    it('calls onSelect with the correct id when a different tab is clicked', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={onSelect} />)
      await userEvent.click(screen.getByRole('tab', { name: 'Summary' }))
      expect(onSelect).toHaveBeenCalledWith('pg-3')
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus to the next tab and calls onSelect', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={onSelect} />)
      screen.getByRole('tab', { name: 'Overview' }).focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(onSelect).toHaveBeenCalledWith('pg-2')
    })

    it('ArrowLeft moves focus to the previous tab and calls onSelect', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-2" onSelect={onSelect} />)
      screen.getByRole('tab', { name: 'Details' }).focus()
      await userEvent.keyboard('{ArrowLeft}')
      expect(onSelect).toHaveBeenCalledWith('pg-1')
    })

    it('ArrowRight wraps from last tab to first', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-3" onSelect={onSelect} />)
      screen.getByRole('tab', { name: 'Summary' }).focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(onSelect).toHaveBeenCalledWith('pg-1')
    })

    it('ArrowLeft wraps from first tab to last', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={onSelect} />)
      screen.getByRole('tab', { name: 'Overview' }).focus()
      await userEvent.keyboard('{ArrowLeft}')
      expect(onSelect).toHaveBeenCalledWith('pg-3')
    })

    it('Enter selects the currently focused tab', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={onSelect} />)
      screen.getByRole('tab', { name: 'Details' }).focus()
      await userEvent.keyboard('{Enter}')
      expect(onSelect).toHaveBeenCalledWith('pg-2')
    })

    it('Space selects the currently focused tab', async () => {
      const onSelect = vi.fn()
      render(<PageTabStrip pages={pages} selectedPageId="pg-1" onSelect={onSelect} />)
      screen.getByRole('tab', { name: 'Details' }).focus()
      await userEvent.keyboard(' ')
      expect(onSelect).toHaveBeenCalledWith('pg-2')
    })
  })

  describe('single-page suppression', () => {
    it('returns null when pages has only one entry', () => {
      const { container } = render(
        <PageTabStrip pages={[makePage('pg-1', 'Only Page')]} selectedPageId="pg-1" onSelect={vi.fn()} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null when pages is empty', () => {
      const { container } = render(
        <PageTabStrip pages={[]} selectedPageId="" onSelect={vi.fn()} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renders when pages has two or more entries', () => {
      render(
        <PageTabStrip
          pages={[makePage('pg-1', 'Page 1'), makePage('pg-2', 'Page 2')]}
          selectedPageId="pg-1"
          onSelect={vi.fn()}
        />
      )
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })
  })
})
