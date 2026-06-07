import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const sourceLabel = sourceLang === 'auto' ? 'detected language' : sourceLang
  
  const prompt = `You are an expert translator. Translate the following text from ${sourceLabel} to ${targetLang}.

CRITICAL RULES:
1. Preserve the original tone, emotion, and style exactly
2. Keep cultural nuances appropriate for the target language
3. Return ONLY the translated text, nothing else
4. Do not add explanations, notes, or quotation marks
5. Maintain the same level of formality as the original

Text to translate:
${text}`

  // Try Gemini first
  try {
    const key = process.env.GEMINI_API_KEY || ''
    if (!key || key.includes('API_KEY_INVALID') || !key.startsWith('AIzaSy')) {
      throw new Error('Invalid Gemini API key format')
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (geminiError: any) {
    console.warn('Gemini translation failed, falling back to Groq:', geminiError.message || geminiError)
    
    // Fallback to Groq with multiple model options
    const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'mixtral-8x7b-32768']
    let lastError = null
    
    for (const model of groqModels) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0,
        })
        const resultText = response.choices[0]?.message?.content?.trim()
        if (resultText) {
          return resultText
        }
      } catch (err: any) {
        lastError = err
        console.warn(`Groq translation with model ${model} failed:`, err.message || err)
      }
    }
    
    throw new Error(`Translation failed. Gemini: ${geminiError.message}. Groq: ${lastError?.message || 'All models failed'}`)
  }
}
