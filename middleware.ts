// middleware.ts (root)
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

// Protect these routes (plus root)
export const config = {
  matcher: ["/", "/dashboard/:path*", "/invoices/:path*", "/settings/:path*", "/auth/:path*"],
}
