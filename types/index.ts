// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          industry: string | null
          primary_language: string | null
          tone: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          industry?: string | null
          primary_language?: string | null
          tone?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          industry?: string | null
          primary_language?: string | null
          tone?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
      }
      translations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          input_audio_url: string | null
          output_audio_url: string | null
          source_language: string | null
          target_language: string | null
          transcription: string | null
          translated_text: string | null
          voice_id: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          input_audio_url?: string | null
          output_audio_url?: string | null
          source_language?: string | null
          target_language?: string | null
          transcription?: string | null
          translated_text?: string | null
          voice_id?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          title?: string | null
          output_audio_url?: string | null
          transcription?: string | null
          translated_text?: string | null
        }
      }
      voice_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          elevenlabs_voice_id: string | null
          sample_audio_url: string | null
          status: 'training' | 'ready' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          elevenlabs_voice_id?: string | null
          sample_audio_url?: string | null
          status?: 'training' | 'ready' | 'failed'
          created_at?: string
        }
        Update: {
          elevenlabs_voice_id?: string | null
          status?: 'training' | 'ready' | 'failed'
        }
      }
      usage_stats: {
        Row: {
          id: string
          user_id: string
          month: string
          minutes_transcribed: number
          characters_synthesized: number
          tokens_used: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          minutes_transcribed?: number
          characters_synthesized?: number
          tokens_used?: number
        }
        Update: {
          minutes_transcribed?: number
          characters_synthesized?: number
          tokens_used?: number
          updated_at?: string
        }
      }
    }
  }
}

// App Types
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type Translation = Database['public']['Tables']['translations']['Row']
export type VoiceProfile = Database['public']['Tables']['voice_profiles']['Row']
export type UsageStats = Database['public']['Tables']['usage_stats']['Row']

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description?: string
  preview_url?: string
  labels?: Record<string, string>
}

export type PipelineStep = 'idle' | 'recording' | 'transcribing' | 'translating' | 'synthesizing' | 'done' | 'error'

export interface StudioState {
  isRecording: boolean
  audioBlob: Blob | null
  audioUrl: string | null
  transcription: string
  translatedText: string
  outputAudioUrl: string | null
  pipelineStep: PipelineStep
  selectedVoiceId: string
  sourceLang: string
  targetLang: string
  isProcessing: boolean
  error: string | null
  currentTranslationId: string | null
}

export const LANGUAGES = [
  { code: 'auto', label: 'Auto Detect' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh', label: 'Chinese (Mandarin)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ur', label: 'Urdu' },
  { code: 'tr', label: 'Turkish' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'cs', label: 'Czech' },
  { code: 'ro', label: 'Romanian' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'el', label: 'Greek' },
  { code: 'he', label: 'Hebrew' },
  { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'fa', label: 'Persian' },
  { code: 'bn', label: 'Bengali' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ta', label: 'Tamil' },
]
