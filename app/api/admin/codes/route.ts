import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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

    // Get all codes
    const { data: codes, error } = await supabase
      .from("login_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json(codes || [])
  } catch (error) {
    console.error("[v0] Get codes error:", error)
    return NextResponse.json(
      { error: "Failed to get codes" },
      { status: 500 }
    )
  }
}
