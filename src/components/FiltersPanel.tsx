import { motion } from 'framer-motion'
import { SlidersHorizontal, Search, X, Zap } from 'lucide-react'
import { GENRES, VIBES, GENRE_GROUPS } from '../data/constants'
import { useStore } from '../store'
import type { Platform } from '../types'

function formatPlays(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return n.toString()
}

export default function FiltersPanel({ onClose }: { onClose?: () => void }) {
  const { filters, setFilters } = useStore()

  const hasActive = filters.query !== 'deep house underground' || filters.genre !== 'All Genres' ||
    filters.maxPlays !== 5000 || filters.bpmMin !== undefined || filters.bpmMax !== undefined || filters.vibe

  const reset = () => setFilters({ query: 'deep house underground', genre: 'All Genres', platform: 'soundcloud', maxPlays: 5000, bpmMin: undefined, bpmMax: undefined, vibe: undefined })

  return (
    <div className="flex flex-col gap-5 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[#555]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#888]">Filters</span>
          {hasActive && <span className="px-1.5 py-0.5 rounded bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-[9px] font-semibold">ACTIVE</span>}
        </div>
        <div className="flex items-center gap-2">
          {hasActive && <button onClick={reset} className="text-[10px] text-[#444] hover:text-[#666]">Reset</button>}
          {onClose && <button onClick={onClose} className="text-[#444] hover:text-[#666]"><X size={14} /></button>}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
        <input
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Search…"
          className="w-full h-9 pl-8 pr-8 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-xs text-[#e5e5e5] placeholder:text-[#333]"
        />
        {filters.query && (
          <button onClick={() => setFilters({ query: '' })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#666]">
            <X size={11} />
          </button>
        )}
      </div>

      <div className="h-px bg-[#1a1a1a]" />

      {/* Platform */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#444] mb-2">Platform</p>
        <div className="flex gap-1">
          {(['soundcloud', 'spotify', 'both'] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilters({ platform: p })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all ${filters.platform === p ? 'bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]' : 'border border-[#1a1a1a] text-[#444] hover:text-[#666]'}`}
            >
              {p === 'soundcloud' ? 'SC' : p === 'spotify' ? 'Spotify' : 'Both'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#1a1a1a]" />

      {/* Max Plays */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-[#444]">Max Plays</span>
          <span className="text-[10px] font-mono text-[#c9a84c]">{formatPlays(filters.maxPlays)}</span>
        </div>
        <input type="range" min={500} max={100000} step={500} value={filters.maxPlays}
          onChange={(e) => setFilters({ maxPlays: Number(e.target.value) })} className="w-full" />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#333]">500</span>
          <span className="text-[9px] text-[#333]">100k</span>
        </div>
      </div>

      {/* BPM */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-[#444]">BPM Min</span>
          <span className="text-[10px] font-mono text-[#c9a84c]">{!filters.bpmMin || filters.bpmMin === 80 ? 'any' : filters.bpmMin}</span>
        </div>
        <input type="range" min={80} max={180} step={2} value={filters.bpmMin ?? 80}
          onChange={(e) => setFilters({ bpmMin: Number(e.target.value) === 80 ? undefined : Number(e.target.value) })} className="w-full" />
        <div className="flex justify-between mb-2 mt-3">
          <span className="text-[10px] uppercase tracking-wider text-[#444]">BPM Max</span>
          <span className="text-[10px] font-mono text-[#c9a84c]">{!filters.bpmMax || filters.bpmMax === 180 ? 'any' : filters.bpmMax}</span>
        </div>
        <input type="range" min={80} max={180} step={2} value={filters.bpmMax ?? 180}
          onChange={(e) => setFilters({ bpmMax: Number(e.target.value) === 180 ? undefined : Number(e.target.value) })} className="w-full" />
      </div>

      <div className="h-px bg-[#1a1a1a]" />

      {/* Vibe */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={11} className="text-[#c9a84c]/60" />
          <span className="text-[10px] uppercase tracking-wider text-[#444]">Vibe</span>
        </div>
        {filters.vibe ? (
          <button onClick={() => setFilters({ vibe: undefined })} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]">
            {filters.vibe} <X size={9} />
          </button>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {VIBES.slice(0, 12).map((v) => (
              <button key={v} onClick={() => setFilters({ vibe: v })} className="px-2 py-0.5 rounded-full text-[9px] border border-[#1a1a1a] text-[#444] hover:border-[#c9a84c]/20 hover:text-[#c9a84c]/80 transition-colors">
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-[#1a1a1a]" />

      {/* Genre */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#444] mb-2">Genre</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilters({ genre: 'All Genres' })}
            className={`px-2.5 py-1 rounded-full text-[9px] transition-all ${filters.genre === 'All Genres' ? 'bg-[#c9a84c] text-black font-semibold' : 'border border-[#1a1a1a] text-[#444] hover:border-[#c9a84c]/20 hover:text-[#c9a84c]/80'}`}
          >
            All
          </button>
          {Object.entries(GENRE_GROUPS).map(([group, genres]) => (
            <div key={group} className="w-full">
              <p className="text-[9px] text-[#333] uppercase tracking-wider mt-2 mb-1">{group}</p>
              <div className="flex flex-wrap gap-1">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setFilters({ genre: g })}
                    className={`px-2 py-0.5 rounded-full text-[9px] transition-all ${filters.genre === g ? 'bg-[#c9a84c] text-black font-semibold' : 'border border-[#1a1a1a] text-[#444] hover:border-[#c9a84c]/20 hover:text-[#c9a84c]/80'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
