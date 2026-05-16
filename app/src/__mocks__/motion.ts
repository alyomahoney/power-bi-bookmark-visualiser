import { vi } from 'vitest'
import React from 'react'
import type { ReactNode } from 'react'

// Forward all props (including data-* attributes) to the actual HTML/SVG element
function makeMotionComponent(tag: string) {
  return function MotionStub({ children, initial: _initial, animate: _animate, transition: _transition, ...rest }: Record<string, unknown> & { children?: ReactNode }) {
    return React.createElement(tag, rest, children)
  }
}

export const motion = new Proxy({} as Record<string, ReturnType<typeof makeMotionComponent>>, {
  get: (_target, prop: string) => makeMotionComponent(prop),
})

export const AnimatePresence = ({ children }: { children?: ReactNode }) => children ?? null

export const animate = vi.fn()

export const useMotionValue = vi.fn((initial: number) => ({
  get: () => initial,
  set: vi.fn(),
  on: vi.fn(),
}))

export const useTransform = vi.fn(() => ({
  get: () => 0,
}))

export const useReducedMotion = vi.fn(() => false)

export const useSpring = vi.fn((initial: number) => ({
  get: () => initial,
  set: vi.fn(),
}))
