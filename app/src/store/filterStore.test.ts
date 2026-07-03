import { useFilterStore } from '@/store/filterStore'

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] })
  })

  it('has empty searchQuery by default', () => {
    expect(useFilterStore.getState().searchQuery).toBe('')
  })

  it('setSearchQuery updates searchQuery', () => {
    useFilterStore.getState().setSearchQuery('revenue')
    expect(useFilterStore.getState().searchQuery).toBe('revenue')
  })

  it('clearFilters resets searchQuery to empty string', () => {
    useFilterStore.setState({ searchQuery: 'revenue' })
    useFilterStore.getState().clearFilters()
    expect(useFilterStore.getState().searchQuery).toBe('')
  })

  it('has empty selectedTypes by default', () => {
    expect(useFilterStore.getState().selectedTypes).toEqual([])
  })

  it('toggleType adds a type when not selected', () => {
    useFilterStore.getState().toggleType('display')
    expect(useFilterStore.getState().selectedTypes).toContain('display')
  })

  it('toggleType removes a type when already selected', () => {
    useFilterStore.setState({ selectedTypes: ['display'] })
    useFilterStore.getState().toggleType('display')
    expect(useFilterStore.getState().selectedTypes).not.toContain('display')
  })

  it('toggleType can select multiple types independently', () => {
    useFilterStore.getState().toggleType('display')
    useFilterStore.getState().toggleType('data')
    expect(useFilterStore.getState().selectedTypes).toContain('display')
    expect(useFilterStore.getState().selectedTypes).toContain('data')
  })

  it('toggleType supports the "page" axis', () => {
    useFilterStore.getState().toggleType('page')
    expect(useFilterStore.getState().selectedTypes).toContain('page')
    useFilterStore.getState().toggleType('page')
    expect(useFilterStore.getState().selectedTypes).not.toContain('page')
  })

  it('clearFilters resets selectedTypes to empty array', () => {
    useFilterStore.setState({ selectedTypes: ['display', 'data'] })
    useFilterStore.getState().clearFilters()
    expect(useFilterStore.getState().selectedTypes).toEqual([])
  })

  it('has empty selectedVisualIds by default', () => {
    expect(useFilterStore.getState().selectedVisualIds).toEqual([])
  })

  it('toggleVisual adds an id when not selected', () => {
    useFilterStore.getState().toggleVisual('visual-1')
    expect(useFilterStore.getState().selectedVisualIds).toContain('visual-1')
  })

  it('toggleVisual removes an id when already selected', () => {
    useFilterStore.setState({ selectedVisualIds: ['visual-1'] })
    useFilterStore.getState().toggleVisual('visual-1')
    expect(useFilterStore.getState().selectedVisualIds).not.toContain('visual-1')
  })

  it('clearFilters resets selectedVisualIds to empty array', () => {
    useFilterStore.setState({ selectedVisualIds: ['visual-1', 'visual-2'] })
    useFilterStore.getState().clearFilters()
    expect(useFilterStore.getState().selectedVisualIds).toEqual([])
  })
})
