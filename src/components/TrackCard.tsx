import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, Heart, ExternalLink, X, Plus, TrendingUp, AlertTriangle } from 'lucide-react'
import type { UnifiedTrack } from '../types'
import { formatDuration, formatPlays, scoreColor } from '../lib/api'
import { useStore } from '../store'

interface Props {
  track: UnifiedTrack
  onStation?: (t: UnifiedTrack) => void
  compact?: boolean
  rank?: number
}

function WaveformIcon() {
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[4,7,5,8,3,6,4].map((h, i) => (
        <div
          key={i}
          className="waveform-bar w-0.5 bg-yellow-400 rounded-full"
          style={{ height: h * 2, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  )
}

export default function TrackCard({ track, onStation, compact = false, rank }: Props) {
  const [showEmbed, setShowEmbed] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { localLikedIds, toggleLocalLike, auth, addToSetBuilder, setNowPlaying, setIsPlaying, nowPlaying, isPlaying } = useStore()

  const liked = localLikedIds.has(track.id)
  const isCurrentlyPlaying = nowPlaying?.id === track.id && isPlaying
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(track.permalinkUrl)}&color=%23c9a84c&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLocalLike(track)
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (track.platform === 'soundcloud') setShowEmbed(true)
    else if (track.spotifyPreviewUrl) { setNowPlaying(track); setIsPlaying(true) }
  }

  const vibeColor = {
    'Warm Up': '#6b7280', 'Groove Builder': '#8b5cf6', 'Deep': '#3b82f6',
    'Rollers': '#10b981', 'Heads Down': '#f59e0b', 'Hypnotic': '#8b5cf6',
    'Late Night': '#6366f1', 'Warehouse': '#ef4444', 'Peak Time': '#f97316',
    'Dancefloor Weapon': '#ec4899', 'Afters': '#6366f1', 'Sunrise': '#f59e0b',
    'Soulful': '#10b981', 'Minimal': '#9ca3af', 'Percussive': '#f59e0b',
    'Dark': '#6b7280', 'Bassline Heavy': '#3b82f6', 'Organ Groove': '#8b5cf6',
    'Vocal Hook': '#ec4899',
  }[track.vibeTag] ?? '#666'

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center gap-3 p-3 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] bg-[#0d0d0d] hover:bg-[#111] transition-all"
      >
        {rank && <span className="w-6 text-center text-xs text-[#444] font-mono flex-shrink-0">{rank}</span>}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
          {track.artworkUrl && !imgError ? (
            <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#333]">
              <div className="w-3 h-3 rounded-full border border-[#333]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e5e5e5] truncate">{track.title}</p>
          <p className="text-xs text-[#555] truncate">{track.artist}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-mono" style={{ color: scoreColor(track.gemScore) }}>{track.gemScore}</span>
          <span className="text-xs text-[#444] font-mono hidden sm:block">{formatPlays(track.playbackCount)}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onStation && (
            <button onClick={() => onStation(track)} className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#555] hover:text-[#c9a84c] transition-colors">
              <Radio size={13} />
            </button>
          )}
          <button onClick={handleLike} className={`p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors ${liked ? 'text-red-500' : 'text-[#555] hover:text-red-400'}`}>
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <a href={track.permalinkUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#555] hover:text-[#c9a84c] transition-colors">
            <ExternalLink size={13} />
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-2xl border bg-[#0d0d0d] overflow-hidden flex flex-col track-card-hover transition-all ${track.isSpam ? 'opacity-60 border-[#1a1a1a]' : 'border-[#1a1a1a]'}`}
    >
      {/* Spam warning */}
      {track.spamScore > 40 && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[9px] font-medium">
          <AlertTriangle size={8} />
          {track.spamScore > 70 ? 'Likely Spam' : 'Suspected'}
        </div>
      )}

      {/* Platform badge */}
      <div className={`absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${track.platform === 'spotify' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>
        {track.platform === 'spotify' ? 'SPT' : 'SC'}
      </div>

      {/* Artwork */}
      <div className="relative h-44 overflow-hidden bg-[#111] cursor-pointer" onClick={handlePlay}>
        {showEmbed ? (
          <>
            <iframe src={embedUrl} className="w-full h-full" allow="autoplay" title={track.title} />
            <button onClick={(e) => { e.stopPropagation(); setShowEmbed(false) }} className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors">
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            {track.artworkUrl && !imgError ? (
              <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                <div className="w-16 h-16 rounded-full border border-[#333] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#333]" />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full border border-[#c9a84c]/60 bg-black/60 backdrop-blur flex items-center justify-center">
                {isCurrentlyPlaying ? <WaveformIcon /> : (
                  <svg viewBox="0 0 24 24" fill="#c9a84c" className="w-5 h-5 ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.div>
            </div>

            {/* Vibe tag */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm" style={{ color: vibeColor, borderColor: `${vibeColor}30`, background: `${vibeColor}10` }}>
              {track.vibeTag}
            </div>

            {/* Momentum badge */}
            {track.momentumScore >= 65 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 text-[#c9a84c] text-[9px]">
                <TrendingUp size={8} /> Rising
              </div>
            )}

            {/* Plays */}
            {track.playbackCount != null && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] text-[#999] bg-black/50 backdrop-blur-sm">
                {formatPlays(track.playbackCount)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1 gap-2">
        {/* Artist row */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#555] truncate flex-1">{track.artist}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-mono" style={{ color: scoreColor(track.gemScore) }}>{track.gemScore}</span>
            <span className="text-[#333] text-[10px]">·</span>
            <span className="text-[10px] font-mono text-[#c9a84c]/60">{Math.round(track.trueScore)}</span>
          </div>
        </div>

        {/* Title */}
        <p className="font-semibold text-sm text-[#e5e5e5] leading-snug line-clamp-2">{track.title}</p>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[11px] text-[#444] font-mono">
          {track.bpm && <span className="text-[#c9a84c]/80">{track.bpm}</span>}
          {track.bpm && <span>·</span>}
          <span>{formatDuration(track.duration)}</span>
          {track.createdAt && <><span>·</span><span>{new Date(track.createdAt).getFullYear()}</span></>}
        </div>

        {/* Genre */}
        {track.genre && (
          <span className="self-start px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-[#222] text-[10px] text-[#666]">{track.genre}</span>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          {onStation && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onStation(track)}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-[#1a1a1a] hover:bg-[#c9a84c]/10 border border-[#222] hover:border-[#c9a84c]/30 text-[#666] hover:text-[#c9a84c] text-xs font-medium transition-all"
            >
              <Radio size={12} /> Dig Similar
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all ${liked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#1a1a1a] border-[#222] text-[#555] hover:border-red-500/20 hover:text-red-400'}`}
          >
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addToSetBuilder(track)}
            className="h-8 w-8 rounded-xl flex items-center justify-center bg-[#1a1a1a] border border-[#222] text-[#555] hover:border-[#c9a84c]/20 hover:text-[#c9a84c] transition-all"
            title="Add to Set Builder"
          >
            <Plus size={13} />
          </motion.button>
          <a
            href={track.permalinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 rounded-xl flex items-center justify-center bg-[#1a1a1a] border border-[#222] text-[#555] hover:border-[#c9a84c]/20 hover:text-[#c9a84c] transition-all"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
