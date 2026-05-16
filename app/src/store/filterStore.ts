import { create } from 'zustand'
import type { BookmarkType } from '@/types/audit'

interface FilterState {
  searchQuery: string
  selectedTypes: BookmarkType[]
  selectedVisualIds: string[]
  setSearchQuery: (query: string) => void
  toggleType: (type: BookmarkType) => void
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
