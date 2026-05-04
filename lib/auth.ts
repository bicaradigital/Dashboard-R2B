import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return { user, profile }
}

export async function isAdmin() {
  const userData = await getCurrentUser()
  if (!userData) return false

  const { profile } = userData
  return profile?.role === "admin" || profile?.email === "rumahretortbersama1@gmail.com"
}

export async function canEdit() {
  return await isAdmin()
}

export function getPermissions(profile: any) {
  const isAdminUser = profile?.role === "admin" || profile?.email === "rumahretortbersama1@gmail.com"

  return {
    canView: true, // All authenticated users can view
    canEdit: isAdminUser,
    canDelete: isAdminUser,
    canCreate: isAdminUser,
    isAdmin: isAdminUser,
  }
}
