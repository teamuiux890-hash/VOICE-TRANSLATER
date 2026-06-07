import { create } from 'zustand'
import { PipelineStep, StudioState } from '@/types'

interface StudioStore extends StudioState {
  setIsRecording: (v: boolean) => void
  setAudioBlob: (blob: Blob | null, url: string | null) => void
  setTranscription: (text: string) => void
  setTranslatedText: (text: string) => void
  setOutputAudioUrl: (url: string | null) => void
  setPipelineStep: (step: PipelineStep) => void
  setSelectedVoiceId: (id: string) => void
  setSourceLang: (lang: string) => void
  setTargetLang: (lang: string) => void
  setIsProcessing: (v: boolean) => void
  setError: (error: string | null) => void
  setCurrentTranslationId: (id: string | null) => void
  reset: () => void
}

const initialState: StudioState = {
  isRecording: false,
  audioBlob: null,
  audioUrl: null,
  transcription: '',
  translatedText: '',
  outputAudioUrl: null,
  pipelineStep: 'idle',
  selectedVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Default: Bella
  sourceLang: 'auto',
  targetLang: 'es',
  isProcessing: false,
  error: null,
  currentTranslationId: null,
}

export const useStudioStore = create<StudioStore>((set) => ({
  ...initialState,
  setIsRecording: (v) => set({ isRecording: v }),
  setAudioBlob: (blob, url) => set({ audioBlob: blob, audioUrl: url }),
  setTranscription: (text) => set({ transcription: text }),
  setTranslatedText: (text) => set({ translatedText: text }),
  setOutputAudioUrl: (url) => set({ outputAudioUrl: url }),
  setPipelineStep: (step) => set({ pipelineStep: step }),
  setSelectedVoiceId: (id) => set({ selectedVoiceId: id }),
  setSourceLang: (lang) => set({ sourceLang: lang }),
  setTargetLang: (lang) => set({ targetLang: lang }),
  setIsProcessing: (v) => set({ isProcessing: v }),
  setError: (error) => set({ error }),
  setCurrentTranslationId: (id) => set({ currentTranslationId: id }),
  reset: () => set(initialState),
}))
