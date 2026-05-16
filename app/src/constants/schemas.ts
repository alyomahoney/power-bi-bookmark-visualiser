export const SUPPORTED_SCHEMA_VERSIONS = ['2.0.0'] as const
export type SupportedSchemaVersion = (typeof SUPPORTED_SCHEMA_VERSIONS)[number]
