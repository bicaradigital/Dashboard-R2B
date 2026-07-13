import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan kode diperlukan" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Find and validate the code
    const { data: loginCode, error: codeError } = await supabase
      .from("login_codes")
      .select("id, user_id, is_used, expires_at")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .single()

    if (codeError || !loginCode) {
      // Log failed attempt
      await supabase.from("login_history").insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "failed",
        reason: "Kode tidak ditemukan",
      })

      return NextResponse.json(
        { error: "Kode tidak valid" },
        { status: 401 }
      )
    }

    // Check if code is already used
    if (loginCode.is_used) {
      await supabase.from("login_history").insert({
        user_id: loginCode.user_id,
        email: email.toLowerCase(),
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "failed",
        reason: "Kode sudah digunakan",
      })

      return NextResponse.json(
        { error: "Kode sudah digunakan" },
        { status: 401 }
      )
    }

    // Check if code expired
    if (new Date(loginCode.expires_at) < new Date()) {
      await supabase.from("login_history").insert({
        user_id: loginCode.user_id,
        email: email.toLowerCase(),
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "failed",
        reason: "Kode sudah kadaluarsa",
      })

      return NextResponse.json(
        { error: "Kode sudah kadaluarsa" },
        { status: 401 }
      )
    }

    // Mark code as used
    await supabase
      .from("login_codes")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", loginCode.id)

    // Get user info
    const { data: user, error: userError } = await supabase
      .from("authorized_users")
      .select("id, email, name, role")
      .eq("id", loginCode.user_id)
      .single()

    if (userError || !user) {
      await supabase.from("login_history").insert({
        user_id: loginCode.user_id,
        email: email.toLowerCase(),
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "failed",
        reason: "User tidak ditemukan",
      })

      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 401 }
      )
    }

    // Create custom JWT token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: code, // Use code as temporary password
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
      },
    })

    // Log successful login
    await supabase.from("login_history").insert({
      user_id: user.id,
      email: email.toLowerCase(),
      ip_address: ipAddress,
      user_agent: userAgent,
      status: "success",
      reason: "Login berhasil",
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: "Login berhasil",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Verify code error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan, silakan coba lagi" },
      { status: 500 }
    )
  }
}
