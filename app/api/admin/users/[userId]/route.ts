import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Prevent admin from deleting themselves
    if (user.id === params.userId) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus akun sendiri" },
        { status: 400 }
      )
    }

    // Delete user and their associated codes
    const { error } = await supabase
      .from("authorized_users")
      .delete()
      .eq("id", params.userId)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus pengguna" },
      { status: 500 }
    )
  }
}
