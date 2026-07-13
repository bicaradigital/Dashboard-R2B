// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuth = pathname.startsWith("/auth")
  const isSetup = pathname.startsWith("/setup") || pathname.startsWith("/simple-setup")

  // Check for user session cookie
  const userSessionCookie = request.cookies.get('user_session')
  const userDataCookie = request.cookies.get('user_data')
  const hasSession = userSessionCookie?.value && userDataCookie?.value

  // If no session and trying to access protected route → go to login
  if (!hasSession && !isAuth && !isSetup && pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If already logged in and on login page → go to dashboard
  if (hasSession && pathname === "/auth/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Allow all requests to pass through
  return NextResponse.next()
}
