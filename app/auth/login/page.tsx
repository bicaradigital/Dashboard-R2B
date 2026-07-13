"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordInput } from "@/components/password-input"
import Image from "next/image"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!username || !password) {
        throw new Error("Username dan password harus diisi")
      }

      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login gagal")
      }

      // Redirect to dashboard
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Image src="/images/r2b-logo.png" alt="R2B Logo" width={80} height={80} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-gray-900">R2B Laporan Keuangan</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Masuk</CardTitle>
              <CardDescription>
                Masukkan username dan password Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <PasswordInput
                  id="password"
                  label="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  disabled={isLoading}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Masuk...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-600">
            Roles: Admin, Manager, atau Director
          </p>
        </div>
      </div>
    </div>
  )
}
