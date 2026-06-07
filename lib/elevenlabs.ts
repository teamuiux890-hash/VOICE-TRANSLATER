import { ElevenLabsVoice } from '@/types'

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'
const API_KEY = process.env.ELEVENLABS_API_KEY!

export async function getVoices(): Promise<ElevenLabsVoice[]> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      'xi-api-key': API_KEY,
    },
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error(`ElevenLabs voices fetch failed: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.voices || []
}

export async function synthesizeSpeech(
  text: string,
  voiceId: string,
  modelId: string = 'eleven_multilingual_v2'
): Promise<Buffer> {
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs synthesis failed: ${response.status} ${errorText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function cloneVoice(
  name: string,
  audioFile: File,
  description: string = ''
): Promise<{ voice_id: string; name: string }> {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description)
  formData.append('files', audioFile)
  formData.append('labels', JSON.stringify({ use_case: 'voice_translation' }))

  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Voice cloning failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

export async function deleteVoice(voiceId: string): Promise<void> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': API_KEY,
    },
  })
  if (!response.ok) {
    throw new Error(`Delete voice failed: ${response.statusText}`)
  }
}

export async function getUserSubscription(): Promise<{
  character_count: number
  character_limit: number
  voice_limit: number
  professional_voice_limit: number
}> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
    headers: { 'xi-api-key': API_KEY },
    cache: 'no-store',
  })
  if (!response.ok) return { character_count: 0, character_limit: 10000, voice_limit: 3, professional_voice_limit: 0 }
  return response.json()
}
