"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getPermissions } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireEdit?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export default function AuthGuard({
  children,
  requireEdit = false,
  requireAdmin = false,
  fallback = null,
}: AuthGuardProps) {
  const [permissions, setPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkPermissions() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setPermissions({ canView: false, canEdit: false, isAdmin: false })
        setLoading(false)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      const userPermissions = getPermissions(profile)
      setPermissions(userPermissions)
      setLoading(false)
    }

    checkPermissions()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>
  }

  if (!permissions?.canView) {
    return fallback || <div className="text-center p-4 text-muted-foreground">Access denied</div>
  }

  if (requireEdit && !permissions?.canEdit) {
    return fallback || <div className="text-center p-4 text-muted-foreground">Edit access required</div>
  }

  if (requireAdmin && !permissions?.isAdmin) {
    return fallback || <div className="text-center p-4 text-muted-foreground">Admin access required</div>
  }

  return <>{children}</>
}
