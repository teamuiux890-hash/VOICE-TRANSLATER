import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json()
    
    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const translated = await translateText(text, sourceLang || 'auto', targetLang)
    
    return NextResponse.json({ translatedText: translated })
  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}
