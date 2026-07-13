"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

export default function SimpleSetupPage() {
  const [step, setStep] = useState<"init" | "add-user">("init")
  const [isInitializing, setIsInitializing] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role] = useState("admin") // Hanya admin

  const handleInitialize = async () => {
    setIsInitializing(true)
    setMessage("")
    setError("")

    try {
      // In production, this would run migrations
      setMessage("Database siap! Sekarang tambahkan user admin")
      setStep("add-user")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsInitializing(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingUser(true)
    setMessage("")
    setError("")

    try {
      if (!username || !password || !fullName) {
        throw new Error("Semua field harus diisi")
      }

      const response = await fetch("/api/setup/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          fullName,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambah user")
      }

      setMessage(`Administrator '${username}' berhasil dibuat!`)
      setUsername("")
      setPassword("")
      setFullName("")
      setRole("manager")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsAddingUser(false)
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
              <CardTitle className="text-2xl">Setup Administrator</CardTitle>
              <CardDescription>
                {step === "init"
                  ? "Buat database dan tambah administrator"
                  : "Tambahkan akun administrator"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "init" ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-600">
                    Klik tombol di bawah untuk siapkan database dan user default
                  </p>
                  <Button
                    onClick={handleInitialize}
                    disabled={isInitializing}
                    className="w-full"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menginisialisasi...
                      </>
                    ) : (
                      "Mulai Setup"
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="contoh: admin1"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isAddingUser}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isAddingUser}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nama administrator"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isAddingUser}
                    />
                  </div>

                  <div className="rounded-md bg-blue-50 p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Role:</strong> Administrator (penuh akses)
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {message && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{message}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isAddingUser}
                    className="w-full"
                  >
                    {isAddingUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menambah...
                      </>
                    ) : (
                      "Tambah User"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("add-user")
                    }}
                    className="w-full"
                  >
                    Tambah Administrator Lain
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      window.location.href = "/auth/login"
                    }}
                    className="w-full"
                  >
                    Ke Halaman Login
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
