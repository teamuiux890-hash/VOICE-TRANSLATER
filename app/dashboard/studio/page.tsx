'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStudioStore } from '@/store/useStudioStore'
import { LANGUAGES, ElevenLabsVoice, VoiceProfile } from '@/types'
import {
  Mic, MicOff, Upload, Play, Pause, Download, Save,
  ChevronDown, Loader2, Check, X, RotateCcw, Volume2,
  FileAudio, Wand2, Globe, AlertCircle
} from 'lucide-react'

const PIPELINE_STEPS = [
  { key: 'recording', label: 'Input' },
  { key: 'transcribing', label: 'Transcribe' },
  { key: 'translating', label: 'Translate' },
  { key: 'synthesizing', label: 'Synthesize' },
]

function PipelineStatus({ current }: { current: string }) {
  const order = ['recording', 'transcribing', 'translating', 'synthesizing', 'done']
  const currentIdx = order.indexOf(current)

  return (
    <div className="flex items-center gap-2">
      {PIPELINE_STEPS.map((step, i) => {
        const stepIdx = order.indexOf(step.key)
        const isDone = current === 'done' || currentIdx > stepIdx
        const isActive = current === step.key
        const isPending = currentIdx < stepIdx && current !== 'done'

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium transition-all ${isDone ? 'text-green-600' : isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? 'bg-green-500 border-green-500 text-white' : isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                {isDone ? <Check className="w-3 h-3" /> : isActive ? <Loader2 className="w-3 h-3 animate-spin text-indigo-500" /> : <span className="text-gray-400">{i + 1}</span>}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`w-8 h-0.5 transition-all ${isDone && currentIdx > stepIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function VoiceStudioPage() {
  const {
    isRecording, audioBlob, audioUrl, transcription, translatedText, outputAudioUrl,
    pipelineStep, selectedVoiceId, sourceLang, targetLang, isProcessing, error,
    setIsRecording, setAudioBlob, setTranscription, setTranslatedText,
    setOutputAudioUrl, setPipelineStep, setSelectedVoiceId, setSourceLang,
    setTargetLang, setIsProcessing, setError, setCurrentTranslationId, reset,
  } = useStudioStore()

  const [voices, setVoices] = useState<ElevenLabsVoice[]>([])
  const [clonedVoices, setClonedVoices] = useState<VoiceProfile[]>([])
  const [user, setUser] = useState<any>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlayingInput, setIsPlayingInput] = useState(false)
  const [isPlayingOutput, setIsPlayingOutput] = useState(false)
  const [voiceTab, setVoiceTab] = useState<'default' | 'cloned'>('default')
  const [dragOver, setDragOver] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputAudioRef = useRef<HTMLAudioElement | null>(null)
  const outputAudioRef = useRef<HTMLAudioElement | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch ElevenLabs voices
      fetch('/api/voices')
        .then(r => r.json())
        .then(d => setVoices(d.voices || []))
        .catch(() => {})

      if (user) {
        // Fetch cloned voices
        supabase.from('voice_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'ready')
          .then(({ data, error }) => {
            if (error || !data) throw error || new Error('No data')
            setClonedVoices(data)
            localStorage.setItem(`vocalis_voice_profiles_${user.id}`, JSON.stringify(data))
          })
          .catch(() => {
            const localData = localStorage.getItem(`vocalis_voice_profiles_${user.id}`)
            if (localData) {
              setClonedVoices(JSON.parse(localData))
            }
          })
      } else {
        const localData = localStorage.getItem('vocalis_voice_profiles_guest')
        if (localData) {
          setClonedVoices(JSON.parse(localData))
        }
      }
    }
    init()
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob, url)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setPipelineStep('recording')
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch (err: any) {
      setError('Microphone access denied. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      setPipelineStep('idle')
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setAudioBlob(file, url)
    setPipelineStep('idle')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i))) {
      handleFileUpload(file)
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) { setError('Please record or upload audio first'); return }
    setIsProcessing(true)
    setError(null)
    setWarningMessage(null)
    setTranscription('')
    setTranslatedText('')
    setOutputAudioUrl(null)
    setPipelineStep('transcribing')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      const transcribeRes = await fetch('/api/transcribe', { method: 'POST', body: formData })
      if (!transcribeRes.ok) throw new Error('Transcription failed')
      const transcribeData = await transcribeRes.json()
      setTranscription(transcribeData.text)
      setPipelineStep('idle')
    } catch (err: any) {
      setError(err.message || 'Transcription failed')
      setPipelineStep('idle')
    } finally {
      setIsProcessing(false)
    }
  }

  const translateText = async () => {
    if (!transcription) { setError('Please generate or enter transcription text first'); return }
    if (!targetLang) { setError('Please select a target language'); return }
    setIsProcessing(true)
    setError(null)
    setWarningMessage(null)
    setTranslatedText('')
    setOutputAudioUrl(null)
    setPipelineStep('translating')

    try {
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription, sourceLang, targetLang }),
      })
      if (!translateRes.ok) throw new Error('Translation failed')
      const translateData = await translateRes.json()
      setTranslatedText(translateData.translatedText)
      setPipelineStep('idle')
    } catch (err: any) {
      setError(err.message || 'Translation failed')
      setPipelineStep('idle')
    } finally {
      setIsProcessing(false)
    }
  }

  const synthesizeVoice = async () => {
    if (!translatedText) { setError('Please generate or enter translation text first'); return }
    if (!selectedVoiceId) { setError('Please select an output voice'); return }
    setIsProcessing(true)
    setError(null)
    setWarningMessage(null)
    setOutputAudioUrl(null)
    setPipelineStep('synthesizing')

    try {
      // 1. Create translation record first
      let translationId = null
      const localTrans = {
        id: 'local_' + Date.now(),
        title: transcription.slice(0, 50) || 'Untitled Translation',
        source_language: sourceLang,
        target_language: targetLang,
        transcription: transcription,
        translated_text: translatedText,
        voice_id: selectedVoiceId,
        created_at: new Date().toISOString(),
        output_audio_url: '',
      }

      if (user) {
        try {
          const { data } = await supabase.from('translations').insert({
            user_id: user.id,
            title: localTrans.title,
            source_language: localTrans.source_language,
            target_language: localTrans.target_language,
            transcription: localTrans.transcription,
            translated_text: localTrans.translated_text,
            voice_id: localTrans.voice_id,
          }).select().single()
          if (data) { translationId = data.id; setCurrentTranslationId(data.id) }
        } catch (dbErr) {
          console.warn('Could not save translation to DB:', dbErr)
        }
      } else {
        // Save to local storage for demo mode
        const existing = localStorage.getItem('vocalis_local_translations')
        const list = existing ? JSON.parse(existing) : []
        list.unshift(localTrans)
        localStorage.setItem('vocalis_local_translations', JSON.stringify(list))
        translationId = localTrans.id
        setCurrentTranslationId(localTrans.id)
      }

      // 2. Synthesize audio
      const synthRes = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translatedText,
          voiceId: selectedVoiceId,
          translationId: user ? translationId : null,
          userId: user?.id,
          targetLang,
        }),
      })
      if (!synthRes.ok) throw new Error('Synthesis failed')
      const synthData = await synthRes.json()

      if (synthData.isFallback) {
        setWarningMessage(synthData.warning || 'Plan restriction: fell back to a default voice.')
      }

      // Play from URL or base64
      const audioUrlResult = synthData.outputAudioUrl || `data:audio/mpeg;base64,${synthData.audioBase64}`
      setOutputAudioUrl(audioUrlResult)

      if (!user && translationId) {
        // Update local storage record with the output audio url
        const existing = localStorage.getItem('vocalis_local_translations')
        if (existing) {
          const list = JSON.parse(existing)
          const index = list.findIndex((x: any) => x.id === translationId)
          if (index !== -1) {
            list[index].output_audio_url = audioUrlResult
            localStorage.setItem('vocalis_local_translations', JSON.stringify(list))
          }
        }
      }

      setPipelineStep('done')
    } catch (err: any) {
      setError(err.message || 'Synthesis failed')
      setPipelineStep('idle')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadOutput = () => {
    if (!outputAudioUrl) return
    const a = document.createElement('a')
    a.href = outputAudioUrl
    a.download = `vocalis-${Date.now()}.mp3`
    a.click()
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const selectedVoiceName = voiceTab === 'cloned'
    ? clonedVoices.find(v => v.elevenlabs_voice_id === selectedVoiceId)?.name
    : voices.find(v => v.voice_id === selectedVoiceId)?.name || 'Select Voice'

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice Studio</h1>
          <p className="text-gray-500 text-sm">Record, translate, and synthesize in your voice</p>
        </div>
        {(pipelineStep !== 'idle' && pipelineStep !== 'recording') && (
          <PipelineStatus current={pipelineStep} />
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Input Panel */}
        <div className="space-y-4">
          {/* Input Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-500" /> Audio Input
            </h2>

            {/* Recorder */}
            <div className="text-center mb-6">
              <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 transition-all cursor-pointer ${isRecording ? 'bg-red-500 shadow-lg shadow-red-500/40 scale-110' : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:scale-105'}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <div className="w-8 h-8 bg-white rounded-sm" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </div>

              {isRecording ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1 h-12">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="wave-bar" style={{ height: `${Math.random() * 30 + 10}px`, animationDelay: `${(i * 0.07) % 1}s` }} />
                    ))}
                  </div>
                  <p className="text-red-500 font-mono font-bold text-lg">{formatTime(recordingTime)}</p>
                  <button onClick={stopRecording} className="btn-secondary text-sm py-2 px-6">
                    <MicOff className="w-4 h-4 inline mr-1.5" /> Stop Recording
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Click to Record</p>
                  <p className="text-gray-400 text-xs">or drag & drop below</p>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
            >
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Upload MP3, WAV, M4A</p>
              </label>
            </div>

            {/* Input Audio Preview */}
            {audioUrl && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!inputAudioRef.current) {
                      inputAudioRef.current = new Audio(audioUrl)
                      inputAudioRef.current.onended = () => setIsPlayingInput(false)
                    }
                    if (isPlayingInput) { inputAudioRef.current.pause(); setIsPlayingInput(false) }
                    else { inputAudioRef.current.play(); setIsPlayingInput(true) }
                  }}
                  className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0"
                >
                  {isPlayingInput ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <p className="text-xs font-medium text-indigo-700">Input audio ready</p>
                  <div className="h-1 bg-indigo-200 rounded-full mt-1" />
                </div>
                <button onClick={() => { setAudioBlob(null, null); setPipelineStep('idle') }} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Language Config */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Language Settings
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Source Language</label>
                <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="input-field text-sm py-2.5">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Target Language</label>
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="input-field text-sm py-2.5">
                  {LANGUAGES.filter(l => l.code !== 'auto').map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-500" /> Output Voice
            </h2>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setVoiceTab('default')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${voiceTab === 'default' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Default Voices
              </button>
              <button onClick={() => setVoiceTab('cloned')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${voiceTab === 'cloned' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                My Cloned Voices ({clonedVoices.length})
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {voiceTab === 'default' ? (
                voices.length > 0 ? voices.slice(0, 12).map(v => (
                  <button
                    key={v.voice_id}
                    onClick={() => setSelectedVoiceId(v.voice_id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${selectedVoiceId === v.voice_id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {v.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.category || 'Voice'}</p>
                    </div>
                    {selectedVoiceId === v.voice_id && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                  </button>
                )) : (
                  <div className="text-center py-4 text-sm text-gray-400">Loading voices...</div>
                )
              ) : (
                clonedVoices.length > 0 ? clonedVoices.map(v => (
                  <button
                    key={v.id}
                    onClick={() => v.elevenlabs_voice_id && setSelectedVoiceId(v.elevenlabs_voice_id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${selectedVoiceId === v.elevenlabs_voice_id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {v.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                      <p className="text-xs text-green-500">Cloned voice</p>
                    </div>
                    {selectedVoiceId === v.elevenlabs_voice_id && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                  </button>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">No cloned voices yet</p>
                    <a href="/dashboard/cloning" className="text-xs text-indigo-600 hover:underline">Create one →</a>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Step-by-Step Action Pipeline */}
          <div className="space-y-3 pt-2">
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            {warningMessage && (
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <span>{warningMessage}</span>
              </div>
            )}

            {/* Step 1: Transcribe */}
            <button
              onClick={transcribeAudio}
              disabled={isProcessing || !audioBlob}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                transcription 
                  ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100/50 cursor-pointer' 
                  : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {pipelineStep === 'transcribing' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Transcribing Audio...</>
              ) : transcription ? (
                <><Check className="w-4 h-4" /> 1. Audio Transcribed (Re-run)</>
              ) : (
                <><Mic className="w-4 h-4" /> 1. Generate Transcription</>
              )}
            </button>

            {/* Step 2: Translate */}
            <button
              onClick={translateText}
              disabled={isProcessing || !transcription}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                !transcription
                  ? 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed'
                  : translatedText
                  ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100/50 cursor-pointer'
                  : 'btn-primary cursor-pointer'
              }`}
            >
              {pipelineStep === 'translating' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Translating Text...</>
              ) : translatedText ? (
                <><Check className="w-4 h-4" /> 2. Text Translated (Re-run)</>
              ) : (
                <><Globe className="w-4 h-4" /> 2. Translate Text</>
              )}
            </button>

            {/* Step 3: Synthesize */}
            <button
              onClick={synthesizeVoice}
              disabled={isProcessing || !translatedText}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                !translatedText
                  ? 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed'
                  : pipelineStep === 'done'
                  ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100/50 cursor-pointer'
                  : 'btn-primary cursor-pointer'
              }`}
            >
              {pipelineStep === 'synthesizing' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Voice...</>
              ) : pipelineStep === 'done' ? (
                <><Check className="w-4 h-4" /> 3. Voice Synthesized (Re-run)</>
              ) : (
                <><Wand2 className="w-4 h-4" /> 3. Synthesize Voice</>
              )}
            </button>
          </div>

          {(audioBlob || pipelineStep !== 'idle') && (
            <button onClick={() => { reset(); setWarningMessage(null); }} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mt-3">
              <RotateCcw className="w-4 h-4" /> Reset Studio
            </button>
          )}
        </div>

        {/* RIGHT: Output Panel */}
        <div className="space-y-4">
          {/* Transcription */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-indigo-500" /> Transcription
              {pipelineStep === 'transcribing' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-auto" />}
            </h2>
            <div className="min-h-24 rounded-xl overflow-hidden">
              {transcription ? (
                <textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="w-full min-h-24 p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-sm text-gray-700 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
                  placeholder="Edit your transcription here..."
                />
              ) : (
                <div className="min-h-24 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400 italic">
                    {pipelineStep === 'transcribing' ? 'Transcribing with Groq Whisper...' : 'Transcription will appear here after processing'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Translation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Translation
              {pipelineStep === 'translating' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-auto" />}
            </h2>
            <div className="min-h-24 rounded-xl overflow-hidden">
              {translatedText ? (
                <textarea
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="w-full min-h-24 p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-sm text-gray-700 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
                  placeholder="Edit your translation here..."
                />
              ) : (
                <div className="min-h-24 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400 italic">
                    {pipelineStep === 'translating' ? 'Translating with Gemini AI...' : 'Translated text will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Output Audio Player */}
          <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${pipelineStep === 'done' ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-violet-50/50' : 'border-gray-100'}`}>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-500" /> Output Audio
              {pipelineStep === 'synthesizing' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-auto" />}
              {pipelineStep === 'done' && <Check className="w-4 h-4 text-green-500 ml-auto" />}
            </h2>

            {outputAudioUrl ? (
              <div className="space-y-4">
                {/* Audio Player */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <button
                    onClick={() => {
                      if (!outputAudioRef.current) {
                        outputAudioRef.current = new Audio(outputAudioUrl)
                        outputAudioRef.current.onended = () => setIsPlayingOutput(false)
                      }
                      if (isPlayingOutput) { outputAudioRef.current.pause(); setIsPlayingOutput(false) }
                      else {
                        if (outputAudioRef.current.src !== outputAudioUrl) {
                          outputAudioRef.current = new Audio(outputAudioUrl)
                          outputAudioRef.current.onended = () => setIsPlayingOutput(false)
                        }
                        outputAudioRef.current.play()
                        setIsPlayingOutput(true)
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 hover:bg-indigo-700 transition-colors"
                  >
                    {isPlayingOutput ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2 h-8">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="wave-bar flex-1"
                          style={{
                            height: `${Math.sin(i * 0.5) * 10 + 15}px`,
                            animationPlayState: isPlayingOutput ? 'running' : 'paused',
                            animationDelay: `${(i * 0.05) % 1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={downloadOutput} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                    <Download className="w-4 h-4" /> Download MP3
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed ${pipelineStep === 'synthesizing' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
                {pipelineStep === 'synthesizing' ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-indigo-600 font-medium">Synthesizing with ElevenLabs...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Volume2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Translated audio will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pipeline Steps visual */}
          {isProcessing && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Progress</h3>
              <PipelineStatus current={pipelineStep} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
