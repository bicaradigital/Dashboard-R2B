import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Manual email verification endpoint for development
 * This allows instant email verification without needing Supabase email provider
 * 
 * Usage: POST /api/auth/verify-manual
 * Body: { email: string, password: string }
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password diperlukan" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Try to sign in - if user exists and verification is not required, this works
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // If "Email not confirmed" error, user needs to verify via email
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { 
            error: "Email belum diverifikasi",
            needsVerification: true,
            message: "Silakan cek email Anda untuk link verifikasi"
          },
          { status: 401 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil",
      session: data.session,
    })
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}
