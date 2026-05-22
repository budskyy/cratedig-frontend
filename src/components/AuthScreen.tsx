import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { login, register, adminLogin } from '../lib/api'
import { useStore } from '../store'

export default function AuthScreen({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminPw, setAdminPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth, setAdminUnlocked } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'admin') {
        const res = await adminLogin(adminPw)
        setAuth({ user: null, token: res.token, isAdmin: true })
        setAdminUnlocked(true)
        onClose()
      } else if (mode === 'login') {
        const res = await login(email, password)
        setAuth({ user: res.user, token: res.token, isAdmin: res.user.role === 'admin' })
        onClose()
      } else {
        const res = await register(email, password)
        setAuth({ user: res.user, token: res.token, isAdmin: false })
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#c9a84c]/3 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#c9a84c]/2 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#c9a84c]/20 bg-[#c9a84c]/5 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <circle cx="12" cy="12" r="9" stroke="#c9a84c" strokeWidth="1" />
              <circle cx="12" cy="12" r="4" stroke="#c9a84c" strokeWidth="1" />
              <circle cx="12" cy="12" r="1.5" fill="#c9a84c" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-white uppercase">TrueSelector</h1>
          <p className="text-[#555] text-xs mt-1 tracking-wider uppercase">Underground House Discovery</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${mode === m ? 'bg-[#1a1a1a] text-[#e5e5e5]' : 'text-[#444] hover:text-[#666]'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode !== 'admin' ? (
              <motion.div key="user-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address" required
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-[#e5e5e5] placeholder:text-[#333] transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" required minLength={8}
                    className="w-full h-11 pl-9 pr-10 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-[#e5e5e5] placeholder:text-[#333] transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#666]">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="admin-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9a84c]/60" />
                  <input
                    type="password" value={adminPw} onChange={(e) => setAdminPw(e.target.value)}
                    placeholder="Admin password" required
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#0d0d0d] border border-[#c9a84c]/20 text-sm text-[#e5e5e5] placeholder:text-[#333]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all disabled:opacity-50"
            style={{ background: mode === 'admin' ? 'rgba(201,168,76,0.15)' : '#c9a84c', color: mode === 'admin' ? '#c9a84c' : '#000', border: mode === 'admin' ? '1px solid rgba(201,168,76,0.3)' : 'none' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : mode === 'admin' ? 'Unlock Admin' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        {/* Admin link */}
        <button onClick={() => { setMode(mode === 'admin' ? 'login' : 'admin'); setError('') }} className="block w-full mt-4 text-center text-[#333] hover:text-[#555] text-xs transition-colors">
          {mode === 'admin' ? '← Back to login' : 'Admin access'}
        </button>

        {/* Close */}
        <button onClick={onClose} className="absolute -top-10 right-0 text-[#444] hover:text-[#666] text-xs">Skip for now →</button>
      </motion.div>
    </motion.div>
  )
}
