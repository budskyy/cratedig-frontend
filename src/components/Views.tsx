import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio, Network, TrendingUp, Heart, Users, Music, Shield,
  Loader2, AlertCircle, ChevronRight, Download, Trash2,
  Settings2, Database, Activity, TrendingUp as TrendingUpIcon
} from 'lucide-react'
import TrackCard from '../components/TrackCard'
import { getRelated, getCharts, getCommunityFeed, getAdminMetrics, tuneEngine, formatDuration, formatPlays, scoreColor } from '../lib/api'
import { useStore } from '../store'
import { SCENES } from '../data/constants'
import type { UnifiedTrack } from '../types'

type Scene = typeof SCENES[number]

// ===================== STATION VIEW =====================
export function StationView() {
  const { stationSeed, setStationSeed, setActiveTab } = useStore()
  const [chain, setChain] = useState<UnifiedTrack[]>(stationSeed ? [stationSeed] : [])
  const current = chain[chain.length - 1]

  const { data: related = [], isLoading, isError } = useQuery({
    queryKey: ['related', current?.id],
    queryFn: () => getRelated(current!.id, current!.platform),
    enabled: !!current,
  })

  const digDeeper = (track: UnifiedTrack) => { setChain((c) => [...c, track]); setStationSeed(track) }
  const goBack = () => setChain((c) => c.slice(0, -1))

  if (!stationSeed || !current) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-20 h-20 rounded-full border border-[#1a1a1a] flex items-center justify-center">
          <Radio size={32} className="text-[#333]" />
        </div>
        <p className="font-semibold text-[#888]">No station loaded</p>
        <p className="text-sm text-[#444] max-w-xs">Hit "Dig Similar" on any track to start a station</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {chain.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {chain.map((t, i) => (
            <div key={`${t.id}-${i}`} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={11} className="text-[#333]" />}
              <span className={`px-2.5 py-1 rounded-full text-[10px] truncate max-w-[100px] ${i === chain.length - 1 ? 'bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]' : 'bg-[#111] border border-[#1a1a1a] text-[#444]'}`}>
                {i === 0 ? 'Start' : t.title?.slice(0, 18)}
              </span>
            </div>
          ))}
          <button onClick={goBack} className="text-[10px] text-[#444] hover:text-[#666] ml-1">← Back</button>
        </div>
      )}
      <div className="relative rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden p-5">
        {current.artworkUrl && (
          <div className="absolute inset-0 opacity-5 blur-3xl scale-110 bg-cover bg-center" style={{ backgroundImage: `url(${current.artworkUrl})` }} />
        )}
        <div className="relative flex gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
            {current.artworkUrl && <img src={current.artworkUrl} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-[10px] text-[#c9a84c] font-medium uppercase tracking-wider">
                <Radio size={10} /> Station Mode
              </span>
              {chain.length > 1 && <span className="text-[9px] text-[#444] border border-[#222] px-1.5 py-0.5 rounded">Depth {chain.length}</span>}
            </div>
            <p className="font-semibold text-sm text-[#e5e5e5] mb-1 line-clamp-2">{current.title}</p>
            <p className="text-xs text-[#555] mb-1">{current.artist}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {current.genre && <span className="text-[9px] border border-[#1a1a1a] text-[#444] px-1.5 py-0.5 rounded-full">{current.genre}</span>}
              <span className="text-[10px] text-[#444] font-mono">{formatDuration(current.duration)}</span>
              <span className="text-[10px] font-mono" style={{ color: scoreColor(current.gemScore) }}>gem {current.gemScore}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-xs text-[#555]">
        <ChevronRight size={12} className="mt-0.5 text-[#c9a84c]/60 flex-shrink-0" />
        SoundCloud's recommendation engine surfaces tracks with similar sonic signatures. Each "Dig Similar" takes you deeper.
      </div>
      {isLoading && <div className="flex items-center gap-2 text-[#444] justify-center py-12"><Loader2 size={16} className="animate-spin" /><span className="text-sm">Finding related…</span></div>}
      {isError && <div className="flex items-center gap-2 text-red-400/60 justify-center py-12"><AlertCircle size={16} /><span className="text-sm">Failed to load</span></div>}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {related.map((t) => <TrackCard key={t.id} track={t} onStation={digDeeper} />)}
        </div>
      )}
    </div>
  )
}

// ===================== RABBIT HOLE VIEW =====================
export function RabbitHoleView() {
  const [inputUrl, setInputUrl] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<UnifiedTrack[]>([])
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')
  const { setStationSeed } = useStore()

  const { data: related = [], isLoading } = useQuery({
    queryKey: ['rabbithole', activeId],
    queryFn: () => getRelated(activeId!),
    enabled: !!activeId,
  })

  const resolveAndDig = async () => {
    if (!inputUrl.trim()) return
    setIsResolving(true)
    setResolveError('')
    try {
      const directMatch = inputUrl.match(/\/tracks\/(\d+)/)
      if (directMatch) { setActiveId(directMatch[1]); setBreadcrumbs([]); return }
      const res = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(inputUrl)}`)
      const data = await res.json()
      const idMatch = (data.html || '').match(/tracks%2F(\d+)|tracks\/(\d+)/)
      if (idMatch) { setActiveId(idMatch[1] ?? idMatch[2]); setBreadcrumbs([]) }
      else setResolveError('Could not resolve this SoundCloud URL')
    } catch { setResolveError('Failed to resolve URL') }
    finally { setIsResolving(false) }
  }

  const digDeeper = (track: UnifiedTrack) => {
    if (activeId) setBreadcrumbs((b) => [...b, track])
    setActiveId(track.id)
    setStationSeed(track)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Network size={18} className="text-violet-400" /></div>
        <div><h2 className="font-bold text-lg tracking-tight">Rabbit Hole</h2><p className="text-xs text-[#555]">Infinite underground traversal</p></div>
      </div>
      <div className="flex gap-2">
        <input value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="Paste a SoundCloud track URL…"
          className="flex-1 h-10 px-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-[#e5e5e5] placeholder:text-[#333]" />
        <motion.button whileTap={{ scale: 0.97 }} onClick={resolveAndDig} disabled={isResolving}
          className="px-4 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm hover:bg-violet-500/30 transition-all flex items-center gap-2">
          {isResolving ? <Loader2 size={14} className="animate-spin" /> : <Network size={14} />} Dig
        </motion.button>
      </div>
      {resolveError && <div className="text-red-400 text-xs p-3 rounded-xl bg-red-500/5 border border-red-500/10">{resolveError}</div>}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap text-[10px] text-[#444]">
          <button onClick={() => { setActiveId(null); setBreadcrumbs([]) }}>Start</button>
          {breadcrumbs.map((b, i) => (
            <div key={`${b.id}-${i}`} className="flex items-center gap-1">
              <ChevronRight size={10} />
              <span className="text-[#555] max-w-[80px] truncate">{b.title?.slice(0, 15)}</span>
            </div>
          ))}
          <span className="ml-2 text-violet-400">({breadcrumbs.length} levels deep)</span>
        </div>
      )}
      {!activeId && !isResolving && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-center"><Network size={28} className="text-violet-400/40" /></div>
          <p className="font-semibold text-[#888]">Paste any SoundCloud track URL above</p>
          <p className="text-sm text-[#444] max-w-xs">Follow the sonic thread indefinitely. Each "Dig Similar" reveals the next layer of the underground.</p>
        </div>
      )}
      {isLoading && <div className="flex items-center gap-2 text-violet-400/60 justify-center py-12"><Loader2 size={16} className="animate-spin" /></div>}
      {!isLoading && related.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {related.map((t) => <TrackCard key={t.id} track={t} onStation={digDeeper} />)}
        </div>
      )}
    </div>
  )
}

// ===================== CHARTS VIEW =====================
export function ChartsView() {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0])
  const { setStationSeed, setActiveTab } = useStore()

  const { data: tracks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['charts', activeScene],
    queryFn: () => getCharts(activeScene, 20),
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center"><TrendingUp size={18} className="text-[#c9a84c]" /></div>
        <div><h2 className="font-bold text-lg tracking-tight">Underground Charts</h2><p className="text-xs text-[#555]">Ranked by TrueScore — rarity × quality × momentum</p></div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SCENES.map((scene) => (
          <button key={scene} onClick={() => setActiveScene(scene)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${activeScene === scene ? 'bg-[#c9a84c] text-black font-semibold' : 'border border-[#1a1a1a] text-[#555] hover:border-[#c9a84c]/20 hover:text-[#c9a84c]/80'}`}>
            {scene}
          </button>
        ))}
      </div>
      {isLoading && <div className="flex items-center gap-2 text-[#c9a84c]/60 justify-center py-12"><Loader2 size={16} className="animate-spin" /></div>}
      {isError && <div className="flex items-center gap-2 text-red-400/60 justify-center py-12"><AlertCircle size={16} /><button onClick={() => refetch()} className="underline text-xs ml-1">Retry</button></div>}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-2">
          {tracks.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#c9a84c]/10 transition-all">
              <span className="w-7 text-center text-xs text-[#333] font-mono flex-shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1).padStart(2, ' ')}
              </span>
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                {t.artworkUrl && <img src={t.artworkUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e5e5e5] truncate">{t.title}</p>
                <p className="text-xs text-[#555] truncate">{t.artist}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-xs font-mono" style={{ color: scoreColor(t.gemScore) }}>gem {t.gemScore}</span>
                <span className="text-[10px] text-[#c9a84c]/60 font-mono">true {Math.round(t.trueScore)}</span>
                <span className="text-[10px] text-[#333] font-mono hidden sm:block">{formatPlays(t.playbackCount)}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setStationSeed(t); setActiveTab('station') }} className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#555] hover:text-[#c9a84c] transition-colors"><Radio size={13} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================== CRATE VIEW =====================
export function CrateView() {
  const { localCrate, toggleLocalLike, setStationSeed, setActiveTab } = useStore()
  const [sortMode, setSortMode] = useState<'saved' | 'gem' | 'plays'>('saved')

  const sorted = [...localCrate].sort((a, b) => {
    if (sortMode === 'gem') return b.gemScore - a.gemScore
    if (sortMode === 'plays') return (a.playbackCount ?? 0) - (b.playbackCount ?? 0)
    return 0
  })

  const exportCrate = () => {
    const text = `TrueSelector Export — ${new Date().toLocaleDateString()}\n${'─'.repeat(60)}\n\n` +
      localCrate.map((t, i) => `${i + 1}. ${t.title} — ${t.artist} | ${formatPlays(t.playbackCount)} plays | TrueScore: ${Math.round(t.trueScore)} | ${t.permalinkUrl}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `trueselector-crate-${Date.now()}.txt`
    a.click()
  }

  if (localCrate.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <div className="w-20 h-20 rounded-full border border-[#1a1a1a] flex items-center justify-center"><Heart size={32} className="text-[#333]" /></div>
      <p className="font-semibold text-[#888]">Your crate is empty</p>
      <p className="text-sm text-[#444] max-w-xs">Heart any track to save it. Your crate persists across sessions.</p>
    </div>
  )

  const avgGem = Math.round(localCrate.reduce((s, t) => s + t.gemScore, 0) / localCrate.length)
  const avgTrue = Math.round(localCrate.reduce((s, t) => s + t.trueScore, 0) / localCrate.length)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {([['Saved', localCrate.length], ['Avg Gem', avgGem], ['Avg True', avgTrue]] as [string, number][]).map(([l, v]) => (
          <div key={l} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-3 text-center">
            <p className="text-xl font-bold text-[#e5e5e5]">{v}</p>
            <p className="text-[10px] text-[#444] uppercase tracking-wider mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a]">
          {([['saved', 'Saved'], ['gem', 'Gem Score'], ['plays', 'Obscurity']] as [string, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setSortMode(id as 'saved' | 'gem' | 'plays')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all ${sortMode === id ? 'bg-[#c9a84c]/10 text-[#c9a84c]' : 'text-[#444] hover:text-[#666]'}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={exportCrate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a1a1a] text-[10px] text-[#555] hover:text-[#888] uppercase tracking-wider transition-colors ml-auto">
          <Download size={11} /> Export
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((t, i) => (
          <div key={t.id} className="group flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#1f1f1f] transition-all">
            <span className="w-6 text-center text-xs text-[#333] font-mono flex-shrink-0">{i + 1}</span>
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
              {t.artworkUrl && <img src={t.artworkUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e5e5e5] truncate">{t.title}</p>
              <p className="text-xs text-[#555] truncate">{t.artist}</p>
            </div>
            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setStationSeed(t); setActiveTab('station') }} className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#555] hover:text-[#c9a84c] transition-colors"><Radio size={13} /></button>
              <button onClick={() => toggleLocalLike(t)} className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#555] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================== COMMUNITY VIEW =====================
export function CommunityView() {
  const { data: feed = [], isLoading } = useQuery({
    queryKey: ['community-feed'],
    queryFn: () => getCommunityFeed(30),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users size={18} className="text-blue-400" /></div>
        <div><h2 className="font-bold text-lg tracking-tight">Community</h2><p className="text-xs text-[#555]">What selectors are discovering right now</p></div>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
        </div>
      </div>
      {isLoading && <div className="flex items-center gap-2 text-[#444] justify-center py-12"><Loader2 size={16} className="animate-spin" /></div>}
      {feed.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Users size={32} className="text-[#333]" />
          <p className="text-[#666] text-sm">No community activity yet. Be the first to save a track!</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {feed.filter(f => f.track).map((item, i) => (
          <motion.div key={`${item.userId}-${item.trackId}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-[#444]">{item.userId.slice(0, 2).toUpperCase()}</span>
            </div>
            {item.track?.artworkUrl && (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"><img src={item.track.artworkUrl} alt="" className="w-full h-full object-cover" /></div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#e5e5e5] truncate">{item.track?.title}</p>
              <p className="text-[10px] text-[#555]">{item.track?.artist} · saved {new Date(item.likedAt).toLocaleDateString()}</p>
            </div>
            <Heart size={12} className="text-red-400 flex-shrink-0" fill="currentColor" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ===================== SET BUILDER VIEW =====================
export function SetBuilderView() {
  const { setBuilderTracks, removeFromSetBuilder, clearSetBuilder } = useStore()
  const [sortBy, setSortBy] = useState<'bpm' | 'energy' | 'added'>('added')

  const sorted = [...setBuilderTracks].sort((a, b) => {
    if (sortBy === 'bpm') return (a.bpm ?? 0) - (b.bpm ?? 0)
    if (sortBy === 'energy') return b.gemScore - a.gemScore
    return 0
  })

  const avgBpm = setBuilderTracks.filter(t => t.bpm).reduce((s, t) => s + (t.bpm ?? 0), 0) / (setBuilderTracks.filter(t => t.bpm).length || 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Music size={18} className="text-purple-400" /></div>
        <div><h2 className="font-bold text-lg tracking-tight">Set Builder</h2><p className="text-xs text-[#555]">Build and plan your DJ set</p></div>
      </div>
      {setBuilderTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Music size={32} className="text-[#333]" />
          <p className="text-[#666] text-sm">Hit the + button on any track card to add it here</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {([['Tracks', setBuilderTracks.length], ['Avg BPM', Math.round(avgBpm) || '—'], ['Duration', `${Math.round(setBuilderTracks.reduce((s, t) => s + t.duration, 0) / 60000)}m`]] as [string, string | number][]).map(([l, v]) => (
              <div key={l} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-3 text-center">
                <p className="text-xl font-bold text-[#e5e5e5]">{v}</p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
            <p className="text-[10px] text-[#444] uppercase tracking-wider mb-3">BPM Progression</p>
            <div className="flex items-end gap-1 h-12">
              {sorted.filter(t => t.bpm).map((t) => {
                const h = ((t.bpm ?? 120) - 80) / (180 - 80) * 100
                return (
                  <motion.div key={t.id} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                    className="flex-1 rounded-sm bg-[#c9a84c]/40 min-h-[4px]" title={`${t.bpm} BPM`} />
                )
              })}
            </div>
          </div>
          <div className="flex gap-2">
            {([['added', 'Order Added'], ['bpm', 'Sort by BPM'], ['energy', 'Sort by Energy']] as [string, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setSortBy(id as 'bpm' | 'energy' | 'added')}
                className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider border transition-all ${sortBy === id ? 'border-[#c9a84c]/30 text-[#c9a84c] bg-[#c9a84c]/5' : 'border-[#1a1a1a] text-[#444]'}`}>
                {label}
              </button>
            ))}
            <button onClick={clearSetBuilder} className="ml-auto px-3 py-1.5 rounded-xl text-[10px] text-[#444] border border-[#1a1a1a] hover:text-red-400 hover:border-red-500/20 transition-all uppercase tracking-wider">
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {sorted.map((t, i) => (
              <div key={t.id} className="group flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <span className="text-xs text-[#333] font-mono w-5 flex-shrink-0">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                  {t.artworkUrl && <img src={t.artworkUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e5e5e5] truncate">{t.title}</p>
                  <p className="text-xs text-[#555]">{t.artist}</p>
                </div>
                {t.bpm && <span className="text-xs font-mono text-[#c9a84c]/60 flex-shrink-0">{t.bpm}</span>}
                <span className="text-xs text-[#333] font-mono flex-shrink-0">{formatDuration(t.duration)}</span>
                <button onClick={() => removeFromSetBuilder(t.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-400 transition-all"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ===================== ADMIN VIEW =====================
export function AdminView() {
  const { auth } = useStore()
  const [activeSection, setActiveSection] = useState<'dashboard' | 'trends' | 'engine' | 'system'>('dashboard')
  const [tuning, setTuning] = useState({ undergroundStrictness: 1.0, freshnessWeighting: 1.0, antiSpamAggressiveness: 1.0, rarityWeighting: 1.0 })

  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => getAdminMetrics(auth.token!),
    enabled: !!auth.token && auth.isAdmin,
    refetchInterval: 10000,
  })

  const handleTune = async () => {
    if (!auth.token) return
    await tuneEngine(tuning, auth.token)
  }

  const NAV = [
    { id: 'dashboard', label: 'Activity', icon: Activity },
    { id: 'trends', label: 'Trends', icon: TrendingUpIcon },
    { id: 'engine', label: 'Engine', icon: Settings2 },
    { id: 'system', label: 'System', icon: Database },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Shield size={18} className="text-red-400" /></div>
        <div><h2 className="font-bold text-lg tracking-tight">Admin Dashboard</h2><p className="text-xs text-[#555]">Live platform metrics and engine control</p></div>
      </div>
      <div style={{ background: '#080808' }} className="rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex border-b border-white/5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id as 'dashboard' | 'trends' | 'engine' | 'system')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeSection === id ? 'bg-red-500/10 text-red-300 border-b-2 border-red-500' : 'text-white/30 border-b-2 border-transparent hover:text-white/50'}`}>
              <Icon size={13} /><span className="hidden sm:inline uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeSection === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { l: 'Searches', v: metrics?.totalSearches ?? 0, c: 'text-blue-400' },
                  { l: 'Likes', v: metrics?.totalLikes ?? 0, c: 'text-red-400' },
                  { l: 'API Latency', v: metrics?.apiLatency ?? '—', c: 'text-cyan-400' },
                  { l: 'Cache Hit', v: metrics?.cacheHitRate ?? '—', c: 'text-violet-400' },
                  { l: 'SC Client', v: metrics?.scClientStatus ?? '—', c: 'text-orange-400' },
                  { l: 'Uptime', v: metrics?.uptime ?? '—', c: 'text-green-400' },
                ].map((m) => (
                  <div key={m.l} style={{ background: 'rgba(255,255,255,0.02)' }} className="rounded-xl p-3 border border-white/5">
                    <p className={`text-lg font-bold font-mono ${m.c}`}>{m.v}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">{m.l}</p>
                  </div>
                ))}
              </div>
              {metrics?.recentSearches && metrics.recentSearches.length > 0 && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {metrics.recentSearches.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] text-white/40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeSection === 'engine' && (
            <div className="space-y-5">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-300/70">⚠️ Admin only — changes affect global discovery</div>
              {[
                { key: 'undergroundStrictness', label: 'Underground Strictness' },
                { key: 'freshnessWeighting', label: 'Freshness Weighting' },
                { key: 'antiSpamAggressiveness', label: 'Anti-Spam Aggressiveness' },
                { key: 'rarityWeighting', label: 'Rarity Weighting' },
              ].map((ctrl) => (
                <div key={ctrl.key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-white/50">{ctrl.label}</span>
                    <span className="text-xs text-[#c9a84c] font-mono">{(tuning as Record<string, number>)[ctrl.key].toFixed(2)}</span>
                  </div>
                  <input type="range" min={0} max={2} step={0.1} value={(tuning as Record<string, number>)[ctrl.key]}
                    onChange={(e) => setTuning((t) => ({ ...t, [ctrl.key]: Number(e.target.value) }))}
                    className="w-full" />
                </div>
              ))}
              <button onClick={handleTune} className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm hover:bg-red-500/20 transition-all">Apply Tuning</button>
            </div>
          )}
          {activeSection === 'system' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[['Backend', 'Online', 'text-green-400'], ['SC Client', 'Active', 'text-green-400'], ['Spotify', 'Optional', 'text-amber-400'], ['SignalR', 'Live', 'text-green-400'], ['Auth', 'JWT', 'text-blue-400'], ['DB', 'Postgres/Mem', 'text-violet-400']].map(([n, s, c]) => (
                  <div key={n} style={{ background: 'rgba(255,255,255,0.02)' }} className="rounded-xl p-3 border border-white/5">
                    <p className={`text-sm font-semibold ${c}`}>{s}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{n}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeSection === 'trends' && (
            <div className="space-y-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Top Genres</p>
              {metrics?.topGenres && Object.entries(metrics.topGenres).map(([genre, count]) => (
                <div key={genre} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-32 flex-shrink-0 truncate">{genre}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c9a84c] rounded-full" style={{ width: `${Math.min(100, count * 10)}%` }} />
                  </div>
                  <span className="text-[10px] text-white/30 font-mono w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
