import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email tidak valid" },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: "Nama harus diisi" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create admin user
    const { data, error } = await supabase
      .from("authorized_users")
      .insert({
        email: email.toLowerCase(),
        name,
        role: "admin",
        is_active: true
      })
      .select()

    if (error) {
      console.error("[v0] Error creating admin:", error)
      return NextResponse.json(
        { error: error.message || "Gagal membuat admin user" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin user berhasil dibuat",
        user: data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Create admin error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat admin" },
      { status: 500 }
    )
  }
}
