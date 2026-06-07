import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  
  // Handle error query parameters from Supabase (e.g. expired link)
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const errorCode = searchParams.get('error_code')

  if (error) {
    console.error('Auth callback error from Supabase:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${error}&error_description=${encodeURIComponent(errorDescription || '')}&error_code=${errorCode || ''}`
    )
  }

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  try {
    let user = null

    // 1. Process code exchange (PKCE flow)
    if (code) {
      const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (!exchangeError && exchangeData?.user) {
        user = exchangeData.user
      } else {
        // If exchange failed, check if we already have an active session
        // (common when links are pre-fetched by email clients or clicked twice)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          user = session.user
        } else if (exchangeError) {
          throw exchangeError
        }
      }
    } 
    // 2. Process token_hash (verify OTP flow, standard email confirmation link)
    else if (token_hash && type) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })
      if (verifyError) throw verifyError
      
      const { data: { user: verifiedUser } } = await supabase.auth.getUser()
      user = verifiedUser
    } 
    // 3. Process existing session fallback (no parameters but user is already logged in)
    else {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user = session.user
      }
    }

    if (user) {
      let onboardingCompleted = false
      
      try {
        // Safe profile fetch with database error catching
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (!profileError && profile) {
          onboardingCompleted = profile.onboarding_completed
        } else {
          // Profile doesn't exist or fetch failed, create it safely
          await supabase.from('profiles').upsert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            onboarding_completed: false,
          }, { onConflict: 'user_id' })
        }
      } catch (dbErr) {
        console.warn('Auth callback database profile operations failed, skipping to onboarding:', dbErr)
      }

      // If onboarding has not been completed, redirect there
      if (!onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  } catch (err: any) {
    console.error('Auth callback execution error:', err.message || err)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Fallback if no user is found and no session could be established
  return NextResponse.redirect(`${origin}/login?error=invalid_request`)
}

