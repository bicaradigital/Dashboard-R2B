import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET: List all authorized users
export async function GET(request: NextRequest) {
  try {
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

    // Get all users
    const { data: users, error } = await supabase
      .from("authorized_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(users || [])
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    )
  }
}

// POST: Add new authorized user
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

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

    // Add new user
    const { data: newUser, error } = await supabase
      .from("authorized_users")
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("[v0] Add user error:", error)
    return NextResponse.json(
      { error: "Gagal menambah pengguna" },
      { status: 500 }
    )
  }
}
