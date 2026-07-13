import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password, fullName, role } = await request.json()

    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    if (!['admin', 'manager', 'director'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
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
              console.error('[v0] Cookie error:', error)
            }
          },
        },
      }
    )

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username,
        password, // In production, use bcrypt!
        full_name: fullName,
        role,
        is_active: true,
      })
      .select()

    if (insertError) {
      console.error('[v0] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Gagal menambah user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User '${username}' berhasil dibuat`,
      user: newUser,
    })
  } catch (error) {
    console.error('[v0] Setup error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
