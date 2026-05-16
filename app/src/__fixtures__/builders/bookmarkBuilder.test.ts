import { buildBookmark } from './bookmarkBuilder'

describe('buildBookmark', () => {
  it('returns a bookmark with sensible defaults', () => {
    const bookmark = buildBookmark().build()
    expect(bookmark.id).toBe('bk-test-001')
    expect(bookmark.name).toBe('Test Bookmark')
    expect(bookmark.type).toBe('data')
    expect(bookmark.affectedVisualIds).toEqual([])
    expect(bookmark.filterState).toBeNull()
    expect(bookmark.rawPayload).toEqual({ options: {}, explorationState: null })
  })

  it('supports field overrides via method chaining', () => {
    const payload = { options: { suppressData: true }, explorationState: { version: '1.3' } }
    const bookmark = buildBookmark()
      .withId('bk-custom')
      .withName('My Bookmark')
      .withAffectedVisualIds(['vis-001', 'vis-002'])
      .withFilterState({ activeSection: 'page01' })
      .withRawPayload(payload)
      .build()

    expect(bookmark.id).toBe('bk-custom')
    expect(bookmark.name).toBe('My Bookmark')
    expect(bookmark.affectedVisualIds).toEqual(['vis-001', 'vis-002'])
    expect(bookmark.filterState).toEqual({ activeSection: 'page01' })
    expect(bookmark.rawPayload).toEqual(payload)
  })

  it('returns independent objects on each build() call', () => {
    const builder = buildBookmark()
    const a = builder.build()
    const b = builder.build()
    expect(a).not.toBe(b)
    a.id = 'mutated'
    expect(b.id).toBe('bk-test-001')
    a.affectedVisualIds.push('injected')
    expect(b.affectedVisualIds).toEqual([])
    ;(a.rawPayload.options as Record<string, unknown>).suppressData = true
    expect(b.rawPayload.options).toEqual({})
  })

  it('each buildBookmark() call starts from fresh defaults', () => {
    buildBookmark().withId('bk-mutated').build()
    const fresh = buildBookmark().build()
    expect(fresh.id).toBe('bk-test-001')
  })

  it('withType sets the bookmark type', () => {
    expect(buildBookmark().withType('display').build().type).toBe('display')
    expect(buildBookmark().withType('mixed').build().type).toBe('mixed')
    expect(buildBookmark().withType('data').build().type).toBe('data')
  })

  it('has hiddenVisualIds: [] by default', () => {
    expect(buildBookmark().build().hiddenVisualIds).toEqual([])
  })

  it('has suppressDisplay: false by default', () => {
    expect(buildBookmark().build().suppressDisplay).toBe(false)
  })

  it('withHiddenVisualIds sets the hidden visual IDs', () => {
    expect(buildBookmark().withHiddenVisualIds(['v-1', 'v-2']).build().hiddenVisualIds).toEqual(['v-1', 'v-2'])
  })

  it('withSuppressDisplay sets the suppressDisplay flag', () => {
    expect(buildBookmark().withSuppressDisplay(true).build().suppressDisplay).toBe(true)
  })
})
