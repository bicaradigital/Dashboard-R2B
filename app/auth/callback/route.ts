import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Verifikasi berhasil, redirect ke dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Jika ada error atau tidak ada code, redirect ke halaman verifikasi dengan error
  return NextResponse.redirect(
    new URL("/auth/verify-email?error=verification_failed", request.url)
  )
}
