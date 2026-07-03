import { create } from 'zustand'
import type { BookmarkAxis } from '@/types/audit'

interface FilterState {
  searchQuery: string
  selectedTypes: BookmarkAxis[]
  selectedVisualIdsByPage: Record<string, string[]>
  setSearchQuery: (query: string) => void
  toggleType: (type: BookmarkAxis) => void
  toggleVisual: (pageId: string, id: string) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  selectedTypes: [],
  selectedVisualIdsByPage: {},
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleType: (type) =>
    set((state) => ({
      selectedTypes: state.selectedTypes.includes(type)
        ? state.selectedTypes.filter((t) => t !== type)
        : [...state.selectedTypes, type],
    })),
  toggleVisual: (pageId, id) =>
    set((state) => {
      const current = state.selectedVisualIdsByPage[pageId] ?? []
      return {
        selectedVisualIdsByPage: {
          ...state.selectedVisualIdsByPage,
          [pageId]: current.includes(id)
            ? current.filter((v) => v !== id)
            : [...current, id],
        },
      }
    }),
  clearFilters: () => set({ searchQuery: '', selectedTypes: [], selectedVisualIdsByPage: {} }),
}))
