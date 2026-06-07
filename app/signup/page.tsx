'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mic, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1. Register user with email_confirm: true on the backend
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const signupData = await res.json()
      if (!res.ok) throw new Error(signupData.error || 'Signup failed')

      // Save name for demo profile fallback
      localStorage.setItem('vocalis_signup_name', name)

      // 2. Immediately log the user in using the credentials they just submitted
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        console.warn('Auto-login failed after admin signup:', loginError.message)
      }

      // 3. Redirect immediately to onboarding (no email links, no validation screens)
      router.push('/onboarding')
    } catch (err: any) {
      const msg = err.message || 'Signup failed'
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('limit exceeded')) {
        setError('For security, we can only process one signup request every 60 seconds. Please wait a moment.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-4 md:p-8 font-sans">
      {/* Container Card */}
      <div className="w-full max-w-[1000px] min-h-[640px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 grid md:grid-cols-2">
        
        {/* Left Side: Brand Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 text-white relative overflow-hidden">
          {/* Background Image and Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/login_brand_bg.png" 
              alt="Voice Translation Illustration" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0a0c16]/75 backdrop-blur-[1px]" />
          </div>

          <Link href="/" className="inline-flex items-center gap-2 relative z-10">
            <img src="/logo.png" alt="Vocalis AI Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-white">Vocalis AI</span>
          </Link>

          <div className="space-y-4 relative z-10">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Speak Globally. <br/>
              Clone Instantly. <br/>
              Connect Effortlessly.
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Upload a sample of your voice, choose from 30+ target languages, and translate audio in your own cloned voice with matching tone, emotion, and style.
            </p>
          </div>

          <div className="text-xs text-gray-400 relative z-10">
            © 2026 Vocalis AI Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form (Light Theme) */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white z-10">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-sm text-gray-500 mt-1">Start speaking globally in your own voice — it's free.</p>
            </div>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in-up">
                <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-1">Check your email</h3>
                <p className="text-sm text-green-700">Check <strong>{email}</strong> to verify your account, then you can log in.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
                      placeholder="Alex Johnson"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? (passwordStrength === 1 ? 'bg-red-400' : passwordStrength === 2 ? 'bg-amber-400' : 'bg-green-400') : 'bg-gray-100'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    Create Account <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Google login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all text-sm cursor-pointer bg-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

              </div>
            )}

            {/* Switch to Login */}
            <p className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                Sign in here
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}
