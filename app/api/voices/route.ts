import { NextResponse } from 'next/server'
import { getVoices } from '@/lib/elevenlabs'

export async function GET() {
  try {
    const voices = await getVoices()
    return NextResponse.json({ voices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices', voices: [] },
      { status: 500 }
    )
  }
}
