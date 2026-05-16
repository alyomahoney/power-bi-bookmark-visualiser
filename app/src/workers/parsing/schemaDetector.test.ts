import { detectSchemaVersion, SchemaDetectionError } from './schemaDetector'
import type { FileEntry } from '../../types/worker'

function makeVersionEntry(version: string, reportName = 'TestReport.Report'): FileEntry {
  return {
    file: new File([JSON.stringify({ version })], 'version.json', { type: 'application/json' }),
    path: `${reportName}/definition/version.json`,
  }
}

function makeOtherEntry(name: string, reportName = 'TestReport.Report'): FileEntry {
  return {
    file: new File(['{}'], name, { type: 'application/json' }),
    path: `${reportName}/definition/${name}`,
  }
}

describe('detectSchemaVersion', () => {
  it('resolves without error when version.json has a supported version', async () => {
    const entries = [makeVersionEntry('2.0.0')]
    await expect(detectSchemaVersion(entries)).resolves.toBeUndefined()
  })

  it('throws SchemaDetectionError with detectedVersion when version is unsupported', async () => {
    const entries = [makeVersionEntry('3.0.0')]
    const err = await detectSchemaVersion(entries).catch((e) => e)
    expect(err).toBeInstanceOf(SchemaDetectionError)
    expect((err as SchemaDetectionError).detectedVersion).toBe('3.0.0')
  })

  it('throws generic Error when definition/version.json is not in the file array', async () => {
    const entries = [makeOtherEntry('report.json')]
    await expect(detectSchemaVersion(entries)).rejects.toThrow(
      'definition/version.json not found',
    )
    await expect(detectSchemaVersion(entries)).rejects.not.toBeInstanceOf(SchemaDetectionError)
  })

  it('throws generic Error when version field is missing from version.json', async () => {
    const entry: FileEntry = {
      file: new File(['{}'], 'version.json', { type: 'application/json' }),
      path: 'TestReport.Report/definition/version.json',
    }
    await expect(detectSchemaVersion([entry])).rejects.toThrow(
      'version field missing or not a string',
    )
  })

  it('throws generic Error when version field is not a string (e.g. number)', async () => {
    const entry: FileEntry = {
      file: new File([JSON.stringify({ version: 200 })], 'version.json', { type: 'application/json' }),
      path: 'TestReport.Report/definition/version.json',
    }
    await expect(detectSchemaVersion([entry])).rejects.toThrow(
      'version field missing or not a string',
    )
  })

  it('throws SyntaxError when version.json content is not valid JSON', async () => {
    const entry: FileEntry = {
      file: new File(['not-json'], 'version.json', { type: 'application/json' }),
      path: 'TestReport.Report/definition/version.json',
    }
    await expect(detectSchemaVersion([entry])).rejects.toBeInstanceOf(SyntaxError)
  })

  it('matches any report folder name (path prefix-agnostic)', async () => {
    const entries = [makeVersionEntry('2.0.0', 'My Weird Report Name.Report')]
    await expect(detectSchemaVersion(entries)).resolves.toBeUndefined()
  })

  it('SchemaDetectionError has correct name property "SchemaDetectionError"', () => {
    const err = new SchemaDetectionError('3.0.0', 'test')
    expect(err.name).toBe('SchemaDetectionError')
    expect(err.detectedVersion).toBe('3.0.0')
    expect(err).toBeInstanceOf(Error)
  })
})
