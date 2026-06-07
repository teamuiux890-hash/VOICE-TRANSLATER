'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mic, ArrowRight, Check, Briefcase, Video, GraduationCap, User, Loader2 } from 'lucide-react'

const USE_CASES = [
  { id: 'content', icon: <Video className="w-6 h-6" />, label: 'Content Creation', desc: 'YouTube, Podcasts, Social Media' },
  { id: 'business', icon: <Briefcase className="w-6 h-6" />, label: 'Business Meetings', desc: 'Global teams and presentations' },
  { id: 'education', icon: <GraduationCap className="w-6 h-6" />, label: 'Education', desc: 'Teaching and e-learning' },
  { id: 'personal', icon: <User className="w-6 h-6" />, label: 'Personal Use', desc: 'Travel, communication' },
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Urdu',
  'Russian', 'Turkish', 'Dutch',
]

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Formal, business-appropriate' },
  { id: 'casual', label: 'Casual', desc: 'Natural, conversational' },
  { id: 'energetic', label: 'Energetic', desc: 'Dynamic, enthusiastic' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [useCase, setUseCase] = useState('')
  const [language, setLanguage] = useState('')
  const [tone, setTone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleComplete = async () => {
    setLoading(true)
    setStep(4)

    // Save profile details to local storage for demo mode fallback immediately
    const signupName = typeof window !== 'undefined' ? localStorage.getItem('vocalis_signup_name') : null
    const demoProfile = {
      full_name: signupName || 'Guest User',
      role: useCase,
      primary_language: language,
      tone: tone,
      onboarding_completed: true,
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('vocalis_demo_profile', JSON.stringify(demoProfile))
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({
            role: useCase,
            primary_language: language,
            tone: tone,
            onboarding_completed: true,
          })
          .eq('user_id', user.id)
      }

      // Simulate "setting up" animation
      await new Promise(r => setTimeout(r, 2500))
      router.push('/dashboard')
    } catch (err) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <img src="/logo.png" alt="Vocalis AI Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold text-gray-900">Vocalis <span className="gradient-text">AI</span></span>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s ? 'bg-indigo-600 text-white' : step === s ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How will you use Vocalis AI?</h2>
            <p className="text-gray-500 text-sm mb-6">This helps us personalize your Voice Studio experience.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.id}
                  onClick={() => setUseCase(uc.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${useCase === uc.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${useCase === uc.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {uc.icon}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{uc.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{uc.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!useCase}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your voice preferences</h2>
            <p className="text-gray-500 text-sm mb-6">Set defaults to save time in the Voice Studio.</p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">Primary Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${language === lang ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">Preferred Output Tone</label>
                <div className="grid grid-cols-3 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${tone === t.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!language || !tone}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Review */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set! 🎉</h2>
            <p className="text-gray-500 text-sm mb-6">Here's your personalized Voice Studio setup:</p>

            <div className="space-y-3 mb-8">
              {[
                { label: 'Use Case', value: USE_CASES.find(u => u.id === useCase)?.label || useCase },
                { label: 'Primary Language', value: language },
                { label: 'Output Tone', value: TONES.find(t => t.id === tone)?.label || tone },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleComplete} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Launch Voice Studio <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Loading */}
        {step === 4 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/25">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting up your Voice Studio...</h2>
            <p className="text-gray-500 text-sm">Personalizing your experience</p>

            <div className="mt-8 space-y-3">
              {['Configuring voice profiles', 'Setting up translation preferences', 'Preparing your dashboard'].map((item, i) => (
                <div key={item} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin flex-shrink-0" style={{ animationDelay: `${i * 0.3}s` }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
