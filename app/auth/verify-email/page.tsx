"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, Mail } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPending = searchParams.get("pending") === "true"

  useEffect(() => {
    // Auto redirect to dashboard after 3 seconds if verified
    if (!isPending) {
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isPending, router])

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
                {isPending ? "Verifikasi Email Diperlukan" : "Pendaftaran Berhasil!"}
              </CardTitle>
              <CardDescription>
                {isPending
                  ? "Silakan verifikasi email Anda untuk melanjutkan"
                  : "Akun Anda telah dibuat dan diverifikasi"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {isPending ? (
                  <>
                    <div className="flex justify-center">
                      <Mail className="h-16 w-16 text-blue-600" />
                    </div>
                    <Alert>
                      <AlertDescription>
                        Kami telah mengirimkan link verifikasi ke email Anda. Silakan cek email dan klik link tersebut untuk menyelesaikan pendaftaran.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Setelah klik link di email, Anda dapat{" "}
                        <Link href="/auth/login" className="text-primary underline">
                          masuk di sini
                        </Link>
                      </p>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full">
                          Kembali ke Login
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Akun Anda siap digunakan!</p>
                      <p className="text-sm text-gray-600">Anda akan diarahkan ke dashboard dalam beberapa detik...</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-gray-600">Memuat dashboard</span>
                    </div>
                    <Link href="/dashboard">
                      <Button className="w-full bg-primary hover:bg-primary">
                        Masuk ke Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
