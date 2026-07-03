import { useFilterStore } from '@/store/filterStore'

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '', selectedTypes: [], selectedVisualIdsByPage: {} })
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

  it('has empty selectedVisualIdsByPage by default', () => {
    expect(useFilterStore.getState().selectedVisualIdsByPage).toEqual({})
  })

  it('toggleVisual adds an id under the given page', () => {
    useFilterStore.getState().toggleVisual('page-1', 'visual-1')
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-1']).toContain('visual-1')
  })

  it('toggleVisual removes an id when already selected on that page', () => {
    useFilterStore.setState({ selectedVisualIdsByPage: { 'page-1': ['visual-1'] } })
    useFilterStore.getState().toggleVisual('page-1', 'visual-1')
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-1']).not.toContain('visual-1')
  })

  it('toggleVisual keeps selections on different pages independent', () => {
    useFilterStore.getState().toggleVisual('page-1', 'visual-1')
    useFilterStore.getState().toggleVisual('page-2', 'visual-2')
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-1']).toEqual(['visual-1'])
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-2']).toEqual(['visual-2'])
  })

  it('toggling the same visual id on two different pages does not cross-contaminate', () => {
    useFilterStore.getState().toggleVisual('page-1', 'visual-1')
    useFilterStore.getState().toggleVisual('page-2', 'visual-1')
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-1']).toEqual(['visual-1'])
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-2']).toEqual(['visual-1'])

    useFilterStore.getState().toggleVisual('page-1', 'visual-1')
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-1']).toEqual([])
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-2']).toEqual(['visual-1'])
  })

  it('clearFilters resets selectedVisualIdsByPage to an empty map', () => {
    useFilterStore.setState({ selectedVisualIdsByPage: { 'page-1': ['visual-1'], 'page-2': ['visual-2'] } })
    useFilterStore.getState().clearFilters()
    expect(useFilterStore.getState().selectedVisualIdsByPage).toEqual({})
  })

  it('clearVisualsForPage removes only the given page\'s entry', () => {
    useFilterStore.setState({ selectedVisualIdsByPage: { 'page-1': ['visual-1'], 'page-2': ['visual-2'] } })
    useFilterStore.getState().clearVisualsForPage('page-1')
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-1']).toBeUndefined()
    expect(useFilterStore.getState().selectedVisualIdsByPage['page-2']).toEqual(['visual-2'])
  })

  it('clearVisualsForPage is a no-op when the page has no entry', () => {
    useFilterStore.setState({ selectedVisualIdsByPage: { 'page-2': ['visual-2'] } })
    useFilterStore.getState().clearVisualsForPage('page-1')
    expect(useFilterStore.getState().selectedVisualIdsByPage).toEqual({ 'page-2': ['visual-2'] })
  })
})
