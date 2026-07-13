import { NextResponse } from 'next/server'

export async function POST() {
  console.log('[v0] Logout - clearing session')
  
  const response = NextResponse.json({ 
    success: true,
    message: 'Logout berhasil'
  })
  
  // Clear session cookies
  response.cookies.delete('user_session')
  response.cookies.delete('user_data')
  
  return response
}
