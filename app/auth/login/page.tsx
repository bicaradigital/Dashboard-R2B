"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        // Provide helpful error messages
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Email belum dikonfirmasi. Silakan cek email Anda untuk link verifikasi.")
        }
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email atau password salah. Silakan coba lagi.")
        }
        throw error
      }
      
      // redirect ke dashboard
      router.push("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat login"
      console.error("[v0] Login error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-yellow-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Image src="/images/r2b-logo.png" alt="R2B Logo" width={80} height={80} />
            <h1 className="text-2xl font-bold text-gray-900">R2B Laporan Keuangan</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Masuk</CardTitle>
              <CardDescription>Masukkan email dan password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? "Masuk..." : "Masuk"}</Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Belum punya akun? <Link href="/auth/signup" className="text-primary underline">Daftar</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
