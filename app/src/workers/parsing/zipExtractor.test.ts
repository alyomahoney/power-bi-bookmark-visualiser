import { extractIfArchive } from './zipExtractor'
import type { FileEntry } from '../../types/worker'

describe('extractIfArchive', () => {
  it('returns the same entry array unchanged (pass-through)', async () => {
    const entries: FileEntry[] = [
      { file: new File(['content'], 'test.pbip'), path: 'test.pbip' },
    ]
    const result = await extractIfArchive(entries)
    expect(result).toBe(entries)
  })
})
