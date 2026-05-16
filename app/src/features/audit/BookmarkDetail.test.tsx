import { render, screen } from '@testing-library/react'
import { BookmarkDetail } from './BookmarkDetail'
import { buildBookmark } from '@/__fixtures__/builders/bookmarkBuilder'

describe('BookmarkDetail', () => {
  it('renders the bookmark name', () => {
    const bookmark = buildBookmark().withName('Sales Summary').build()
    render(<BookmarkDetail bookmark={bookmark} />)
    expect(screen.getByText('Sales Summary')).toBeInTheDocument()
  })

  it('renders the type badge', () => {
    const bookmark = buildBookmark().withType('display').build()
    render(<BookmarkDetail bookmark={bookmark} />)
    expect(screen.getByText('Disp')).toBeInTheDocument()
  })

  describe('display type', () => {
    it('renders the Affected Visuals region', () => {
      const bookmark = buildBookmark().withType('display').withAffectedVisualIds(['v-001']).build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByRole('region', { name: /affected visuals/i })).toBeInTheDocument()
    })

    it('does not render the Filter State region', () => {
      const bookmark = buildBookmark().withType('display').build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.queryByRole('region', { name: /filter state/i })).not.toBeInTheDocument()
    })

    it('lists each affected visual ID', () => {
      const bookmark = buildBookmark()
        .withType('display')
        .withAffectedVisualIds(['visual-001', 'visual-002'])
        .build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByText('visual-001')).toBeInTheDocument()
      expect(screen.getByText('visual-002')).toBeInTheDocument()
    })

    it('shows "No visuals affected" when affectedVisualIds is empty', () => {
      const bookmark = buildBookmark().withType('display').withAffectedVisualIds([]).build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByText('No visuals affected')).toBeInTheDocument()
    })
  })

  describe('data type', () => {
    it('renders the Filter State region', () => {
      const bookmark = buildBookmark().withType('data').withFilterState({ column: 'Year' }).build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByRole('region', { name: /filter state/i })).toBeInTheDocument()
    })

    it('does not render the Affected Visuals region', () => {
      const bookmark = buildBookmark().withType('data').build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.queryByRole('region', { name: /affected visuals/i })).not.toBeInTheDocument()
    })

    it('renders filter state as formatted JSON', () => {
      const filterState = { column: 'Year', value: 2024 }
      const bookmark = buildBookmark().withType('data').withFilterState(filterState).build()
      render(<BookmarkDetail bookmark={bookmark} />)
      const region = screen.getByRole('region', { name: /filter state/i })
      const pre = region.querySelector('pre')!
      expect(pre.textContent).toContain('"column"')
      expect(pre.textContent).toContain('"Year"')
    })

    it('shows "No filter state captured" when filterState is null', () => {
      const bookmark = buildBookmark().withType('data').withFilterState(null).build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByText('No filter state captured')).toBeInTheDocument()
    })
  })

  describe('mixed type', () => {
    it('renders both Affected Visuals and Filter State regions', () => {
      const bookmark = buildBookmark()
        .withType('mixed')
        .withAffectedVisualIds(['v-001'])
        .withFilterState({ slicer: 'Q1' })
        .build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByRole('region', { name: /affected visuals/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /filter state/i })).toBeInTheDocument()
    })

    it('shows "No visuals affected" when affectedVisualIds is empty', () => {
      const bookmark = buildBookmark()
        .withType('mixed')
        .withAffectedVisualIds([])
        .withFilterState({ slicer: 'Q1' })
        .build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByText('No visuals affected')).toBeInTheDocument()
    })

    it('shows "No filter state captured" when filterState is null', () => {
      const bookmark = buildBookmark()
        .withType('mixed')
        .withAffectedVisualIds(['v-001'])
        .withFilterState(null)
        .build()
      render(<BookmarkDetail bookmark={bookmark} />)
      expect(screen.getByText('No filter state captured')).toBeInTheDocument()
    })
  })
})

describe('BookmarkDetail — colour-independence badge labels', () => {
  it('renders "Data" badge text for data type bookmark', () => {
    const bookmark = buildBookmark().withType('data').build()
    render(<BookmarkDetail bookmark={bookmark} />)
    expect(screen.getByText('Data')).toBeInTheDocument()
  })

  it('renders "Mix" badge text for mixed type bookmark', () => {
    const bookmark = buildBookmark().withType('mixed').withAffectedVisualIds([]).withFilterState(null).build()
    render(<BookmarkDetail bookmark={bookmark} />)
    expect(screen.getByText('Mix')).toBeInTheDocument()
  })
})

describe('BookmarkDetail — badge colour independence', () => {
  it('display type badge uses data-variant="secondary" — same colour as all other types', () => {
    const bookmark = buildBookmark().withType('display').build()
    const { container } = render(<BookmarkDetail bookmark={bookmark} />)
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute('data-variant', 'secondary')
  })

  it('data type badge uses data-variant="secondary" — same colour as all other types', () => {
    const bookmark = buildBookmark().withType('data').build()
    const { container } = render(<BookmarkDetail bookmark={bookmark} />)
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute('data-variant', 'secondary')
  })

  it('mixed type badge uses data-variant="secondary" — same colour as all other types', () => {
    const bookmark = buildBookmark().withType('mixed').withAffectedVisualIds([]).withFilterState(null).build()
    const { container } = render(<BookmarkDetail bookmark={bookmark} />)
    expect(container.querySelector('[data-slot="badge"]')).toHaveAttribute('data-variant', 'secondary')
  })
})
