"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

type LoginStep = "email" | "code"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      if (!email || !email.includes("@")) {
        throw new Error("Email tidak valid")
      }

      const response = await fetch("/api/auth/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat kode")
      }

      setSuccess("Kode verifikasi telah dikirim ke email Anda")
      setEmailSent(true)
      
      // For development, show the code if available
      if (data.code) {
        setSuccess(`Kode verifikasi: ${data.code} (Development Only)`)
      }

      setTimeout(() => {
        setStep("code")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      if (!code || code.length < 6) {
        throw new Error("Kode harus 6 digit")
      }

      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          code: code.toString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Kode tidak valid")
      }

      setSuccess("Login berhasil! Redirecting...")
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
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
              <CardTitle className="text-2xl">
                {step === "email" ? "Masuk dengan Kode" : "Verifikasi Kode"}
              </CardTitle>
              <CardDescription>
                {step === "email"
                  ? "Masukkan email Anda untuk menerima kode akses"
                  : "Masukkan kode 6 digit yang telah dikirim ke email Anda"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={step === "email" ? handleRequestCode : handleVerifyCode}
                className="flex flex-col gap-4"
              >
                {step === "email" ? (
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@perusahaan.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || emailSent}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="code">Kode Verifikasi</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      disabled={isLoading}
                      className="text-center text-2xl tracking-widest font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Kode akan dikirim ke: <span className="font-medium">{email}</span>
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setStep("email")
                        setCode("")
                      }}
                      disabled={isLoading}
                    >
                      Ubah Email
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
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
                      Loading...
                    </>
                  ) : step === "email" ? (
                    "Minta Kode"
                  ) : (
                    "Verifikasi & Masuk"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-600">
            Hanya pengguna terdaftar yang dapat masuk dengan kode akses
          </p>
        </div>
      </div>
    </div>
  )
}
