import type { UnifiedTrack, Filters, CommunityFeedItem, PlatformMetrics } from '../types'

const BASE = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:5000'

function url(path: string, params?: Record<string, string | number | undefined>) {
  const u = new URL(path, BASE)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '' && v !== 'All Genres') u.searchParams.set(k, String(v))
    }
  }
  return u.toString()
}

function authHeaders(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch<T>(endpoint: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, { credentials: 'include', ...opts })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// ===================== SEARCH =====================

export async function searchTracks(filters: Filters, limit = 24): Promise<UnifiedTrack[]> {
  return apiFetch(url('/api/search', {
    q: filters.query || 'deep house underground',
    platform: filters.platform,
    maxPlays: filters.maxPlays,
    bpmMin: filters.bpmMin,
    bpmMax: filters.bpmMax,
    genre: filters.genre !== 'All Genres' ? filters.genre : undefined,
    vibe: filters.vibe,
    limit,
  }))
}

export async function getRelated(trackId: string, platform = 'soundcloud'): Promise<UnifiedTrack[]> {
  return apiFetch(url(`/api/related/${trackId}`, { platform }))
}

export async function getCharts(scene?: string, limit = 20): Promise<UnifiedTrack[]> {
  return apiFetch(url('/api/charts', { scene, limit }))
}

// ===================== AUTH =====================

export async function register(email: string, password: string) {
  return apiFetch<{ token: string; user: { id: string; email: string; role: string; createdAt: string } }>(
    url('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
}

export async function login(email: string, password: string) {
  return apiFetch<{ token: string; user: { id: string; email: string; role: string; createdAt: string } }>(
    url('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
}

export async function adminLogin(password: string) {
  return apiFetch<{ token: string; role: string }>(
    url('/api/auth/admin'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
}

// ===================== USER =====================

export async function getCrate(token: string): Promise<UnifiedTrack[]> {
  return apiFetch(url('/api/user/crate'), { headers: authHeaders(token) })
}

export async function toggleLike(track: UnifiedTrack, token: string) {
  return apiFetch(url('/api/user/like'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ trackId: track.id, track })
  })
}

export async function getCommunityFeed(limit = 30): Promise<CommunityFeedItem[]> {
  return apiFetch(url('/api/community/feed', { limit }))
}

// ===================== ADMIN =====================

export async function getAdminMetrics(token: string): Promise<PlatformMetrics> {
  return apiFetch(url('/api/admin/metrics'), { headers: authHeaders(token) })
}

export async function tuneEngine(tuning: Record<string, number>, token: string) {
  return apiFetch(url('/api/admin/tune'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(tuning)
  })
}

// ===================== UTILS =====================

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

export function formatPlays(n: number | null): string {
  if (!n) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return n.toString()
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#c9a84c'
  if (score >= 40) return '#666'
  return '#444'
}

export function spamLabel(score: number): string {
  if (score >= 80) return 'Spam'
  if (score >= 60) return 'Suspect'
  if (score >= 40) return 'Mixed'
  return 'Clean'
}
