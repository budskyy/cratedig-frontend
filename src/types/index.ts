export type Platform = 'soundcloud' | 'spotify' | 'both'

export interface UnifiedTrack {
  id: string
  title: string
  artist: string
  artistUrl: string
  artworkUrl: string
  permalinkUrl: string
  playbackCount: number | null
  duration: number
  bpm: number | null
  genre: string
  tagList: string
  description: string
  createdAt: string
  platform: Platform
  waveformUrl: string
  spotifyPreviewUrl?: string
  spamScore: number
  qualityScore: number
  undergroundScore: number
  gemScore: number
  momentumScore: number
  trueScore: number
  vibeTag: string
  isSpam: boolean
}

export interface User {
  id: string
  email: string
  role: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAdmin: boolean
}

export interface Filters {
  query: string
  genre: string
  platform: Platform
  maxPlays: number
  bpmMin?: number
  bpmMax?: number
  vibe?: string
}

export type TabId = 'discover' | 'station' | 'rabbithole' | 'charts' | 'crate' | 'community' | 'setbuilder' | 'admin' | 'profile'

export interface CommunityFeedItem {
  userId: string
  trackId: string
  track: UnifiedTrack | null
  likedAt: string
}

export interface PlatformMetrics {
  totalSearches: number
  totalLikes: number
  topGenres: Record<string, number>
  recentSearches: string[]
  apiLatency: string
  cacheHitRate: string
  scClientStatus: string
  uptime: string
}
