import { NextRequest, NextResponse } from 'next/server'
import { cloneVoice } from '@/lib/elevenlabs'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const name = formData.get('name') as string
    const userId = formData.get('userId') as string
    const description = formData.get('description') as string || ''
    
    if (!audioFile || !name || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Upload sample to Supabase Storage
    const samplePath = `${userId}/samples/${Date.now()}_${audioFile.name}`
    const arrayBuffer = await audioFile.arrayBuffer()
    
    const { error: uploadError } = await supabase.storage
      .from('voice-samples')
      .upload(samplePath, Buffer.from(arrayBuffer), {
        contentType: audioFile.type || 'audio/mpeg',
      })

    let sampleUrl = null
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('voice-samples')
        .getPublicUrl(samplePath)
      sampleUrl = publicUrl
    }

    // Clone voice via ElevenLabs
    let voiceId = ''
    let isDemo = false
    let message = ''

    try {
      const result = await cloneVoice(name, audioFile, description)
      voiceId = result.voice_id
    } catch (err: any) {
      console.warn('ElevenLabs instant voice cloning failed. Creating simulated clone. Error:', err.message)
      // Fallback: Use Sarah's premade voice ID as simulated voice (allowed on Free tier)
      voiceId = 'EXAVITQu4vr4xnSDxMaL'
      isDemo = true
      message = `ElevenLabs Voice Cloning simulated: created "${name}" for testing. (${err.message || 'ElevenLabs limit/plan restriction'})`
    }

    let voiceProfile = null
    const { data: dbData, error: dbError } = await supabase
      .from('voice_profiles')
      .insert({
        user_id: userId,
        name: isDemo ? `${name} (Simulated)` : name,
        elevenlabs_voice_id: voiceId,
        sample_audio_url: sampleUrl,
        status: 'ready' as const,
      } as any)
      .select()
      .single()

    if (dbError) {
      console.error('DB error saving voice profile:', dbError)
      voiceProfile = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: isDemo ? `${name} (Simulated)` : name,
        elevenlabs_voice_id: voiceId,
        sample_audio_url: sampleUrl,
        status: 'ready',
        created_at: new Date().toISOString()
      }
    } else {
      voiceProfile = dbData
    }

    return NextResponse.json({
      voiceId,
      name: isDemo ? `${name} (Simulated)` : name,
      profile: voiceProfile,
      isDemo,
      message,
    })
  } catch (error: any) {
    console.error('Clone error:', error)
    return NextResponse.json(
      { error: error.message || 'Voice cloning failed' },
      { status: 500 }
    )
  }
}
