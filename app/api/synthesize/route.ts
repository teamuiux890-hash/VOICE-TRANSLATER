import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/elevenlabs'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, translationId, userId, targetLang } = await req.json()
    
    if (!text || !voiceId) {
      return NextResponse.json({ error: 'Missing text or voiceId' }, { status: 400 })
    }

    // Synthesize audio via ElevenLabs
    let audioBuffer: Buffer
    let isFallback = false
    let warning = ''
    try {
      audioBuffer = await synthesizeSpeech(text, voiceId)
    } catch (err: any) {
      const errMsg = err.message || ''
      if (errMsg.includes('paid_plan_required') || errMsg.includes('payment_required') || errMsg.includes('Free users cannot use library voices') || errMsg.includes('400') || errMsg.includes('401') || errMsg.includes('403')) {
        console.warn(`Selected voice ID ${voiceId} failed due to ElevenLabs plan limits. Falling back to default premade voice EXAVITQu4vr4xnSDxMaL.`)
        audioBuffer = await synthesizeSpeech(text, 'EXAVITQu4vr4xnSDxMaL')
        isFallback = true
        warning = 'ElevenLabs plan restrictions detected for the selected voice. Fell back to the default Bella/Sarah voice. Connect a Starter/Creator ElevenLabs API key to use your custom voice.'
      } else {
        throw err
      }
    }
    
    // Upload to Supabase Storage
    const supabase = await createServiceClient()
    const filename = `${userId || 'anon'}/${Date.now()}_output.mp3`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-outputs')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      // Still return audio as base64 if storage fails
      const base64 = audioBuffer.toString('base64')
      return NextResponse.json({
        audioBase64: base64,
        outputAudioUrl: null,
        isFallback,
        warning,
        error: 'Storage upload failed but audio generated',
      })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio-outputs')
      .getPublicUrl(filename)

    // Update translation record if translationId provided
    const db = supabase as any
    if (translationId && userId) {
      await db
        .from('translations')
        .update({ output_audio_url: publicUrl })
        .eq('id', translationId)

      // Update usage stats
      const month = new Date().toISOString().slice(0, 7)
      const { data: existing } = await db
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .single()

      if (existing) {
        await db
          .from('usage_stats')
          .update({ characters_synthesized: existing.characters_synthesized + text.length })
          .eq('id', existing.id)
      } else {
        await db.from('usage_stats').insert({
          user_id: userId,
          month,
          characters_synthesized: text.length,
        })
      }
    }

    const base64 = audioBuffer.toString('base64')
    return NextResponse.json({
      audioBase64: base64,
      outputAudioUrl: publicUrl,
      isFallback,
      warning,
    })
  } catch (error: any) {
    console.error('Synthesis error:', error)
    return NextResponse.json(
      { error: error.message || 'Synthesis failed' },
      { status: 500 }
    )
  }
}
