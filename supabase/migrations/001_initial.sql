-- ====================================================
-- VOCALIS AI - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================
-- PROFILES TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  industry TEXT,
  primary_language TEXT DEFAULT 'en',
  tone TEXT DEFAULT 'professional',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================
-- TRANSLATIONS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  input_audio_url TEXT,
  output_audio_url TEXT,
  source_language TEXT,
  target_language TEXT,
  transcription TEXT,
  translated_text TEXT,
  voice_id TEXT,
  duration_seconds DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================
-- VOICE PROFILES TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.voice_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  elevenlabs_voice_id TEXT,
  sample_audio_url TEXT,
  status TEXT DEFAULT 'training' CHECK (status IN ('training', 'ready', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================
-- USAGE STATS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- format: YYYY-MM
  minutes_transcribed DECIMAL(10, 3) DEFAULT 0,
  characters_synthesized INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ====================================================
-- ROW LEVEL SECURITY POLICIES
-- ====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Translations Policies
CREATE POLICY "Users can view own translations" ON public.translations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own translations" ON public.translations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own translations" ON public.translations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own translations" ON public.translations
  FOR DELETE USING (auth.uid() = user_id);

-- Voice Profiles Policies
CREATE POLICY "Users can view own voice profiles" ON public.voice_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voice profiles" ON public.voice_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voice profiles" ON public.voice_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own voice profiles" ON public.voice_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Usage Stats Policies
CREATE POLICY "Users can view own usage" ON public.usage_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role bypass (for API routes)
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all translations" ON public.translations
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all voice_profiles" ON public.voice_profiles
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all usage_stats" ON public.usage_stats
  FOR ALL USING (auth.role() = 'service_role');

-- ====================================================
-- STORAGE BUCKETS (create via Supabase Dashboard or:)
-- ====================================================
-- Run these separately if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-inputs', 'audio-inputs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-outputs', 'audio-outputs', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('voice-samples', 'voice-samples', false);

-- Storage Policies for audio-outputs (public read)
CREATE POLICY "Public read on audio-outputs" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-outputs');

CREATE POLICY "Authenticated upload to audio-outputs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-outputs' AND auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Authenticated upload to audio-inputs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-inputs' AND auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Authenticated upload to voice-samples" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'voice-samples' AND auth.role() IN ('authenticated', 'service_role'));

-- ====================================================
-- UPDATED_AT TRIGGER
-- ====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_usage_stats_updated_at
  BEFORE UPDATE ON public.usage_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ====================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'avatar', ''),
    FALSE
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
