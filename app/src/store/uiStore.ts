import { create } from 'zustand'
import type { WorkerError, ProgressStep } from '@/types/worker'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'pbi-bookmark-app-theme'
const LABELS_STORAGE_KEY = 'pbi-bookmark-app-show-visual-labels'

interface UiState {
  theme: Theme
  toggleTheme: () => void
  showVisualLabels: boolean
  toggleVisualLabels: () => void
  parseError: WorkerError | null
  setParseError: (error: WorkerError | null) => void
  clearParseError: () => void
  isParsing: boolean
  setIsParsing: (value: boolean) => void
  parseProgressStep: ProgressStep | null
  setParseProgressStep: (step: ProgressStep | null) => void
  clearParseProgress: () => void
  selectedBookmarkId: string | null
  selectBookmark: (id: string | null) => void
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function getInitialShowVisualLabels(): boolean {
  try {
    const stored = localStorage.getItem(LABELS_STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

export const useUiStore = create<UiState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore — localStorage may be unavailable (private browsing, test env)
      }
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: next }
    }),
  showVisualLabels: getInitialShowVisualLabels(),
  toggleVisualLabels: () =>
    set((state) => {
      const next = !state.showVisualLabels
      try {
        localStorage.setItem(LABELS_STORAGE_KEY, String(next))
      } catch {
        // ignore — localStorage may be unavailable (private browsing, test env)
      }
      return { showVisualLabels: next }
    }),
  parseError: null,
  setParseError: (error) => set({ parseError: error }),
  clearParseError: () => set({ parseError: null }),
  isParsing: false,
  setIsParsing: (value) => set({ isParsing: value }),
  parseProgressStep: null,
  setParseProgressStep: (step) => set({ parseProgressStep: step }),
  clearParseProgress: () => set({ isParsing: false, parseProgressStep: null }),
  selectedBookmarkId: null,
  selectBookmark: (id) => set({ selectedBookmarkId: id }),
}))
