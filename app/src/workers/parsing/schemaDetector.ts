import { SUPPORTED_SCHEMA_VERSIONS } from '../../constants/schemas'
import type { FileEntry } from '../../types/worker'

export class SchemaDetectionError extends Error {
  readonly detectedVersion: string

  constructor(detectedVersion: string, message: string) {
    super(message)
    this.name = 'SchemaDetectionError'
    this.detectedVersion = detectedVersion
  }
}

export async function detectSchemaVersion(entries: FileEntry[]): Promise<void> {
  const entry = entries.find((e) =>
    e.path.endsWith('definition/version.json'),
  )

  if (!entry) {
    throw new Error(
      'definition/version.json not found — file may not be a valid .Report folder',
    )
  }

  const text = await entry.file.text()
  const parsed = JSON.parse(text) as { version?: unknown }
  const version = typeof parsed.version === 'string' ? parsed.version : null

  if (version === null) {
    throw new Error(
      'version field missing or not a string in definition/version.json',
    )
  }

  if (!(SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(version)) {
    throw new SchemaDetectionError(
      version,
      `Schema version "${version}" is not supported. Supported: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}`,
    )
  }
}
