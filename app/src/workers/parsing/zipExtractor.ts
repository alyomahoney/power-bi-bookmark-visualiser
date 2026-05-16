import type { FileEntry } from '../../types/worker'

// Full PBIP/PBIX (ZIP archive) extraction is not yet implemented.
// .Report folder uploads (multi-file FileEntry[]) pass through unchanged.
// Full implementation deferred to a later story.
export async function extractIfArchive(entries: FileEntry[]): Promise<FileEntry[]> {
  return entries
}
