import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize Supabase Admin client using Service Role Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user in auth.users with email_confirm: true
    const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (createError) {
      console.error('Admin createUser error:', createError.message)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (user) {
      // Create user profile in profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: name,
          onboarding_completed: false,
        }, { onConflict: 'user_id' })

      if (profileError) {
        console.warn('Profile creation warning via admin:', profileError.message)
      }
    }

    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    console.error('Admin signup endpoint execution failed:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
