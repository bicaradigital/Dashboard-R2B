import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

function generateCode(): string {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from("authorized_users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (adminUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from("authorized_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { error: codeError } = await supabase
      .from("login_codes")
      .insert({
        code,
        user_id: targetUser.id,
        email: email.toLowerCase(),
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get("x-forwarded-for") || "admin",
        user_agent: "admin-panel",
      })

    if (codeError) throw codeError

    return NextResponse.json(
      {
        success: true,
        code,
        email,
        expiresAt,
        message: `Kode berhasil dibuat untuk ${email}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Generate code error:", error)
    return NextResponse.json(
      { error: "Gagal membuat kode" },
      { status: 500 }
    )
  }
}
