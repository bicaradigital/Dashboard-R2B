import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password harus diisi' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error('[v0] Cookie set error:', error)
            }
          },
        },
      }
    )

    // Query user dari database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, full_name, role, is_active')
      .eq('username', username)
      .eq('password', password) // In production, use bcrypt!
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      // Log failed attempt
      await supabase.from('login_logs').insert({
        user_id: null,
        status: 'failed',
      })
      
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Create simple session (use JWT in production)
    const sessionToken = crypto.randomBytes(32).toString('hex')
    
    // Log successful login
    await supabase.from('login_logs').insert({
      user_id: user.id,
      status: 'success',
    })

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    })

    response.cookies.set('user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    response.cookies.set('user_data', JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
    }), {
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
