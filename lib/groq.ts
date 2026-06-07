import Groq from 'groq-sdk'

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'placeholder_groq_key',
})

export async function transcribeAudio(audioBuffer: Buffer, filename: string = 'audio.wav'): Promise<{
  text: string
  language?: string
}> {
  const file = new File([audioBuffer], filename, { type: 'audio/wav' })
  
  const transcription = await groqClient.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    response_format: 'verbose_json',
    temperature: 0,
  })

  return {
    text: transcription.text,
    language: (transcription as any).language,
  }
}
