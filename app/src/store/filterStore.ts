import { create } from 'zustand'
import type { BookmarkAxis } from '@/types/audit'

interface FilterState {
  searchQuery: string
  selectedTypes: BookmarkAxis[]
  selectedVisualIds: string[]
  setSearchQuery: (query: string) => void
  toggleType: (type: BookmarkAxis) => void
  toggleVisual: (id: string) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  selectedTypes: [],
  selectedVisualIds: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleType: (type) =>
    set((state) => ({
      selectedTypes: state.selectedTypes.includes(type)
        ? state.selectedTypes.filter((t) => t !== type)
        : [...state.selectedTypes, type],
    })),
  toggleVisual: (id) =>
    set((state) => ({
      selectedVisualIds: state.selectedVisualIds.includes(id)
        ? state.selectedVisualIds.filter((v) => v !== id)
        : [...state.selectedVisualIds, id],
    })),
  clearFilters: () => set({ searchQuery: '', selectedTypes: [], selectedVisualIds: [] }),
}))
