import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkVisualFilter } from './BookmarkVisualFilter'
import type { VisualElement } from '@/types/audit'

function buildVisual(id: string, visualType: string, tabOrder?: number): VisualElement {
  return {
    id,
    visualType,
    position: { x: 0, y: 0, width: 100, height: 100, tabOrder },
  }
}

describe('BookmarkVisualFilter', () => {
  const visuals = [
    buildVisual('v-1', 'clusteredBarChart', 1),
    buildVisual('v-2', 'tableEx', 2),
  ]

  it('renders trigger with label "Visual" when no visuals selected', () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={[]}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /^visual$/i })).toBeInTheDocument()
  })

  it('renders trigger with "Visual (1)" when one visual selected', () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={['v-1']}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByText('Visual (1)')).toBeInTheDocument()
  })

  it('shows visual labels in dropdown after opening', async () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={[]}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /bar chart/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: /table/i })).toBeInTheDocument()
  })

  it('calls onToggleVisual with the correct visual id when an item is clicked', async () => {
    const onToggleVisual = vi.fn()
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={[]}
        onToggleVisual={onToggleVisual}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /bar chart/i }))
    expect(onToggleVisual).toHaveBeenCalledWith('v-1')
  })

  it('reflects checked state for selected visual ids (aria-checked)', async () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={['v-1']}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /bar chart/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('menuitemcheckbox', { name: /table/i })).toHaveAttribute('aria-checked', 'false')
  })

  it('uses raw visualType string as label for unrecognised visual types', async () => {
    const unknownVisuals = [buildVisual('v-unk', 'myCustomViz', 1)]
    render(
      <BookmarkVisualFilter
        visuals={unknownVisuals}
        selectedVisualIds={[]}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: 'myCustomViz' })).toBeInTheDocument()
  })

  it('keeps the dropdown open after clicking a checkbox item', async () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={[]}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: /bar chart/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /table/i })).toBeInTheDocument()
  })

  it('does not render a Clear button when no visuals are selected', async () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={[]}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    expect(screen.queryByRole('button', { name: /^clear$/i })).not.toBeInTheDocument()
  })

  it('renders a Clear button at the top of the list when visuals are selected', async () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={['v-1']}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument()
  })

  it('calls onClear when the Clear button is clicked', async () => {
    const onClear = vi.fn()
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={['v-1']}
        onToggleVisual={vi.fn()}
        onClear={onClear}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    await userEvent.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('keeps the dropdown open after clicking Clear', async () => {
    render(
      <BookmarkVisualFilter
        visuals={visuals}
        selectedVisualIds={['v-1']}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    await userEvent.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /bar chart/i })).toBeInTheDocument()
  })

  it('disambiguates duplicate visual types with #N suffix', async () => {
    const dupVisuals = [
      buildVisual('v-a', 'clusteredBarChart', 1),
      buildVisual('v-b', 'clusteredBarChart', 2),
    ]
    render(
      <BookmarkVisualFilter
        visuals={dupVisuals}
        selectedVisualIds={[]}
        onToggleVisual={vi.fn()}
        onClear={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /visual/i }))
    expect(screen.getByRole('menuitemcheckbox', { name: /bar chart #1/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: /bar chart #2/i })).toBeInTheDocument()
  })
})
