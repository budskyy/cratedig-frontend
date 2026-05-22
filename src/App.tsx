import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Radio, Network, TrendingUp, Heart, Users, Music,
  Shield, SlidersHorizontal, X, Loader2, AlertCircle,
  Disc3, LogIn, LogOut, ChevronDown, Zap
} from 'lucide-react'
import { searchTracks } from './lib/api'
import { useStore } from './store'
import TrackCard from './components/TrackCard'
import FiltersPanel from './components/FiltersPanel'
import AuthScreen from './components/AuthScreen'
import {
  StationView, RabbitHoleView, ChartsView, CrateView,
  CommunityView, SetBuilderView, AdminView
} from './components/Views'
import type { TabId } from './types'

// ===================== NAV TABS =====================
const TABS: { id: TabId; label: string; icon: any; shortcut: string; requiresAuth?: boolean }[] = [
  { id: 'discover', label: 'Discover', icon: Search, shortcut: '1' },
  { id: 'station', label: 'Station', icon: Radio, shortcut: '2' },
  { id: 'rabbithole', label: 'Rabbit Hole', icon: Network, shortcut: '3' },
  { id: 'charts', label: 'Charts', icon: TrendingUp, shortcut: '4' },
  { id: 'crate', label: 'Crate', icon: Heart, shortcut: '5' },
  { id: 'community', label: 'Community', icon: Users, shortcut: '6' },
  { id: 'setbuilder', label: 'Set Builder', icon: Music, shortcut: '7' },
]

// ===================== LOGO =====================
function VinylLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#c9a84c" strokeWidth="1" />
      <circle cx="16" cy="16" r="10" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4" />
      <circle cx="16" cy="16" r="6" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3" />
      <circle cx="16" cy="16" r="2.5" fill="#c9a84c" />
      <circle cx="16" cy="16" r="1" fill="#000" />
    </svg>
  )
}

// ===================== SCORE LEGEND =====================
function ScoreLegend() {
  return (
    <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#444]">
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Gem: rarity</span>
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />True: quality×underground</span>
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Spam filtered</span>
    </div>
  )
}

// ===================== APP =====================
export default function App() {
  const {
    activeTab, setActiveTab,
    filters, setFilters,
    localCrate, localLikedIds, toggleLocalLike,
    stationSeed, setStationSeed,
    auth, logout,
    adminUnlocked,
  } = useStore()

  const [showAuth, setShowAuth] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const tab = TABS.find((t) => t.shortcut === e.key)
      if (tab) {
        if (tab.id === 'station' && !stationSeed) return
        setActiveTab(tab.id)
      }
      if (e.key === 'f' || e.key === 'F') setShowFilters((v) => !v)
      if (e.key === 'Escape') { setShowAuth(false); setMobileFilters(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [stationSeed, setActiveTab])

  // Main discover query
  const { data: tracks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tracks', filters],
    queryFn: () => searchTracks(filters, 24),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const handleStation = useCallback((track: any) => {
    setStationSeed(track)
    setActiveTab('station')
  }, [setStationSeed, setActiveTab])

  const nonSpamTracks = tracks.filter(t => !t.isSpam || t.qualityScore > 75)
  const spamCount = tracks.length - nonSpamTracks.length

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#f5f5f0]">
      {/* ====== AUTH MODAL ====== */}
      <AnimatePresence>
        {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}
      </AnimatePresence>

      {/* ====== HEADER ====== */}
      <header className="sticky top-0 z-40 border-b border-[#111] bg-black/95 backdrop-blur">
        {/* Top bar */}
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <VinylLogo size={28} />
            </motion.div>
            <div>
              <span className="font-black text-base tracking-[0.15em] uppercase text-white">TrueSelector</span>
              <p className="text-[8px] text-[#444] leading-none tracking-widest uppercase">Underground House Discovery</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#c9a84c]/5 border border-[#c9a84c]/10 text-[#c9a84c]/60 text-[9px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
            Live
          </div>

          {/* Spam filter indicator */}
          {spamCount > 0 && activeTab === 'discover' && (
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/60 text-[9px] uppercase tracking-wider">
              <Zap size={9} />
              {spamCount} filtered
            </div>
          )}

          <ScoreLegend />
          <div className="flex-1" />

          {/* Shortcuts hint */}
          <span className="hidden xl:block text-[9px] text-[#333] tracking-widest uppercase">1–7 tabs · F filters</span>

          {/* Filter toggle (discover tab) */}
          {activeTab === 'discover' && (
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] uppercase tracking-wider transition-all ${showFilters ? 'border-[#c9a84c]/20 text-[#c9a84c]/70 bg-[#c9a84c]/5' : 'border-[#1a1a1a] text-[#444] hover:text-[#666]'}`}
            >
              <SlidersHorizontal size={12} />
              <span className="hidden lg:inline">Filters</span>
            </button>
          )}

          {/* Crate pill */}
          {localCrate.length > 0 && (
            <button
              onClick={() => setActiveTab('crate')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] hover:bg-red-500/15 transition-all"
            >
              <Heart size={11} fill="currentColor" />
              {localCrate.length}
            </button>
          )}

          {/* Auth / user */}
          {auth.user ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#555] hidden sm:block">{auth.user.email.split('@')[0]}</span>
              <button onClick={logout} className="p-2 rounded-xl hover:bg-[#111] text-[#444] hover:text-[#666] transition-colors" title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a1a1a] text-[10px] text-[#555] hover:text-[#888] hover:border-[#222] uppercase tracking-wider transition-all"
            >
              <LogIn size={12} /> Sign In
            </button>
          )}

          {/* Admin pill */}
          {(auth.isAdmin || adminUnlocked) && (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider hover:bg-red-500/15 transition-all"
            >
              <Shield size={10} /> Admin
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="max-w-screen-2xl mx-auto px-4 border-t border-[#0d0d0d]">
          <div className="flex overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const disabled = tab.id === 'station' && !stationSeed
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => !disabled && setActiveTab(tab.id)}
                  disabled={disabled}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[10px] uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex-shrink-0 ${
                    active
                      ? 'border-[#c9a84c] text-[#c9a84c] font-semibold'
                      : disabled
                        ? 'border-transparent text-[#222] cursor-not-allowed'
                        : 'border-transparent text-[#444] hover:text-[#666] hover:border-[#222]'
                  }`}
                >
                  <tab.icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'station' && stationSeed && (
                    <span className="hidden md:inline text-[8px] text-[#c9a84c]/50 ml-0.5 max-w-[50px] truncate">
                      {stationSeed.title?.slice(0, 12)}
                    </span>
                  )}
                  {tab.id === 'crate' && localCrate.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">
                      {localCrate.length > 9 ? '9+' : localCrate.length}
                    </span>
                  )}
                </button>
              )
            })}
            {/* Admin tab (only when unlocked) */}
            {(auth.isAdmin || adminUnlocked) && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[10px] uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === 'admin' ? 'border-red-500 text-red-400 font-semibold' : 'border-transparent text-[#333] hover:text-red-400/60'
                }`}
              >
                <Shield size={12} />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ====== BODY ====== */}
      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar filters */}
        <AnimatePresence>
          {activeTab === 'discover' && showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex flex-col flex-shrink-0 sticky self-start overflow-y-auto border-r border-[#0d0d0d]"
              style={{ top: 97, height: 'calc(100vh - 97px)' }}
            >
              <div className="p-5 w-64">
                <FiltersPanel />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          {/* ====== DISCOVER ====== */}
          {activeTab === 'discover' && (
            <div className="space-y-6">
              {/* Page header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight uppercase">Discover</h1>
                  <p className="text-xs text-[#555] mt-1">Underground house · Under {filters.maxPlays.toLocaleString()} plays · Spam filtered</p>
                </div>
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFilters(!mobileFilters)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1a1a1a] text-[10px] text-[#555] uppercase tracking-wider"
                >
                  <SlidersHorizontal size={12} />
                  Filters
                </button>
              </div>

              {/* Mobile filters */}
              <AnimatePresence>
                {mobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a]">
                      <FiltersPanel onClose={() => setMobileFilters(false)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Platform selector pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {(['soundcloud', 'spotify', 'both'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters({ platform: p })}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border transition-all ${
                      filters.platform === p
                        ? p === 'spotify' ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : p === 'both' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        : 'border-[#1a1a1a] text-[#444] hover:text-[#666]'
                    }`}
                  >
                    {p === 'soundcloud' ? '🟠 SoundCloud' : p === 'spotify' ? '🟢 Spotify' : '⚡ Both'}
                  </button>
                ))}
                {spamCount > 0 && (
                  <span className="px-3 py-1 rounded-full text-[10px] bg-yellow-500/5 border border-yellow-500/10 text-yellow-600 uppercase tracking-wider">
                    ⚡ {spamCount} spam removed
                  </span>
                )}
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex flex-col items-center gap-4 py-24">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <VinylLogo size={48} />
                  </motion.div>
                  <p className="text-[#555] text-sm uppercase tracking-wider">Digging the underground…</p>
                  <p className="text-[#333] text-xs">Under {filters.maxPlays.toLocaleString()} plays · Spam filtering active</p>
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="flex flex-col items-center gap-3 py-24">
                  <AlertCircle size={32} className="text-red-400/40" />
                  <p className="text-[#555] text-sm">Failed to connect to backend</p>
                  <button onClick={() => refetch()} className="text-[#c9a84c] text-xs underline">Try again</button>
                </div>
              )}

              {/* Track grid */}
              {!isLoading && !isError && nonSpamTracks.length > 0 && (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence>
                    {nonSpamTracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        onStation={handleStation}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Empty state */}
              {!isLoading && !isError && nonSpamTracks.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-24">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                    <VinylLogo size={40} />
                  </motion.div>
                  <p className="font-semibold text-[#888]">No tracks found</p>
                  <p className="text-sm text-[#444]">Try adjusting your filters or broadening the search</p>
                  <button
                    onClick={() => setFilters({ query: 'deep house underground', genre: 'All Genres', maxPlays: 5000, bpmMin: undefined, bpmMax: undefined, vibe: undefined })}
                    className="text-xs text-[#c9a84c] underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ====== OTHER TABS ====== */}
          {activeTab === 'station' && <StationView />}
          {activeTab === 'rabbithole' && <RabbitHoleView />}
          {activeTab === 'charts' && <ChartsView />}
          {activeTab === 'crate' && <CrateView />}
          {activeTab === 'community' && <CommunityView />}
          {activeTab === 'setbuilder' && <SetBuilderView />}
          {activeTab === 'admin' && <AdminView />}

          {/* ====== FOOTER ====== */}
          <footer className="mt-20 pt-6 border-t border-[#0d0d0d] flex items-center justify-between text-[10px] text-[#333] flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <VinylLogo size={14} />
              <span className="font-bold uppercase tracking-wider text-[#444]">TrueSelector</span>
            </div>
            <span>
              Created by{' '}
              <a href="https://contina.bass.fan" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors">
                @continadj
              </a>
            </span>
            <span className="text-[#222] uppercase tracking-widest">Underground House · No Compromise</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
