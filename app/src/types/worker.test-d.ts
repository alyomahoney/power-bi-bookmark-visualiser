import { expectTypeOf } from 'vitest'
import { assertNever } from './worker'
import type { WorkerInboundMessage, WorkerOutboundMessage, WorkerError } from './worker'
import type { ParseErrorCode } from './errors'
import type { AuditReport } from './audit'

describe('WorkerInboundMessage', () => {
  it('accepts PARSE_FILE variant', () => {
    expectTypeOf<{ type: 'PARSE_FILE'; payload: { files: File[]; relativePaths: string[] } }>()
      .toMatchTypeOf<WorkerInboundMessage>()
  })

  it('accepts CANCEL variant', () => {
    expectTypeOf<{ type: 'CANCEL' }>().toMatchTypeOf<WorkerInboundMessage>()
  })
})

describe('WorkerOutboundMessage', () => {
  it('accepts PROGRESS variant', () => {
    expectTypeOf<{ type: 'PROGRESS'; step: 'reading' }>()
      .toMatchTypeOf<WorkerOutboundMessage>()
  })

  it('accepts SUCCESS variant', () => {
    expectTypeOf<{ type: 'SUCCESS'; payload: AuditReport }>()
      .toMatchTypeOf<WorkerOutboundMessage>()
  })

  it('accepts ERROR variant', () => {
    expectTypeOf<{ type: 'ERROR'; error: WorkerError }>()
      .toMatchTypeOf<WorkerOutboundMessage>()
  })

  it('exhaustive switch compiles when all variants are handled', () => {
    function handle(msg: WorkerOutboundMessage): string {
      switch (msg.type) {
        case 'PROGRESS': return msg.step
        case 'SUCCESS': return 'ok'
        case 'ERROR': return msg.error.message
        default: return assertNever(msg)
      }
    }
    expectTypeOf(handle).toBeFunction()
  })
})

describe('WorkerInboundMessage exhaustiveness', () => {
  it('exhaustive switch compiles when all variants are handled', () => {
    function handle(msg: WorkerInboundMessage): string {
      switch (msg.type) {
        case 'PARSE_FILE': return `files: ${msg.payload.files.length}`
        case 'CANCEL': return 'cancelled'
        default: return assertNever(msg)
      }
    }
    expectTypeOf(handle).toBeFunction()
  })

  it('fails to compile when a WorkerOutboundMessage variant is missing from switch', () => {
    function incompleteHandle(msg: WorkerOutboundMessage): string {
      switch (msg.type) {
        case 'PROGRESS': return msg.step
        case 'SUCCESS': return 'ok'
        default:
          // @ts-expect-error — ERROR variant unhandled; msg is not assignable to never
          return assertNever(msg)
      }
    }
    expectTypeOf(incompleteHandle).toBeFunction()
  })
})

describe('WorkerError', () => {
  it('has code typed as ParseErrorCode', () => {
    expectTypeOf<WorkerError['code']>().toEqualTypeOf<ParseErrorCode>()
  })

  it('has message typed as string', () => {
    expectTypeOf<WorkerError['message']>().toEqualTypeOf<string>()
  })
})
