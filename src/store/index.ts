import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UnifiedTrack, AuthState, Filters, TabId } from '../types'

interface AppStore {
  // Auth
  auth: AuthState
  setAuth: (auth: AuthState) => void
  logout: () => void

  // Navigation
  activeTab: TabId
  setActiveTab: (tab: TabId) => void

  // Filters
  filters: Filters
  setFilters: (f: Partial<Filters>) => void

  // Crate (local fallback)
  localCrate: UnifiedTrack[]
  localLikedIds: Set<string>
  toggleLocalLike: (track: UnifiedTrack) => void

  // Station
  stationSeed: UnifiedTrack | null
  setStationSeed: (t: UnifiedTrack | null) => void

  // Now playing
  nowPlaying: UnifiedTrack | null
  setNowPlaying: (t: UnifiedTrack | null) => void
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void

  // Set builder
  setBuilderTracks: UnifiedTrack[]
  addToSetBuilder: (t: UnifiedTrack) => void
  removeFromSetBuilder: (id: string) => void
  clearSetBuilder: () => void

  // Admin
  adminUnlocked: boolean
  setAdminUnlocked: (v: boolean) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      auth: { user: null, token: null, isAdmin: false },
      setAuth: (auth) => set({ auth }),
      logout: () => set({ auth: { user: null, token: null, isAdmin: false } }),

      activeTab: 'discover',
      setActiveTab: (activeTab) => set({ activeTab }),

      filters: {
        query: 'deep house underground',
        genre: 'All Genres',
        platform: 'soundcloud',
        maxPlays: 5000,
        bpmMin: undefined,
        bpmMax: undefined,
        vibe: undefined,
      },
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),

      localCrate: [],
      localLikedIds: new Set(),
      toggleLocalLike: (track) => {
        const { localCrate, localLikedIds } = get()
        const next = new Set(localLikedIds)
        let nextCrate: UnifiedTrack[]
        if (next.has(track.id)) {
          next.delete(track.id)
          nextCrate = localCrate.filter((t) => t.id !== track.id)
        } else {
          next.add(track.id)
          nextCrate = [...localCrate.filter((t) => t.id !== track.id), track]
        }
        set({ localLikedIds: next, localCrate: nextCrate })
      },

      stationSeed: null,
      setStationSeed: (stationSeed) => set({ stationSeed }),

      nowPlaying: null,
      setNowPlaying: (nowPlaying) => set({ nowPlaying }),
      isPlaying: false,
      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setBuilderTracks: [],
      addToSetBuilder: (t) => set((s) => ({
        setBuilderTracks: s.setBuilderTracks.find((x) => x.id === t.id)
          ? s.setBuilderTracks
          : [...s.setBuilderTracks, t]
      })),
      removeFromSetBuilder: (id) => set((s) => ({ setBuilderTracks: s.setBuilderTracks.filter((t) => t.id !== id) })),
      clearSetBuilder: () => set({ setBuilderTracks: [] }),

      adminUnlocked: false,
      setAdminUnlocked: (adminUnlocked) => set({ adminUnlocked }),
    }),
    {
      name: 'trueselector-store',
      partialize: (s) => ({
        auth: s.auth,
        localCrate: s.localCrate,
        localLikedIds: Array.from(s.localLikedIds),
        filters: s.filters,
        setBuilderTracks: s.setBuilderTracks,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set after rehydration
          const ids = (state as any).localLikedIds
          if (Array.isArray(ids)) state.localLikedIds = new Set(ids)
        }
      },
    }
  )
)
