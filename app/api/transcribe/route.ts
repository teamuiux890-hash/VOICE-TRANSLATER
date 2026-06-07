import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const result = await transcribeAudio(buffer, audioFile.name || 'audio.wav')
    
    return NextResponse.json({
      text: result.text,
      language: result.language,
    })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}
