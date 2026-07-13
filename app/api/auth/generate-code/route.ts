import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email tidak valid" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is authorized
    const { data: user, error: userError } = await supabase
      .from("authorized_users")
      .select("id, name")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single()

    if (userError || !user) {
      // Don't reveal whether email exists or not (security)
      return NextResponse.json(
        { error: "Kode verifikasi telah dikirim ke email Anda" },
        { status: 200 }
      )
    }

    // Invalidate any existing active codes for this email
    await supabase
      .from("login_codes")
      .update({ is_used: true })
      .eq("email", email.toLowerCase())
      .eq("is_used", false)
      .lt("expires_at", new Date().toISOString())

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store code in database
    const { error: codeError } = await supabase
      .from("login_codes")
      .insert({
        code,
        user_id: user.id,
        email: email.toLowerCase(),
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })

    if (codeError) {
      console.error("[v0] Error storing code:", codeError)
      return NextResponse.json(
        { error: "Gagal membuat kode, silakan coba lagi" },
        { status: 500 }
      )
    }

    // In production, send code via email
    // For now, return code for testing (remove in production)
    console.log(`[v0] Generated code for ${email}: ${code}`)

    return NextResponse.json(
      { 
        message: "Kode verifikasi telah dikirim ke email Anda",
        // Only in development:
        ...(process.env.NODE_ENV === "development" && { code })
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Generate code error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan, silakan coba lagi" },
      { status: 500 }
    )
  }
}
